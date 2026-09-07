import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList, MapPin, CheckCircle, XCircle, Clock,
  AlertTriangle, User, LogOut, ChevronRight, Activity,
  FileCheck, BarChart3, Eye, Loader2, UserPlus, ListOrdered,
  Send, ShieldCheck, Sparkles, Building2, Wrench, Calendar, Plus, RefreshCw, Filter, ArrowUpDown, Camera
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL ?? "";

const PRIORITY_META = {
  critical: { color: "#ff6b6b", label: "CRITICAL", bg: "bg-red-500/10", border: "border-red-500/30" },
  high: { color: "#ff9f43", label: "HIGH", bg: "bg-orange-500/10", border: "border-orange-500/30" },
  medium: { color: "#ffd76b", label: "MEDIUM", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
  low: { color: "#5de6ff", label: "LOW", bg: "bg-cyan-500/10", border: "border-cyan-500/30" },
};

const PRIORITY_ORDER = { critical: 4, high: 3, medium: 2, low: 1 };

const STAGES_LIST = [
  { id: "dispatched", label: "1. Dispatched", icon: "🚚" },
  { id: "under_review", label: "2. Site Prep", icon: "👀" },
  { id: "in_progress", label: "3. Repairing", icon: "🛠️" },
  { id: "quality_check", label: "4. Quality Audit", icon: "🧪" },
  { id: "fixed", label: "5. Verified", icon: "✅" },
];

const getStageIndex = (status) => {
  if (status === "assigned" || status === "pending") return 0;
  if (status === "received") return 1;
  if (status === "dispatched") return 1;
  if (status === "under_review") return 2;
  if (status === "in_progress") return 3;
  if (status === "quality_check") return 4;
  if (status === "fixed") return 5;
  return 0;
};

export default function InspectorView({ user, onLogout, tabOnly }) {
  const [activeTab, setActiveTab] = useState("incoming");
  const currentTab = tabOnly || activeTab;
  const [reports, setReports] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Queue Filter & Sorting state
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("priority");
  const [reAnalyzingId, setReAnalyzingId] = useState(null);

  // Assignment Modal state
  const [assigningReport, setAssigningReport] = useState(null);
  const [selectedContractor, setSelectedContractor] = useState("");
  const [assignPriority, setAssignPriority] = useState("high");
  const [assignNotes, setAssignNotes] = useState("");

  // Contractor Registration state
  const [regName, setRegName] = useState("");
  const [regCompany, setRegCompany] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regMessage, setRegMessage] = useState("");
  const [regError, setRegError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("crackwatch_token") || localStorage.getItem("crackwatch_token");
      const [reportsRes, contractorRes] = await Promise.all([
        fetch(`${API_URL}/admin/reports/map`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/inspector/contractors`),
      ]);

      if (reportsRes.ok) {
        const data = await reportsRes.json();
        setReports(data.reports || data || []);
      }
      if (contractorRes.ok) {
        const cdata = await contractorRes.json();
        setContractors(cdata.contractors || []);
        if (cdata.contractors?.length > 0) {
          setSelectedContractor(cdata.contractors[0].username);
        }
      }
    } catch { /* silent */ }
    setLoading(false);
  };

  const handleReAnalyzeReport = async (reportId) => {
    setReAnalyzingId(reportId);
    try {
      const res = await fetch(`${API_URL}/public/reports/${reportId}`);
      if (res.ok) {
        const data = await res.json();
        setReports((prev) =>
          prev.map((r) => (r.id === reportId ? { ...r, ...data } : r))
        );
      }
    } catch { /* silent */ }
    setReAnalyzingId(null);
  };

  const handleRegisterContractor = async (e) => {
    e.preventDefault();
    if (!regUsername || !regPassword) {
      setRegError("Username and password are required");
      return;
    }
    setRegError("");
    setRegMessage("");

    try {
      const fd = new FormData();
      fd.append("name", regName || "Contractor");
      fd.append("company", regCompany || "Independent Contracting Firm");
      fd.append("username", regUsername);
      fd.append("password", regPassword);

      const res = await fetch(`${API_URL}/auth/register-contractor`, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Registration failed");
      }

      setRegMessage(`Contractor registered successfully! Username: ${regUsername}`);
      setRegName("");
      setRegCompany("");
      setRegUsername("");
      setRegPassword("");
      fetchData();
    } catch (err) {
      setRegError(err.message || "Failed to register contractor");
    }
  };

  const handleAssignWork = async () => {
    if (!assigningReport || !selectedContractor) return;

    try {
      const fd = new FormData();
      fd.append("report_id", assigningReport.id);
      fd.append("contractor_username", selectedContractor);
      fd.append("priority", assignPriority);
      fd.append("notes", assignNotes);

      const res = await fetch(`${API_URL}/inspector/assign-work`, {
        method: "POST",
        body: fd,
      });

      if (res.ok) {
        setAssigningReport(null);
        setAssignNotes("");
        fetchData();
      }
    } catch { /* silent */ }
  };

  const handleUpdateStatus = async (reportId, newStatus) => {
    try {
      const fd = new FormData();
      fd.append("status", newStatus);
      const res = await fetch(`${API_URL}/admin/reports/${reportId}/status`, {
        method: "PATCH",
        body: fd,
      });
      if (res.ok) {
        fetchData();
      }
    } catch { /* silent */ }
  };

  const setPriorityLevel = (reportId, priority) => {
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, priority } : r));
  };

  const getPriorityKey = (r) => {
    if (!r) return "medium";
    if (r.priority) return String(r.priority).toLowerCase();
    const sev = r.severity || r.severity_score || 50;
    if (sev > 75) return "critical";
    if (sev > 50) return "high";
    if (sev > 25) return "medium";
    return "low";
  };

  const incomingReports = (reports || []).filter(r => r && !r.assigned_to && r.status !== "fixed" && r.status !== "completed");
  const priorityQueue = (reports || []).filter(r => r && !r.assigned_to && r.status !== "fixed" && r.status !== "completed");
  const activeAssignedReports = (reports || []).filter(r => r && r.assigned_to && r.status !== "fixed" && r.status !== "completed");
  const completedReports = (reports || []).filter(r => r && (r.status === "fixed" || r.status === "completed"));

  const filteredQueue = priorityQueue
    .filter((r) => {
      if (!r) return false;
      if (priorityFilter === "all") return true;
      return getPriorityKey(r) === priorityFilter.toLowerCase();
    })
    .sort((a, b) => {
      if (!a || !b) return 0;
      const pKeyA = getPriorityKey(a);
      const pWeightA = PRIORITY_ORDER[pKeyA] || 2;

      const pKeyB = getPriorityKey(b);
      const pWeightB = PRIORITY_ORDER[pKeyB] || 2;

      if (sortBy === "priority") {
        if (pWeightB !== pWeightA) return pWeightB - pWeightA;
        return (Number(b.cost_estimate_inr || b.cost_estimated) || 0) - (Number(a.cost_estimate_inr || a.cost_estimated) || 0);
      }
      if (sortBy === "cost") {
        return (Number(b.cost_estimate_inr || b.cost_estimated) || 0) - (Number(a.cost_estimate_inr || a.cost_estimated) || 0);
      }
      if (sortBy === "severity") {
        return (Number(b.severity || b.severity_score) || 0) - (Number(a.severity || a.severity_score) || 0);
      }
      return 0;
    });

  const tabs = [
    { id: "incoming", label: "Incoming Reports", icon: ClipboardList, badge: incomingReports.length },
    { id: "priority", label: "Set Priority Queue", icon: ListOrdered, badge: priorityQueue.length },
    { id: "assigned", label: "Active Assigned Work", icon: Wrench, badge: activeAssignedReports.length },
    { id: "completed", label: "Completed Work", icon: CheckCircle, badge: completedReports.length },
    { id: "contractors", label: "Contractor Register", icon: UserPlus },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <div className={tabOnly ? "" : "min-h-screen bg-[#131315] text-[#e5e1e4]"}>
      {/* Ambient glow */}
      {!tabOnly && (
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[20%] w-[400px] h-[400px] bg-[#ffd76b]/[0.03] rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[10%] w-[300px] h-[300px] bg-[#4edea3]/[0.03] rounded-full blur-[100px]" />
        </div>
      )}

      {/* Top Bar */}
      {!tabOnly && (
        <header className="sticky top-0 z-40 bg-[#131315]/90 backdrop-blur-md border-b border-white/[0.05] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#ffd76b]/10 border border-[#ffd76b]/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                <defs>
                  <linearGradient id="insp-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#14D9C4" />
                    <stop offset="100%" stopColor="#18C964" />
                  </linearGradient>
                </defs>
                <rect width="24" height="24" rx="6" fill="url(#insp-grad)" />
                <path d="M5 24 L11 6" stroke="white" strokeWidth="1" strokeOpacity="0.4" fill="none" />
                <path d="M19 24 L13 6" stroke="white" strokeWidth="1" strokeOpacity="0.4" fill="none" />
                <path d="M12 24 L12 6" stroke="white" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-white" style={{ fontFamily: "Space Grotesk" }}>
                INFRA<span className="text-[#4edea3]">SIGHT</span>
              </h1>
              <p className="text-[10px] text-[#ffd76b]/60">Inspector Command Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#ffd76b]/5 border border-[#ffd76b]/10">
              <div className="w-6 h-6 rounded-lg bg-[#ffd76b]/20 flex items-center justify-center">
                <User className="w-3 h-3 text-[#ffd76b]" />
              </div>
              <span className="text-xs text-white font-medium">{user?.name || "Inspector"}</span>
            </div>
            <motion.button
              onClick={onLogout}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-xs">Logout</span>
            </motion.button>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={tabOnly ? "w-full" : "max-w-5xl mx-auto px-4 py-6 pb-24"}>
        {/* TAB 1: INCOMING REPORTS */}
          {currentTab === "incoming" && (
            <motion.div key="incoming" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Incoming Citizen Reports</h2>
                  <p className="text-xs text-white/40 mt-0.5">Review photos/videos submitted by citizens and verify AI analysis</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#ffd76b]/10 text-[#ffd76b] text-xs font-bold">
                  {incomingReports.length} Pending Review
                </span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
                </div>
              ) : incomingReports.length === 0 ? (
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-12 text-center">
                  <CheckCircle className="w-10 h-10 text-[#4edea3] mx-auto mb-3" />
                  <p className="text-white font-bold text-sm">All incoming reports reviewed!</p>
                  <p className="text-white/30 text-xs mt-1">Check the Priority Queue tab to assign work to contractors.</p>
                </div>
              ) : (
                incomingReports.map((r, i) => {
                  const imgUrl = r.annotated_image ? (r.annotated_image.startsWith("data:") ? r.annotated_image : `data:image/jpeg;base64,${r.annotated_image}`) : null;
                  const sevScore = r.severity || r.severity_score || r.stats?.avg_severity || 65;

                  return (
                    <motion.div
                      key={r.id || i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-4 hover:border-[#ffd76b]/30 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#ffd76b]/10 border border-[#ffd76b]/20 flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-5 h-5 text-[#ffd76b]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">{r.location_name || r.location?.name || r.location || "Infrastructure Location"}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.06] text-white/50 uppercase font-semibold">
                                {r.sector || "Road"}
                              </span>
                            </div>
                            <p className="text-xs text-white/40 mt-0.5">{r.damage_type || "Infrastructure defect detected"}</p>
                            {r.description && <p className="text-xs text-white/60 mt-1 italic">"{r.description}"</p>}
                            <p className="text-[10px] text-white/25 mt-1">Report ID: <span className="font-mono text-white/50">{r.id}</span> · Submitted by {r.reporter || "Citizen"}</p>
                          </div>
                        </div>

                        {/* Severity Pill */}
                        <div className="text-right flex-shrink-0">
                          <span className="text-xs font-extrabold text-[#ffd76b] block">{sevScore}%</span>
                          <span className="text-[9px] text-white/30 uppercase font-bold">Severity</span>
                        </div>
                      </div>

                      {/* AI Annotated Image Preview */}
                      {imgUrl && (
                        <div className="rounded-xl overflow-hidden border border-white/10 max-h-52 bg-zinc-950 flex justify-center p-1">
                          <img src={imgUrl} alt="Report Detection" className="max-h-48 w-full object-contain rounded-lg" />
                        </div>
                      )}

                      {/* Action Bar */}
                      <div className="flex items-center gap-2 pt-2 border-t border-white/[0.04]">
                        <button
                          onClick={() => {
                            setPriorityLevel(r.id, "high");
                            setAssigningReport(r);
                          }}
                          className="flex-1 py-2.5 rounded-xl bg-[#ffd76b]/10 border border-[#ffd76b]/30 text-[#ffd76b] font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#ffd76b]/20 transition-all cursor-pointer"
                        >
                          <ListOrdered className="w-4 h-4" /> Add to Priority Queue & Assign Contractor
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}

          {/* TAB 2: PRIORITY QUEUE (SORT & FILTER BY PRIORITY/COST + 2-COLUMN RIGHT DETAILS) */}
          {currentTab === "priority" && (
            <motion.div key="priority" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
                <div>
                  <h2 className="text-xl font-bold text-white">Priority Work Queue</h2>
                  <p className="text-xs text-white/40 mt-0.5">Filter complaints by urgency level or cost & inspect details on the right</p>
                </div>

                {/* Priority Filter & Sort Controls */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Priority Filter Pills */}
                  <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/10 text-xs">
                    {["all", "critical", "high", "medium", "low"].map((p) => {
                      const active = priorityFilter === p;
                      return (
                        <button
                          key={p}
                          onClick={() => setPriorityFilter(p)}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase transition-all ${
                            active ? "bg-[#ffd76b] text-[#0a1a0a] shadow-sm" : "text-white/50 hover:text-white"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>

                  {/* Sort By Dropdown */}
                  <div className="flex items-center gap-1.5 bg-white/[0.04] px-3 py-1.5 rounded-xl border border-white/10 text-xs">
                    <ArrowUpDown className="w-3.5 h-3.5 text-[#5de6ff]" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-transparent text-white text-xs font-semibold outline-none cursor-pointer"
                    >
                      <option value="priority" className="bg-[#131315] text-white">Sort by Priority (Critical → Low)</option>
                      <option value="cost" className="bg-[#131315] text-white">Sort by Cost (Highest → Lowest)</option>
                      <option value="severity" className="bg-[#131315] text-white">Sort by Severity %</option>
                    </select>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
                </div>
              ) : filteredQueue.length === 0 ? (
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-12 text-center space-y-2">
                  <ListOrdered className="w-10 h-10 text-white/20 mx-auto mb-2" />
                  <p className="text-white/70 text-sm font-bold">No complaints in Priority Queue</p>
                  <p className="text-white/30 text-xs">Only citizen-uploaded complaints added to priority will appear here.</p>
                </div>
              ) : (
                filteredQueue.map((r, i) => {
                  const sev = r.severity || r.severity_score || 50;
                  const pKey = getPriorityKey(r);
                  const pMeta = PRIORITY_META[pKey] || PRIORITY_META.medium;
                  const imgUrl = (typeof r.annotated_image === "string" && r.annotated_image)
                    ? (r.annotated_image.startsWith("data:") ? r.annotated_image : `data:image/jpeg;base64,${r.annotated_image}`)
                    : null;
                  const rawCost = r.cost_estimate_inr || r.cost_estimated || 13720;
                  const estCost = typeof rawCost === "number" ? rawCost : (Number(rawCost) || 13720);

                  const locName = r.location_name || r.location?.name || (typeof r.location === "string" ? r.location : "Location Pin Captured");
                  const reporterName = typeof r.reporter === "string" ? r.reporter : "Citizen";
                  const sectorName = typeof r.sector === "string" ? r.sector : "Road";
                  const damageTypeName = typeof r.damage_type === "string" ? r.damage_type : (r.detections?.[0]?.display_name || "Structural Defect");
                  const repairMethodName = typeof r.repair_method === "string" ? r.repair_method : null;

                  return (
                    <motion.div
                      key={r.id || i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-4 hover:border-[#ffd76b]/30 transition-all"
                    >
                      {/* Queue Header: Priority Tag + ID + Contractor Assignment */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded-full border ${pMeta.bg} ${pMeta.border}`} style={{ color: pMeta.color }}>
                            {pMeta.label} PRIORITY
                          </span>
                          <span className="text-xs text-white/50 font-mono font-bold">ID: {r.id}</span>
                        </div>

                        {r.assigned_to ? (
                          <div className="flex items-center gap-1.5 text-xs text-[#4edea3] font-semibold bg-[#4edea3]/10 px-3 py-1 rounded-full border border-[#4edea3]/20">
                            <Wrench className="w-3.5 h-3.5" /> Assigned to @{r.assigned_to}
                          </div>
                        ) : (
                          <span className="text-xs text-white/30 italic">Unassigned</span>
                        )}
                      </div>

                      {/* 2-COLUMN LAYOUT: Left = AI Image | Right = Inspector Detailed Breakdown */}
                      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                        {/* Left Column (3 cols / 60%): AI Annotated Image */}
                        <div className="lg:col-span-3 rounded-xl overflow-hidden border border-white/10 max-h-80 bg-zinc-950 flex items-center justify-center p-2">
                          {imgUrl ? (
                            <img src={imgUrl} alt="AI Damage Detection" className="max-h-72 w-full object-contain rounded-lg" />
                          ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-white/30 text-xs">
                              <Camera className="w-8 h-8 mb-2 opacity-40" />
                              <span>No Detection Image Available</span>
                            </div>
                          )}
                        </div>

                        {/* Right Column (2 cols / 40%): Detailed Inspector AI Details */}
                        <div className="lg:col-span-2 space-y-3 flex flex-col justify-between">
                          <div className="space-y-3">
                            {/* AI Details Header + AI Re-Analyze Button */}
                            <div className="flex items-center justify-between pb-2 border-b border-white/10">
                              <div className="flex items-center gap-1.5 text-[#5de6ff]">
                                <Sparkles className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">AI Inspection Details</span>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleReAnalyzeReport(r.id)}
                                disabled={reAnalyzingId === r.id}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#5de6ff]/10 border border-[#5de6ff]/30 text-[#5de6ff] text-[11px] font-bold hover:bg-[#5de6ff]/20 transition-all cursor-pointer"
                              >
                                <RefreshCw className={`w-3.5 h-3.5 ${reAnalyzingId === r.id ? "animate-spin" : ""}`} />
                                <span>{reAnalyzingId === r.id ? "Analyzing..." : "✨ AI Re-Analyze"}</span>
                              </button>
                            </div>

                            {/* Full Defects Breakdown List (All Identified Regions) */}
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                              <div className="flex items-center justify-between pb-1 border-b border-white/10">
                                <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Identified Defects ({r.detections?.length || r.defect_count || 1})</span>
                                <span className="text-[10px] font-extrabold text-[#ffd76b]">Avg: {sev}% Severity</span>
                              </div>

                              {r.detections && r.detections.length > 0 ? (
                                r.detections.map((det, idx) => {
                                  const dSev = det.severity || 60;
                                  const dName = det.display_name || det.class_name || `Defect #${idx + 1}`;
                                  const dBadge = dSev >= 75 ? "bg-red-500/10 text-red-400 border-red-500/20" : dSev >= 50 ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";

                                  return (
                                    <div key={idx} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                          <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]" />
                                          <span className="text-xs font-bold text-white">{dName}</span>
                                        </div>
                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${dBadge}`}>
                                          {dSev}% Severity
                                        </span>
                                      </div>
                                      {det.confidence && (
                                        <p className="text-[9px] text-white/40 pl-3">Confidence: {(det.confidence * 100).toFixed(1)}%</p>
                                      )}
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                  <span className="text-xs font-bold text-white">{damageTypeName}</span>
                                </div>
                              )}
                            </div>

                            {/* Total Estimated Cost & Repair Methods */}
                            <div className="bg-white/[0.03] border border-white/[0.06] p-3.5 rounded-xl space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">Total Repair Cost ({r.detections?.length || 1} defects)</span>
                                <span className="text-sm font-extrabold text-[#4edea3]">₹{estCost.toLocaleString()}</span>
                              </div>
                              {repairMethodName && (
                                <div className="pt-1.5 border-t border-white/[0.04]">
                                  <span className="text-[10px] text-white/30 font-semibold uppercase block">Recommended Method(s)</span>
                                  <p className="text-[11px] text-[#5de6ff] font-medium mt-0.5">{repairMethodName}</p>
                                </div>
                              )}
                            </div>

                            {/* Location & Reporter Info */}
                            <div className="space-y-1 text-xs pt-1">
                              <div className="flex items-center gap-1.5 text-white/80 font-semibold">
                                <MapPin className="w-3.5 h-3.5 text-[#5de6ff]" />
                                <span>{locName}</span>
                              </div>
                              <p className="text-[10px] text-white/30 pl-5">Submitted by: {reporterName} · Sector: <span className="uppercase text-white/60 font-bold">{sectorName}</span></p>
                            </div>
                          </div>

                          {/* Inspector Actions: Live Status Updates to Citizen + Contractor Assignment */}
                          <div className="flex items-center gap-2 mt-2">
                            <select
                              value={r.status || "submitted"}
                              onChange={(e) => handleUpdateStatus(r.id, e.target.value)}
                              className="flex-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-[11px] font-semibold outline-none cursor-pointer hover:border-white/20 transition-all"
                            >
                              <option value="submitted" className="bg-[#131315] text-white">📩 Status: Received</option>
                              <option value="acknowledged" className="bg-[#131315] text-white">👀 Status: Under Review</option>
                              <option value="in_progress" className="bg-[#131315] text-white">🛠️ Status: In Progress</option>
                              <option value="fixed" className="bg-[#131315] text-white">✅ Status: Fixed & Closed</option>
                            </select>

                            <button
                              onClick={() => setAssigningReport(r)}
                              className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#4edea3] to-[#5de6ff] text-[#0a1a0a] font-extrabold text-[11px] flex items-center justify-center gap-1.5 shadow-md shadow-[#4edea3]/20 hover:opacity-95 transition-all cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" /> Assign Contractor
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}

          {/* TAB: ASSIGNED WORK DASHBOARD (ACTIVE WORK ORDERS ONLY) */}
          {currentTab === "assigned" && (
            <motion.div key="assigned" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Active Work Orders Dashboard</h2>
                  <p className="text-xs text-white/40 mt-0.5">Track active field dispatches across contractors (Completed jobs move to Completed Work)</p>
                </div>
                <button
                  onClick={fetchData}
                  className="px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white/70 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh Statuses
                </button>
              </div>

              {/* Stats Summary row */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#5de6ff]/10 border border-[#5de6ff]/20 flex items-center justify-center">
                    <ClipboardList className="w-5 h-5 text-[#5de6ff]" />
                  </div>
                  <div>
                    <span className="text-2xl font-extrabold text-white">
                      {activeAssignedReports.length}
                    </span>
                    <p className="text-[10px] text-white/40 font-semibold uppercase">Active Dispatched</p>
                  </div>
                </div>

                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-2xl font-extrabold text-emerald-400">
                      {activeAssignedReports.filter(r => r.contractor_decision === "received" || r.status === "received" || r.status === "in_progress" || r.status === "dispatched" || r.status === "under_review").length}
                    </span>
                    <p className="text-[10px] text-white/40 font-semibold uppercase">Accepted / In Field</p>
                  </div>
                </div>

                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <span className="text-2xl font-extrabold text-red-400">
                      {activeAssignedReports.filter(r => r.contractor_decision === "declined" || r.status === "declined").length}
                    </span>
                    <p className="text-[10px] text-white/40 font-semibold uppercase">Declined Work</p>
                  </div>
                </div>

                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#4edea3]/10 border border-[#4edea3]/20 flex items-center justify-center">
                    <FileCheck className="w-5 h-5 text-[#4edea3]" />
                  </div>
                  <div>
                    <span className="text-2xl font-extrabold text-[#4edea3]">
                      {completedReports.length}
                    </span>
                    <p className="text-[10px] text-white/40 font-semibold uppercase">Fixed & Completed</p>
                  </div>
                </div>
              </div>

              {/* List of Active Assigned Reports */}
              {activeAssignedReports.length === 0 ? (
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-12 text-center">
                  <Wrench className="w-10 h-10 text-white/20 mx-auto mb-3" />
                  <p className="text-white font-bold text-sm">No active work orders in progress!</p>
                  <p className="text-white/30 text-xs mt-1">
                    {completedReports.length > 0
                      ? `${completedReports.length} work order(s) are completed in Completed Work. Go to "Incoming Reports" to assign new work.`
                      : 'Go to "Incoming Reports" or "Priority Queue" to assign work orders to contractors.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeAssignedReports.map((r, i) => {
                    const decision = r.contractor_decision || (r.status === "assigned" ? "pending" : r.status);
                    const cost = r.cost_estimated || 15000;

                    return (
                      <div key={r.id || i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-4 hover:border-white/10 transition-all">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-base font-bold text-white">{r.location_name || r.location?.name || "Work Site Location"}</span>
                              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-white/10 text-white/70">
                                ID: {r.id}
                              </span>
                              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-yellow-500/10 text-yellow-300">
                                Priority: {r.priority || "Medium"}
                              </span>
                            </div>
                            <p className="text-xs text-white/40">Defect: {r.damage_type || "Infrastructure Damage"}</p>
                          </div>

                          {/* Contractor Info & Decision Badge */}
                          <div className="flex items-center gap-3 text-right">
                            <div>
                              <div className="flex items-center justify-end gap-1.5">
                                <span className="text-xs font-bold text-white">Contractor:</span>
                                <span className="text-xs font-mono text-[#ffd76b] font-bold">@{r.assigned_to}</span>
                              </div>
                              <div className="mt-1">
                                {decision === "pending" && (
                                  <span className="text-xs px-3 py-1 rounded-full font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                                    ⏳ Pending Acceptance
                                  </span>
                                )}
                                {decision === "declined" && (
                                  <span className="text-xs px-3 py-1 rounded-full font-bold bg-red-500/20 text-red-300 border border-red-500/30 inline-flex items-center gap-1">
                                    <XCircle className="w-3.5 h-3.5" /> Work Order Declined
                                  </span>
                                )}
                                {r.status === "dispatched" && (
                                  <span className="text-xs px-3 py-1 rounded-full font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 inline-flex items-center gap-1">
                                    <Activity className="w-3.5 h-3.5" /> 🚚 Crew Dispatched
                                  </span>
                                )}
                                {r.status === "under_review" && (
                                  <span className="text-xs px-3 py-1 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-flex items-center gap-1">
                                    <Activity className="w-3.5 h-3.5" /> 👀 Site Inspection & Prep
                                  </span>
                                )}
                                {r.status === "in_progress" && (
                                  <span className="text-xs px-3 py-1 rounded-full font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 inline-flex items-center gap-1">
                                    <Activity className="w-3.5 h-3.5 animate-pulse" /> 🛠️ Repair In Progress
                                  </span>
                                )}
                                {r.status === "quality_check" && (
                                  <span className="text-xs px-3 py-1 rounded-full font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 inline-flex items-center gap-1">
                                    <CheckCircle className="w-3.5 h-3.5" /> 🧪 Final Quality Audit
                                  </span>
                                )}
                                {r.status === "received" && (
                                  <span className="text-xs px-3 py-1 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1">
                                    <CheckCircle className="w-3.5 h-3.5" /> Received / Accepted
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Re-assign button if declined */}
                            {decision === "declined" && (
                              <button
                                onClick={() => setAssigningReport(r)}
                                className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#ffd76b] to-[#ff9f43] text-black font-extrabold text-xs flex items-center gap-1 cursor-pointer"
                              >
                                Re-assign
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Image Preview if available */}
                        {((typeof r.annotated_image === "string" && r.annotated_image) || r.image_filename) && (
                          <div className="rounded-xl overflow-hidden border border-white/10 max-h-48 bg-zinc-950 flex justify-center p-2">
                            <img
                              src={
                                (typeof r.annotated_image === "string" && r.annotated_image)
                                  ? (r.annotated_image.startsWith("data:") || r.annotated_image.startsWith("http")
                                      ? r.annotated_image
                                      : `data:image/jpeg;base64,${r.annotated_image}`)
                                  : `${API_URL}/uploads/${r.image_filename}`
                              }
                              alt="Work Order"
                              className="h-full object-contain rounded-lg"
                              onError={(e) => { e.currentTarget.style.display = "none"; }}
                            />
                          </div>
                        )}

                        {/* 5-Step Live Progress Tracker Bar for Inspector */}
                        {decision !== "declined" && (
                          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3.5 space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-bold text-white/70">
                              <span className="flex items-center gap-1.5">
                                <Activity className="w-3.5 h-3.5 text-[#5de6ff]" /> Real-time Contractor Field Progress
                              </span>
                              <span className="text-[#4edea3]">
                                Active Stage {Math.max(1, getStageIndex(r.status))} of 5 ({Math.max(0, getStageIndex(r.status) - 1)} Completed)
                              </span>
                            </div>
                            <div className="grid grid-cols-5 gap-1.5 pt-1">
                              {STAGES_LIST.map((stg, idx) => {
                                const stageNum = getStageIndex(r.status);
                                const stepNum = idx + 1;
                                const isDone = stageNum > stepNum;
                                const isCurrent = stageNum === stepNum;

                                return (
                                  <div
                                    key={stg.id}
                                    className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold flex flex-col items-center justify-center text-center transition-all ${
                                      isDone
                                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                                        : isCurrent
                                        ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-sm shadow-cyan-500/20 animate-pulse"
                                        : "bg-white/[0.02] border-white/[0.05] text-white/30"
                                    }`}
                                  >
                                    <span>{stg.icon}</span>
                                    <span className="truncate w-full mt-0.5">{stg.label}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Inspector status history / note */}
                        <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs text-white/40">
                          <span>Assigned Notes: {r.assignment_notes || "Standard municipal repair order"}</span>
                          <span className="font-semibold text-[#4edea3]">Allocated Budget: ₹{cost.toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB: COMPLETED WORK DASHBOARD */}
          {currentTab === "completed" && (
            <motion.div key="completed" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Completed & Verified Repairs</h2>
                  <p className="text-xs text-white/40 mt-0.5">Archive of completed work orders, field completion proofs, and verified quality audits</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#4edea3]/10 text-[#4edea3] text-xs font-bold border border-[#4edea3]/20">
                  {completedReports.length} Work Orders Completed
                </span>
              </div>

              {/* Stats Summary row for Completed Work */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <FileCheck className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-2xl font-extrabold text-emerald-400">
                      {completedReports.length}
                    </span>
                    <p className="text-[10px] text-white/40 font-semibold uppercase">Total Closed Jobs</p>
                  </div>
                </div>

                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#4edea3]/10 border border-[#4edea3]/20 flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-[#4edea3]" />
                  </div>
                  <div>
                    <span className="text-2xl font-extrabold text-white">
                      ₹{completedReports.reduce((acc, r) => acc + (Number(r.cost_estimate_inr || r.cost_estimated) || 15000), 0).toLocaleString()}
                    </span>
                    <p className="text-[10px] text-white/40 font-semibold uppercase">Total Municipal Spend</p>
                  </div>
                </div>

                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#5de6ff]/10 border border-[#5de6ff]/20 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-[#5de6ff]" />
                  </div>
                  <div>
                    <span className="text-2xl font-extrabold text-[#5de6ff]">
                      100%
                    </span>
                    <p className="text-[10px] text-white/40 font-semibold uppercase">Quality Audit Verified</p>
                  </div>
                </div>
              </div>

              {/* List of Completed Reports */}
              {completedReports.length === 0 ? (
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-12 text-center space-y-2">
                  <CheckCircle className="w-10 h-10 text-[#4edea3]/40 mx-auto mb-2" />
                  <p className="text-white/80 font-bold text-sm">No completed work orders yet</p>
                  <p className="text-white/30 text-xs">Once contractors finish assigned repairs and mark them fixed, they will be archived here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {completedReports.map((r, i) => {
                    const cost = r.cost_estimate_inr || r.cost_estimated || 15000;
                    const proofUrl = r.completion_proof ? (r.completion_proof.startsWith("data:") || r.completion_proof.startsWith("http") ? r.completion_proof : `data:image/jpeg;base64,${r.completion_proof}`) : null;
                    const origImgUrl = r.annotated_image ? (r.annotated_image.startsWith("data:") || r.annotated_image.startsWith("http") ? r.annotated_image : `data:image/jpeg;base64,${r.annotated_image}`) : null;

                    return (
                      <div key={r.id || i} className="bg-white/[0.03] border border-emerald-500/20 rounded-2xl p-5 space-y-4 hover:border-emerald-500/40 transition-all">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-base font-bold text-white">{r.location_name || r.location?.name || "Repaired Work Site"}</span>
                              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-white/10 text-white/70 font-mono">
                                ID: {r.id}
                              </span>
                              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> ✅ Fixed & Verified
                              </span>
                            </div>
                            <p className="text-xs text-white/50">Defect: {r.damage_type || "Infrastructure Defect"} · Sector: <span className="uppercase text-white/70 font-semibold">{r.sector || "Road"}</span></p>
                          </div>

                          <div className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <span className="text-xs text-white/50">Contractor:</span>
                              <span className="text-xs font-mono text-[#ffd76b] font-bold">@{r.assigned_to || "contractor"}</span>
                            </div>
                            <span className="text-xs text-emerald-400 font-extrabold block mt-1">Budget Spent: ₹{Number(cost).toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Images Comparison: Original Detection vs Completion Proof */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <span className="text-[10px] text-white/40 font-bold uppercase block">Original AI Damage Scan</span>
                            <div className="rounded-xl overflow-hidden border border-white/10 max-h-48 bg-zinc-950 flex justify-center p-1">
                              {origImgUrl ? (
                                <img src={origImgUrl} alt="Initial Defect" className="h-full object-contain rounded-lg" />
                              ) : (
                                <div className="flex items-center justify-center h-32 text-xs text-white/30">No Image Available</div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] text-[#4edea3] font-bold uppercase block flex items-center gap-1">
                              <Camera className="w-3 h-3" /> Field Completion Proof (After Repair)
                            </span>
                            <div className="rounded-xl overflow-hidden border border-emerald-500/30 max-h-48 bg-zinc-950 flex justify-center p-1">
                              {proofUrl ? (
                                <img src={proofUrl} alt="Completion Proof" className="h-full object-contain rounded-lg" />
                              ) : (
                                <div className="flex flex-col items-center justify-center h-32 text-xs text-emerald-400/60 font-semibold">
                                  <ShieldCheck className="w-6 h-6 mb-1 text-emerald-400 opacity-60" />
                                  <span>Site Verified & Closed by Contractor</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Completion Details Footer */}
                        <div className="pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-xs text-white/50">
                          <span>Reported by: <strong className="text-white">{r.reporter || "Citizen"}</strong></span>
                          <span>Repair Method: <strong className="text-[#5de6ff]">{r.repair_method || "Concrete Patching & Sealing"}</strong></span>
                          {r.fix_date && <span className="text-emerald-400">Completed On: {new Date(r.fix_date).toLocaleDateString()}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 3: REGISTER CONTRACTOR */}
          {currentTab === "contractors" && (
            <motion.div key="contractors" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Register Contractor Account</h2>
                <p className="text-xs text-white/40 mt-0.5">Create login credentials for contracting partners to manage assigned field repairs</p>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleRegisterContractor} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-white/40 uppercase font-bold block mb-1">Contractor Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Rajesh Patil"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white text-xs outline-none focus:border-[#ffd76b]/40"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/40 uppercase font-bold block mb-1">Company / Firm Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Apex Infrastructure Ltd"
                      value={regCompany}
                      onChange={(e) => setRegCompany(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white text-xs outline-none focus:border-[#ffd76b]/40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-white/40 uppercase font-bold block mb-1">Username (for login)</label>
                    <input
                      type="text"
                      placeholder="e.g. rajesh_contractor"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white text-xs outline-none focus:border-[#ffd76b]/40"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/40 uppercase font-bold block mb-1">Password</label>
                    <input
                      type="password"
                      placeholder="Create password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white text-xs outline-none focus:border-[#ffd76b]/40"
                    />
                  </div>
                </div>

                {regError && <p className="text-xs text-red-400 font-medium">{regError}</p>}
                {regMessage && <p className="text-xs text-[#4edea3] font-medium">{regMessage}</p>}

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#ffd76b] to-[#ff9f43] text-[#0a1a0a] font-extrabold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-[#ffd76b]/10"
                >
                  <UserPlus className="w-4 h-4" /> Register & Issue Credentials
                </button>
              </form>

              {/* Registered Contractors List */}
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-[#ffd76b]" />
                  Active Registered Contractors ({contractors.length})
                </h3>
                {contractors.length === 0 ? (
                  <p className="text-xs text-white/30">No registered contractors yet. Use the form above to create contractor logins.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {contractors.map((c, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#ffd76b]/10 border border-[#ffd76b]/20 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4 text-[#ffd76b]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{c.name || c.company || "Contracting Firm"}</p>
                          <p className="text-[10px] text-white/40 mt-0.5">Username: <span className="font-mono text-[#ffd76b]">@{c.username}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 4: PROFILE */}
          {currentTab === "profile" && (
            <motion.div key="profile" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 max-w-2xl mx-auto">
              <h2 className="text-xl font-bold text-white">Inspector Profile</h2>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#ffd76b]/10 border border-[#ffd76b]/20 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-8 h-8 text-[#ffd76b]" />
                </div>
                <p className="text-xl font-bold text-white mb-1">{user?.name || "Inspector"}</p>
                <p className="text-sm text-white/40 mb-2">Municipal Infrastructure Inspection Division</p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#ffd76b]/10 rounded-full border border-[#ffd76b]/20">
                  <span className="text-[10px] text-[#ffd76b] font-bold uppercase tracking-wider">Government Inspector</span>
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

        {/* WORK ASSIGNMENT MODAL */}
        {assigningReport && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#1a1a1d] border border-white/10 rounded-2xl p-6 max-w-lg w-full space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Assign Work Order to Contractor</h3>
                <button onClick={() => setAssigningReport(null)} className="text-white/40 hover:text-white">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                <p className="text-xs font-bold text-white">{assigningReport.location_name || assigningReport.location?.name || (typeof assigningReport.location === "string" ? assigningReport.location : "Report Location")}</p>
                <p className="text-[11px] text-[#ffd76b] font-semibold">Defect: {assigningReport.damage_type || "Infrastructure Defect"} · Est. Cost: ₹{(assigningReport.cost_estimate_inr || 15000).toLocaleString()}</p>
              </div>

              <div>
                <label className="text-[10px] text-white/40 uppercase font-bold block mb-1">Select Contractor</label>
                {contractors.length === 0 ? (
                  <p className="text-xs text-red-400 bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
                    No registered contractors available! Register a contractor first in Contractor Register.
                  </p>
                ) : (
                  <select
                    value={selectedContractor}
                    onChange={(e) => setSelectedContractor(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs outline-none focus:border-[#ffd76b]/40 cursor-pointer"
                  >
                    {contractors.map((c, i) => (
                      <option key={i} value={c.username} className="bg-[#131315] text-white">
                        {c.name || c.company} (@{c.username})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="text-[10px] text-white/40 uppercase font-bold block mb-1">Priority Level</label>
                <div className="grid grid-cols-4 gap-2">
                  {["critical", "high", "medium", "low"].map((p) => {
                    const active = assignPriority === p;
                    const meta = PRIORITY_META[p];
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setAssignPriority(p)}
                        className={`py-2 rounded-xl text-[10px] font-extrabold uppercase border transition-all ${
                          active ? `${meta.bg} ${meta.border}` : "bg-white/[0.02] border-white/[0.06] text-white/40"
                        }`}
                        style={{ color: active ? meta.color : "inherit" }}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-white/40 uppercase font-bold block mb-1">Inspector Work Notes</label>
                <textarea
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  placeholder="Specify repair deadline, materials required, or site instructions..."
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setAssigningReport(null)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-white/50 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignWork}
                  disabled={!selectedContractor}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#ffd76b] to-[#4edea3] text-[#0a1a0a] font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#ffd76b]/10 cursor-pointer"
                >
                  <Send className="w-4 h-4" /> Issue Work Order to Contractor
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
