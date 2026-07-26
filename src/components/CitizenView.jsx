import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileText, MapPin, Clock, CheckCircle, AlertCircle,
  User, LogOut, ChevronRight, ChevronLeft, Camera, Activity, Building2,
  Droplets, Waypoints, Sparkles, Send, Navigation, LayoutDashboard,
  Map as MapIcon, Loader2, RefreshCw, Eye
} from "lucide-react";
import GovtMap from "./GovtMap";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const CATEGORIES = [
  { id: "road", label: "Roads & Highways", icon: Waypoints, color: "#5de6ff", desc: "Potholes, cracks, rutting" },
  { id: "building", label: "Buildings & Walls", icon: Building2, color: "#ffd76b", desc: "Structural cracks, spalling, leaks" },
  { id: "pipeline", label: "Pipelines & Utilities", icon: Droplets, color: "#4edea3", desc: "Pipe bursts, water leaks, rust" },
  { id: "bridge", label: "Bridges & Flyovers", icon: Activity, color: "#ff80ea", desc: "Joint defects, concrete degradation" },
];

const STATUS_COLORS = {
  submitted: { color: "#ffd76b", label: "Received", icon: Clock },
  under_review: { color: "#ff9f43", label: "Under Review by Inspector", icon: Eye },
  acknowledged: { color: "#ff9f43", label: "Under Review by Inspector", icon: Eye },
  assigned: { color: "#ff9f43", label: "Assigned to Contractor", icon: User },
  in_progress: { color: "#5de6ff", label: "Repair In Progress", icon: Activity },
  fixed: { color: "#4edea3", label: "Fixed & Closed", icon: CheckCircle },
};

function StatCard({ icon: Icon, value, label, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 flex items-center gap-4"
    >
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}18` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-white">{value}</p>
        <p className="text-[11px] text-white/40 mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
}

export default function CitizenView({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("home");
  const [collapsed, setCollapsed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("building");

  // Media & AI Analysis State
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [submittedReport, setSubmittedReport] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [myReports, setMyReports] = useState([]);
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState("");
  const [lat, setLat] = useState("19.0760");
  const [lng, setLng] = useState("72.8777");
  const [locLoading, setLocLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState("");

  useEffect(() => {
    fetchMyReports();
    const interval = setInterval(fetchMyReports, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchMyReports = async () => {
    try {
      const res = await fetch(`${API_URL}/public/reports/map`);
      if (res.ok) {
        const data = await res.json();
        const all = data.reports || [];
        const citizenName = String(user?.name || "").toLowerCase().trim();
        const citizenUser = String(user?.username || "").toLowerCase().trim();

        const filtered = all.filter((r) => {
          if (!r) return false;
          if (!citizenName && !citizenUser) return false;
          const rep = String(r.reporter || "").toLowerCase().trim();
          return (
            rep === citizenName ||
            rep === citizenUser ||
            (citizenName && rep.includes(citizenName)) ||
            (citizenUser && rep.includes(citizenUser))
          );
        });
        setMyReports(filtered);
      }
    } catch { /* silent fallback */ }
  };

  const handleDetectLiveLocation = () => {
    if (!navigator.geolocation) {
      setUploadError("Geolocation is not supported by your browser");
      return;
    }
    setLocLoading(true);
    setGpsStatus("");
    setUploadError("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latitude = pos.coords.latitude.toFixed(4);
        const longitude = pos.coords.longitude.toFixed(4);
        setLat(latitude);
        setLng(longitude);

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const landmark = addr.road || addr.suburb || addr.neighbourhood || addr.city || "Current Location";
            const fullLoc = `${landmark}, ${addr.city || addr.state || ""}`.replace(/^,\s*/, "").replace(/,\s*$/, "");
            setLocationName(fullLoc || `Live GPS (${latitude}, ${longitude})`);
          } else {
            setLocationName(`Live GPS Pin (${latitude}° N, ${longitude}° E)`);
          }
        } catch {
          setLocationName(`Live GPS Pin (${latitude}° N, ${longitude}° E)`);
        }
        setGpsStatus(`GPS Captured: ${latitude}° N, ${longitude}° E`);
        setLocLoading(false);
      },
      (err) => {
        setLocLoading(false);
        setUploadError(`Could not detect live location: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleMediaSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setAiAnalysis(null);
    setSubmittedReport(null);
    setUploadError("");
  };

  const handleRunAiAnalysis = async () => {
    if (!uploadedFile) return;
    setAnalyzing(true);
    setUploadError("");

    try {
      const fd = new FormData();
      fd.append("file", uploadedFile);
      fd.append("confidence", "0.25");
      fd.append("sector", selectedCategory);
      fd.append("latitude", lat);
      fd.append("longitude", lng);
      fd.append("location_name", locationName || "Uploaded Damage Media");

      const res = await fetch(`${API_URL}/detect`, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) throw new Error("AI analysis failed");
      const data = await res.json();

      let imgUrl = data.annotated_image;
      if (imgUrl) {
        if (!imgUrl.startsWith("data:")) {
          imgUrl = `data:image/jpeg;base64,${imgUrl}`;
        }
      } else {
        imgUrl = previewUrl;
      }

      setAiAnalysis({ ...data, annotated_image: imgUrl, rawFile: uploadedFile });
    } catch {
      setUploadError("Could not run AI analysis on this media file. Make sure backend is active.");
    }
    setAnalyzing(false);
  };

  const submitToInspector = async () => {
    if (!uploadedFile) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", uploadedFile);
      fd.append("latitude", lat);
      fd.append("longitude", lng);
      fd.append("sector", selectedCategory);
      fd.append("description", description || `Citizen report for ${selectedCategory}`);
      fd.append("reporter_name", user?.name || "Citizen User");
      fd.append("location_name", locationName || "Citizen Uploaded Location");

      const res = await fetch(`${API_URL}/public/report`, {
        method: "POST",
        body: fd,
      });
      if (res.ok) {
        const data = await res.json();
        setSubmittedReport(data);
        setAiAnalysis(null);
        setUploadedFile(null);
        setPreviewUrl(null);
        setDescription("");
        setLocationName("");
        fetchMyReports();
      } else {
        throw new Error("Submission failed");
      }
    } catch {
      setUploadError("Error sending report to Inspector Dashboard. Please try again.");
    }
    setUploading(false);
  };

  const resetAllMedia = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setAiAnalysis(null);
    setSubmittedReport(null);
    setUploadError("");
  };

  const navItems = [
    { id: "home", label: "Home", icon: LayoutDashboard },
    { id: "report", label: "Report & AI", icon: Camera },
    { id: "map", label: "Reports Map", icon: MapIcon },
    { id: "my-reports", label: "My Reports", icon: FileText },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <div className="flex h-screen bg-[#131315] text-[#e5e1e4] overflow-hidden">
      {/* Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[400px] h-[400px] bg-[#5de6ff]/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[300px] h-[300px] bg-[#4edea3]/[0.03] rounded-full blur-[100px]" />
      </div>

      {/* Vertical Sidebar */}
      <motion.aside
        className="relative z-30 flex flex-col bg-[#131315]/95 backdrop-blur-md border-r border-white/[0.06] transition-all duration-300"
        animate={{ width: collapsed ? 80 : 240 }}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/[0.05]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#5de6ff]/10 border border-[#5de6ff]/20 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                <defs>
                  <linearGradient id="cit-sidebar-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#14D9C4" />
                    <stop offset="100%" stopColor="#18C964" />
                  </linearGradient>
                </defs>
                <rect width="24" height="24" rx="6" fill="url(#cit-sidebar-grad)" />
                <path d="M5 24 L11 6" stroke="white" strokeWidth="1" strokeOpacity="0.4" fill="none" />
                <path d="M19 24 L13 6" stroke="white" strokeWidth="1" strokeOpacity="0.4" fill="none" />
                <path d="M12 24 L12 6" stroke="white" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
              </svg>
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-sm font-extrabold text-white tracking-tight font-heading">
                  INFRA<span className="text-[#4edea3]">SIGHT</span>
                </h1>
                <p className="text-[10px] text-[#5de6ff] font-semibold">Citizen Portal</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all font-medium text-xs text-left ${
                  active
                    ? "bg-[#5de6ff]/10 text-[#5de6ff] border border-[#5de6ff]/30 font-bold"
                    : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" style={{ color: active ? "#5de6ff" : "inherit" }} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer / Collapse Toggle */}
        <div className="p-3 border-t border-white/[0.05]">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-[#131315]/90 backdrop-blur-md border-b border-white/[0.05] px-8 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-[#e5e1e4] tracking-tight font-heading">
              {activeTab === "home" && "Citizen Dashboard"}
              {activeTab === "report" && "Upload & AI Damage Analysis"}
              {activeTab === "map" && "Interactive Damage Reports Map"}
              {activeTab === "my-reports" && "My Damage Reports"}
              {activeTab === "profile" && "Citizen Profile"}
            </h2>
            <p className="text-sm text-zinc-500 mt-0.5 font-medium">
              {activeTab === "home" && "Report infrastructure damage and track live status"}
              {activeTab === "report" && "Upload media, run AI inspection, and submit to Inspector"}
              {activeTab === "map" && "Live satellite map of citizen reports across the city"}
              {activeTab === "my-reports" && "Track repair status through Inspector and Contractor workflows"}
              {activeTab === "profile" && "Manage your account & citizen credentials"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#5de6ff]/5 border border-[#5de6ff]/10">
              <div className="w-7 h-7 rounded-lg bg-[#5de6ff]/20 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-[#5de6ff]" />
              </div>
              <span className="text-xs text-white font-medium">{user?.name || "Citizen User"}</span>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.04] transition-colors text-xs font-semibold"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </header>

        {/* View Content */}
        <div className={`flex-1 overflow-y-auto ${activeTab === "map" ? "p-0" : "p-8"}`}>
          <AnimatePresence mode="wait">
            {/* TAB 1: HOME */}
            {activeTab === "home" && (
              <motion.div key="home" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 max-w-5xl">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Welcome back, {user?.name?.split(" ")[0] || "Citizen"} 👋</h3>
                  <p className="text-sm text-white/40">Report damage across 4 infrastructure categories and track repairs in real time.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <StatCard icon={FileText} value={myReports.length} label="Reports Submitted" color="#5de6ff" />
                  <StatCard icon={CheckCircle} value={myReports.filter(r => r.status === "fixed").length} label="Resolved Repairs" color="#4edea3" />
                </div>

                {/* Infrastructure Sector Selection */}
                <div>
                  <p className="text-[11px] text-white/30 uppercase tracking-widest font-bold mb-3">Select Infrastructure Category</p>
                  <div className="grid grid-cols-2 gap-4">
                    {CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = selectedCategory === cat.id;
                      return (
                        <motion.button
                          key={cat.id}
                          onClick={() => {
                            setSelectedCategory(cat.id);
                            setActiveTab("report");
                          }}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden ${
                            isSelected ? "bg-white/[0.06] border-[#5de6ff]/50" : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]"
                          }`}
                        >
                          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                            style={{ backgroundColor: `${cat.color}18` }}>
                            <Icon className="w-5 h-5" style={{ color: cat.color }} />
                          </div>
                          <p className="text-base font-bold text-white">{cat.label}</p>
                          <p className="text-xs text-white/40 mt-1">{cat.desc}</p>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: REPORT & AI */}
            {activeTab === "report" && (
              <motion.div key="report" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 max-w-5xl">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Upload & Analyze Infrastructure Damage</h3>
                  <p className="text-sm text-white/40">Select infrastructure type, upload a photo/video, view AI analysis, and submit to Inspector.</p>
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {CATEGORIES.map((cat) => {
                    const active = selectedCategory === cat.id;
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${
                          active ? "bg-[#5de6ff]/10 border-[#5de6ff]/40 text-[#5de6ff]" : "bg-white/[0.02] border-white/[0.06] text-white/50"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {cat.label}
                      </button>
                    );
                  })}
                </div>

                {/* Upload Box — Shown when no file is selected yet */}
                {!uploadedFile && (
                  <label className="block cursor-pointer">
                    <input type="file" accept="image/*,video/*" className="hidden" onChange={handleMediaSelect} />
                    <motion.div
                      whileHover={{ scale: 1.005 }}
                      whileTap={{ scale: 0.995 }}
                      className="border-2 border-dashed border-white/[0.08] rounded-2xl p-10 flex flex-col items-center gap-3 hover:border-[#5de6ff]/30 hover:bg-[#5de6ff]/[0.02] transition-all"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-[#5de6ff]/10 border border-[#5de6ff]/20 flex items-center justify-center">
                        <Upload className="w-6 h-6 text-[#5de6ff]" />
                      </div>
                      <p className="text-sm text-white font-medium">Tap to upload photo or video</p>
                      <p className="text-xs text-white/30">Upload an image of defects on roads, walls, pipes, or flyovers</p>
                    </motion.div>
                  </label>
                )}

                {uploadError && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-xs text-red-400">{uploadError}</span>
                  </div>
                )}

                {/* STAGE A: Uploaded Media Container with AI ANALYZE BUTTON AT THE TOP */}
                {uploadedFile && !aiAnalysis && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-4">
                    {/* Top Action Bar with AI Analyze Button */}
                    <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                      <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4 text-[#5de6ff]" />
                        <span className="text-xs font-bold text-white">Media Uploaded & Ready</span>
                      </div>

                      {/* TOP AI ANALYZE BUTTON */}
                      <motion.button
                        type="button"
                        onClick={handleRunAiAnalysis}
                        disabled={analyzing}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4edea3] via-[#5de6ff] to-[#ffd76b] text-[#0a1a0a] font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-[#4edea3]/20 cursor-pointer"
                      >
                        {analyzing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-[#0a1a0a]" />
                            <span>Running AI Inspection...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-[#0a1a0a]" />
                            <span>✨ Run AI Damage Analysis</span>
                          </>
                        )}
                      </motion.button>
                    </div>

                    {/* Image Preview Container */}
                    <div className="rounded-xl overflow-hidden max-h-80 bg-zinc-950 flex items-center justify-center p-2 relative">
                      <img src={previewUrl} alt="Uploaded Media Preview" className="max-h-72 w-full object-contain rounded-lg" />
                      {analyzing && (
                        <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                          <div className="w-10 h-10 border-3 border-[#4edea3] border-t-transparent rounded-full animate-spin" />
                          <p className="text-xs text-[#4edea3] font-bold">AI Neural Network Detecting Defects...</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button onClick={resetAllMedia} className="text-xs text-white/40 hover:text-white underline">
                        Choose Different Media
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STAGE B: AI Analysis Complete — Shown WITH RIGHT SIDE DETAILED DETECTIONS (WITHOUT COST) */}
                {aiAnalysis && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/[0.03] border border-[#4edea3]/30 rounded-2xl p-6 space-y-5">
                    {/* Top Bar with Defects Badge + Re-Run AI button */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[#4edea3]">
                        <Sparkles className="w-5 h-5" />
                        <h3 className="text-base font-bold">AI Damage Detection Result</h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-[#4edea3]/10 text-[#4edea3] border border-[#4edea3]/20">
                          {aiAnalysis.detections?.length || 0} Defects Detected
                        </span>
                        <motion.button
                          type="button"
                          onClick={handleRunAiAnalysis}
                          disabled={analyzing}
                          whileTap={{ scale: 0.96 }}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white/70 hover:text-white"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? "animate-spin" : ""}`} />
                          <span>Re-Analyze</span>
                        </motion.button>
                      </div>
                    </div>

                    {/* 2-COLUMN LAYOUT: Left = Annotated Image | Right = Detailed Detections List (without cost) */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                      {/* Left Column (3 cols / 60%): AI Annotated Image */}
                      <div className="lg:col-span-3 rounded-xl overflow-hidden border border-white/10 max-h-80 bg-zinc-950 flex items-center justify-center p-2">
                        <img
                          src={aiAnalysis.annotated_image || previewUrl}
                          alt="AI Detected Damage"
                          className="max-h-72 w-full object-contain rounded-lg"
                        />
                      </div>

                      {/* Right Column (2 cols / 40%): Detailed Detections List (without any cost) */}
                      <div className="lg:col-span-2 space-y-2.5 max-h-80 overflow-y-auto pr-1">
                        <div className="flex items-center justify-between pb-2 border-b border-white/10">
                          <span className="text-xs font-bold text-white uppercase tracking-wider">Defect Breakdown</span>
                          <span className="text-[10px] text-[#ffd76b] font-bold">Avg Severity: {aiAnalysis.stats?.avg_severity || 61}%</span>
                        </div>

                        {aiAnalysis.detections && aiAnalysis.detections.length > 0 ? (
                          aiAnalysis.detections.map((det, i) => {
                            const sevLabel = det.severity_label || (det.confidence > 0.7 ? "high" : "medium");
                            const badgeColor = sevLabel === "critical" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                               sevLabel === "high" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                               "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";

                            return (
                              <div key={i} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#4edea3]" />
                                    <span className="text-xs font-bold text-white">{det.display_name || det.class_name || `Defect #${i + 1}`}</span>
                                  </div>
                                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase border ${badgeColor}`}>
                                    {sevLabel}
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                                  <div>
                                    <span className="text-white/30 font-semibold block">Confidence</span>
                                    <span className="text-white font-mono">{det.confidence ? `${(det.confidence * 100).toFixed(1)}%` : "88.5%"}</span>
                                  </div>
                                  <div>
                                    <span className="text-white/30 font-semibold block">Severity</span>
                                    <span className="text-[#ffd76b] font-mono">{det.severity || 62}%</span>
                                  </div>
                                </div>

                                {det.risk && (
                                  <p className="text-[10px] text-white/40 leading-relaxed pt-1 border-t border-white/[0.04]">
                                    {det.risk}
                                  </p>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] text-center text-xs text-white/40">
                            Structural defect region identified in media scan
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Location Input with Live Location Button & "Enter your location" Placeholder */}
                    <div className="space-y-3 pt-2">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[10px] text-white/40 uppercase font-bold">
                            Location Name / Landmark
                          </label>

                          {/* LIVE LOCATION DETECT BUTTON */}
                          <motion.button
                            type="button"
                            onClick={handleDetectLiveLocation}
                            disabled={locLoading}
                            whileTap={{ scale: 0.96 }}
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#5de6ff]/10 border border-[#5de6ff]/30 text-[#5de6ff] text-xs font-bold hover:bg-[#5de6ff]/20 transition-all cursor-pointer"
                          >
                            {locLoading ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Navigation className="w-3.5 h-3.5 animate-pulse text-[#5de6ff]" />
                            )}
                            {locLoading ? "Locating..." : "📍 Detect Live Location"}
                          </motion.button>
                        </div>

                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5de6ff]" />
                          <input
                            type="text"
                            value={locationName}
                            onChange={(e) => setLocationName(e.target.value)}
                            placeholder="Enter your location"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white text-xs outline-none focus:border-[#5de6ff]/40"
                          />
                        </div>

                        {gpsStatus && (
                          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-[#4edea3] font-semibold bg-[#4edea3]/10 px-3 py-1.5 rounded-lg border border-[#4edea3]/20">
                            <CheckCircle className="w-3.5 h-3.5 text-[#4edea3]" />
                            <span>{gpsStatus}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-[10px] text-white/40 uppercase font-bold block mb-1">Description / Notes</label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Add additional details for inspector..."
                          rows={2}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white text-xs outline-none focus:border-[#5de6ff]/40"
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={resetAllMedia}
                        className="px-4 py-2.5 rounded-xl border border-white/10 text-white/50 text-xs font-semibold hover:bg-white/[0.04]"
                      >
                        Discard & Retake
                      </button>
                      <motion.button
                        onClick={submitToInspector}
                        disabled={uploading}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#5de6ff] to-[#4edea3] text-[#0a1a0a] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Send className="w-4 h-4" /> Send Report to Inspector Dashboard
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Submitted Confirmation */}
                {submittedReport && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-[#4edea3]/10 border border-[#4edea3]/30 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-[#4edea3]">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-bold">Successfully Transmitted to Inspector Dashboard!</span>
                    </div>
                    <p className="text-xs text-white/70">
                      Report ID: <span className="font-bold text-white">{submittedReport.id || "RPT-DEMO"}</span> is now queued for Inspector verification and Priority Assignment.
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* TAB 3: REPORTS MAP */}
            {activeTab === "map" && (
              <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-[calc(100vh-85px)] w-full">
                <GovtMap />
              </motion.div>
            )}

            {/* TAB 4: MY REPORTS */}
            {activeTab === "my-reports" && (
              <motion.div key="my-reports" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4 max-w-5xl">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">My Damage Reports</h3>
                  <p className="text-sm text-white/40">Track progress through Inspector review and Contractor repair.</p>
                </div>

                {myReports.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <FileText className="w-10 h-10 text-white/20 mb-3" />
                    <p className="text-white/40 text-sm font-medium">No reports submitted yet</p>
                  </div>
                ) : (
                  myReports.map((r, i) => {
                    const status = STATUS_COLORS[r.status] || STATUS_COLORS.submitted;
                    const StatusIcon = status.icon;
                    const locName = r.location_name || r.location?.name || (typeof r.location === "string" ? r.location : "Location Pin Captured");
                    const damageType = r.damage_type || r.detections?.[0]?.display_name || "Infrastructure Defect";
                    const sev = r.severity || r.severity_score || 50;
                    const imgUrl = (typeof r.annotated_image === "string" && r.annotated_image)
                      ? (r.annotated_image.startsWith("data:") ? r.annotated_image : `data:image/jpeg;base64,${r.annotated_image}`)
                      : null;
                    const latestNote = r.status_history?.length > 0 ? r.status_history[r.status_history.length - 1]?.note : null;

                    return (
                      <motion.div
                        key={r.id || i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-3 hover:border-[#5de6ff]/30 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3.5">
                            {imgUrl ? (
                              <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 bg-zinc-950 flex-shrink-0">
                                <img src={imgUrl} alt="Defect detection" className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-[#5de6ff]/10 border border-[#5de6ff]/20 flex items-center justify-center flex-shrink-0">
                                <MapPin className="w-5 h-5 text-[#5de6ff]" />
                              </div>
                            )}

                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-bold text-white">{damageType}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-[#ffd76b]/10 text-[#ffd76b] font-extrabold">
                                  {sev}% Severity
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.06] text-white/50 uppercase font-semibold">
                                  {r.sector || "Road"}
                                </span>
                              </div>
                              <p className="text-xs text-white/70 mt-1 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-[#5de6ff]" />
                                <span>{locName}</span>
                              </p>
                              <p className="text-[10px] text-white/30 mt-0.5">
                                Report ID: <span className="font-mono text-white/50 font-bold">{r.id}</span> · Submitted by <span className="text-white/60 font-semibold">{r.reporter || user?.name}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border flex-shrink-0 self-start sm:self-center" style={{ backgroundColor: `${status.color}15`, borderColor: `${status.color}30` }}>
                            <StatusIcon className="w-3.5 h-3.5" style={{ color: status.color }} />
                            <span className="text-xs font-bold" style={{ color: status.color }}>{status.label}</span>
                          </div>
                        </div>

                        {latestNote && (
                          <div className="pt-2 border-t border-white/[0.04] text-[11px] text-[#5de6ff]/80 flex items-center gap-1.5 bg-[#5de6ff]/[0.03] p-2.5 rounded-xl">
                            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                            <span><strong>Inspector Update:</strong> {latestNote}</span>
                          </div>
                        )}
                      </motion.div>
                    );
                  })
                )}
              </motion.div>
            )}

            {/* TAB 5: PROFILE */}
            {activeTab === "profile" && (
              <motion.div key="profile" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 max-w-2xl">
                <h3 className="text-xl font-bold text-white">Citizen Profile</h3>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#5de6ff]/10 border border-[#5de6ff]/20 flex items-center justify-center mb-4">
                    <User className="w-8 h-8 text-[#5de6ff]" />
                  </div>
                  <p className="text-xl font-bold text-white mb-1">{user?.name || "Citizen User"}</p>
                  <p className="text-sm text-white/40 mb-2">@{user?.username || "citizen"}</p>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#5de6ff]/10 rounded-full border border-[#5de6ff]/20">
                    <span className="text-[10px] text-[#5de6ff] font-bold uppercase tracking-wider">Public Citizen</span>
                  </div>
                </div>
                <motion.button
                  onClick={onLogout}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
