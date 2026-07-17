import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileText, MapPin, Clock, CheckCircle, AlertCircle,
  User, LogOut, ChevronRight, Camera, Image, Activity
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const STATUS_COLORS = {
  submitted: { color: "#ffd76b", label: "Submitted", icon: Clock },
  in_progress: { color: "#5de6ff", label: "In Progress", icon: Activity },
  fixed: { color: "#4edea3", label: "Fixed", icon: CheckCircle },
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

function ReportCard({ report, idx }) {
  const status = STATUS_COLORS[report.status] || STATUS_COLORS.submitted;
  const StatusIcon = status.icon;
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.05 }}
      className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 flex items-center gap-4 hover:bg-white/[0.04] transition-colors"
    >
      <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
        <MapPin className="w-4 h-4 text-white/40" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium truncate">{report.location || "Unknown Location"}</p>
        <p className="text-[11px] text-white/30 mt-0.5">{report.damage_type || "Infrastructure damage"}</p>
      </div>
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg flex-shrink-0"
        style={{ backgroundColor: `${status.color}12` }}>
        <StatusIcon className="w-3 h-3" style={{ color: status.color }} />
        <span className="text-[10px] font-semibold" style={{ color: status.color }}>{status.label}</span>
      </div>
    </motion.div>
  );
}

export default function CitizenView({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("home");
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [reports] = useState([]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    setUploadResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("location", "GPS auto-detected");
      const token = localStorage.getItem("crackwatch_token");
      const res = await fetch(`${API_URL}/detect`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setUploadResult(data);
    } catch {
      setUploadError("Could not process your report. Please try again.");
    }
    setUploading(false);
  };

  const tabs = [
    { id: "home", label: "Home", icon: Activity },
    { id: "report", label: "Report", icon: Camera },
    { id: "my-reports", label: "My Reports", icon: FileText },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#131315] text-[#e5e1e4]">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[400px] h-[400px] bg-[#5de6ff]/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[300px] h-[300px] bg-[#4edea3]/[0.03] rounded-full blur-[100px]" />
      </div>

      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-[#131315]/90 backdrop-blur-md border-b border-white/[0.05] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#5de6ff]/10 border border-[#5de6ff]/20 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
              <defs>
                <linearGradient id="cit-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#14D9C4" />
                  <stop offset="100%" stopColor="#18C964" />
                </linearGradient>
              </defs>
              <rect width="24" height="24" rx="6" fill="url(#cit-grad)" />
              <path d="M5 24 L11 6" stroke="white" strokeWidth="1" strokeOpacity="0.4" fill="none" />
              <path d="M19 24 L13 6" stroke="white" strokeWidth="1" strokeOpacity="0.4" fill="none" />
              <path d="M12 24 L12 6" stroke="white" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold text-white" style={{ fontFamily: "Space Grotesk" }}>
              INFRA<span className="text-[#4edea3]">SIGHT</span>
            </h1>
            <p className="text-[10px] text-[#5de6ff]/60">Citizen Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#5de6ff]/5 border border-[#5de6ff]/10">
            <div className="w-6 h-6 rounded-lg bg-[#5de6ff]/20 flex items-center justify-center">
              <User className="w-3 h-3 text-[#5de6ff]" />
            </div>
            <span className="text-xs text-white font-medium">{user?.name || "Citizen"}</span>
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

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.div key="home" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Welcome back, {user?.name?.split(" ")[0] || "Citizen"} 👋</h2>
                <p className="text-sm text-white/40">Help improve your community's infrastructure.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <StatCard icon={FileText} value={reports.length} label="Reports Submitted" color="#5de6ff" />
                <StatCard icon={CheckCircle} value="0" label="Reports Fixed" color="#4edea3" />
              </div>
              {/* Quick actions */}
              <div className="space-y-3">
                <p className="text-[11px] text-white/30 uppercase tracking-widest font-bold">Quick Actions</p>
                {[
                  { icon: Camera, label: "Report Damage", sub: "Upload photo or video", tab: "report", color: "#5de6ff" },
                  { icon: FileText, label: "My Reports", sub: "Track your submissions", tab: "my-reports", color: "#4edea3" },
                  { icon: User, label: "Edit Profile", sub: "Update your information", tab: "profile", color: "#ffd76b" },
                ].map((a) => (
                  <motion.button
                    key={a.tab}
                    onClick={() => setActiveTab(a.tab)}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${a.color}18` }}>
                      <a.icon className="w-5 h-5" style={{ color: a.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white font-medium">{a.label}</p>
                      <p className="text-[11px] text-white/30">{a.sub}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/20" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "report" && (
            <motion.div key="report" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Submit a Report</h2>
                <p className="text-sm text-white/40">Upload a photo or video of infrastructure damage for AI analysis.</p>
              </div>

              <label className="block cursor-pointer">
                <input type="file" accept="image/*,video/*" className="hidden" onChange={handleUpload} disabled={uploading} />
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="border-2 border-dashed border-white/[0.08] rounded-2xl p-10 flex flex-col items-center gap-3 hover:border-[#5de6ff]/30 hover:bg-[#5de6ff]/[0.02] transition-all"
                >
                  {uploading ? (
                    <div className="w-8 h-8 border-2 border-[#5de6ff] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-2xl bg-[#5de6ff]/10 border border-[#5de6ff]/20 flex items-center justify-center">
                        <Upload className="w-6 h-6 text-[#5de6ff]" />
                      </div>
                      <p className="text-sm text-white font-medium">Tap to upload photo or video</p>
                      <p className="text-xs text-white/30">AI will automatically detect and classify damage</p>
                    </>
                  )}
                </motion.div>
              </label>

              {uploadError && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-xs text-red-400">{uploadError}</span>
                </motion.div>
              )}

              {uploadResult && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-[#4edea3]/5 border border-[#4edea3]/20 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#4edea3]" />
                    <span className="text-sm text-[#4edea3] font-semibold">Report Submitted Successfully</span>
                  </div>
                  <div className="space-y-1.5">
                    {uploadResult.damage_type && <p className="text-xs text-white/60"><span className="text-white/30">Type:</span> {uploadResult.damage_type}</p>}
                    {uploadResult.severity_score !== undefined && <p className="text-xs text-white/60"><span className="text-white/30">Severity:</span> {uploadResult.severity_score}/100</p>}
                    {uploadResult.cost_estimate_inr && <p className="text-xs text-white/60"><span className="text-white/30">Est. Cost:</span> ₹{uploadResult.cost_estimate_inr?.toLocaleString()}</p>}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === "my-reports" && (
            <motion.div key="my-reports" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">My Reports</h2>
                <p className="text-sm text-white/40">Track the status of your submitted damage reports.</p>
              </div>
              {reports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4">
                    <FileText className="w-7 h-7 text-white/20" />
                  </div>
                  <p className="text-white/30 text-sm">No reports yet</p>
                  <p className="text-white/15 text-xs mt-1">Submit your first report to get started</p>
                  <motion.button
                    onClick={() => setActiveTab("report")}
                    whileTap={{ scale: 0.97 }}
                    className="mt-4 px-4 py-2 rounded-xl bg-[#5de6ff]/10 border border-[#5de6ff]/20 text-[#5de6ff] text-xs font-semibold"
                  >
                    Submit Report
                  </motion.button>
                </div>
              ) : (
                reports.map((r, i) => <ReportCard key={r.id || i} report={r} idx={i} />)
              )}
            </motion.div>
          )}

          {activeTab === "profile" && (
            <motion.div key="profile" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <h2 className="text-xl font-bold text-white">Profile</h2>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 relative flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#5de6ff]/10 border border-[#5de6ff]/20 flex items-center justify-center mb-4">
                  <User className="w-8 h-8 text-[#5de6ff]" />
                </div>
                <div>
                  <p className="text-xl font-bold text-white mb-1">{user?.name || "Citizen"}</p>
                  <p className="text-sm text-white/40 mb-2">{user?.username}</p>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#5de6ff]/5 rounded-full border border-[#5de6ff]/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#5de6ff]" />
                    <span className="text-[10px] text-[#5de6ff] font-bold uppercase tracking-wider">Citizen</span>
                  </div>
                </div>
              </div>
              <motion.button
                onClick={onLogout}
                whileTap={{ scale: 0.97 }}
                className="w-full py-3 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#131315]/95 backdrop-blur-md border-t border-white/[0.06] px-4 py-3 flex items-center justify-around z-40">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <motion.button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-colors"
            >
              <Icon className="w-5 h-5 transition-colors" style={{ color: active ? "#5de6ff" : "rgba(255,255,255,0.25)" }} />
              <span className="text-[10px] font-semibold transition-colors" style={{ color: active ? "#5de6ff" : "rgba(255,255,255,0.25)" }}>
                {t.label}
              </span>
              {active && (
                <motion.div layoutId="citizen-tab-pill" className="w-1 h-1 rounded-full bg-[#5de6ff]" />
              )}
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
}
