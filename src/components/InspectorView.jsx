import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList, MapPin, CheckCircle, XCircle, Clock,
  AlertTriangle, User, LogOut, ChevronRight, Activity,
  FileCheck, BarChart3, Eye, Loader2
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const STATUS_META = {
  submitted: { color: "#ffd76b", label: "Pending Review", icon: Clock },
  in_progress: { color: "#5de6ff", label: "In Progress", icon: Activity },
  fixed: { color: "#4edea3", label: "Fixed", icon: CheckCircle },
  rejected: { color: "#ff6b6b", label: "Rejected", icon: XCircle },
};

function ReportRow({ report, onStatusChange, idx }) {
  const [updating, setUpdating] = useState(false);
  const status = STATUS_META[report.status] || STATUS_META.submitted;
  const StatusIcon = status.icon;

  const updateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem("crackwatch_token");
      await fetch(`${API_URL}/admin/reports/${report.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      onStatusChange(report.id, newStatus);
    } catch { /* silent */ }
    setUpdating(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.04 }}
      className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 space-y-3 hover:bg-white/[0.04] transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center flex-shrink-0 mt-0.5">
            <MapPin className="w-4 h-4 text-white/40" />
          </div>
          <div>
            <p className="text-sm text-white font-medium">{report.location || "Location unknown"}</p>
            <p className="text-xs text-white/30 mt-0.5">{report.damage_type || "Infrastructure damage"}</p>
            {report.severity_score !== undefined && (
              <div className="flex items-center gap-1.5 mt-1">
                <div className="h-1.5 w-16 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${report.severity_score}%`,
                      backgroundColor: report.severity_score > 70 ? "#ff6b6b" : report.severity_score > 40 ? "#ffd76b" : "#4edea3"
                    }}
                  />
                </div>
                <span className="text-[10px] text-white/30">{report.severity_score}/100</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg flex-shrink-0"
          style={{ backgroundColor: `${status.color}12` }}>
          <StatusIcon className="w-3 h-3" style={{ color: status.color }} />
          <span className="text-[10px] font-semibold" style={{ color: status.color }}>{status.label}</span>
        </div>
      </div>

      {/* Inspector actions */}
      {report.status !== "fixed" && report.status !== "rejected" && (
        <div className="flex items-center gap-2 pt-1 border-t border-white/[0.04]">
          <motion.button
            onClick={() => updateStatus("in_progress")}
            disabled={updating || report.status === "in_progress"}
            whileTap={{ scale: 0.96 }}
            className="flex-1 py-2 rounded-lg text-xs font-semibold bg-[#5de6ff]/8 border border-[#5de6ff]/15 text-[#5de6ff] hover:bg-[#5de6ff]/15 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {updating ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : "Mark In Progress"}
          </motion.button>
          <motion.button
            onClick={() => updateStatus("fixed")}
            disabled={updating}
            whileTap={{ scale: 0.96 }}
            className="flex-1 py-2 rounded-lg text-xs font-semibold bg-[#4edea3]/8 border border-[#4edea3]/15 text-[#4edea3] hover:bg-[#4edea3]/15 transition-colors disabled:opacity-40"
          >
            {updating ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : "Mark Fixed"}
          </motion.button>
          <motion.button
            onClick={() => updateStatus("rejected")}
            disabled={updating}
            whileTap={{ scale: 0.96 }}
            className="py-2 px-3 rounded-lg text-xs font-semibold bg-[#ff6b6b]/8 border border-[#ff6b6b]/15 text-[#ff6b6b] hover:bg-[#ff6b6b]/15 transition-colors disabled:opacity-40"
          >
            <XCircle className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}

export default function InspectorView({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("reports");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("crackwatch_token");
        const res = await fetch(`${API_URL}/admin/reports/map`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setReports(data.reports || data || []);
        }
      } catch { /* silent */ }
      setLoading(false);
    };
    load();
  }, []);

  const handleStatusChange = (id, newStatus) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  const counts = {
    pending: reports.filter(r => r.status === "submitted").length,
    inProgress: reports.filter(r => r.status === "in_progress").length,
    fixed: reports.filter(r => r.status === "fixed").length,
    total: reports.length,
  };

  const tabs = [
    { id: "reports", label: "Reports", icon: ClipboardList },
    { id: "stats", label: "Stats", icon: BarChart3 },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#131315] text-[#e5e1e4]">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[400px] h-[400px] bg-[#ffd76b]/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[300px] h-[300px] bg-[#4edea3]/[0.03] rounded-full blur-[100px]" />
      </div>

      {/* Top bar */}
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
            <p className="text-[10px] text-[#ffd76b]/60">Inspector Portal</p>
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

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
        <AnimatePresence mode="wait">
          {activeTab === "reports" && (
            <motion.div key="reports" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Field Reports</h2>
                  <p className="text-sm text-white/40 mt-0.5">Review and update report statuses</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ffd76b]/8 border border-[#ffd76b]/15">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#ffd76b]" />
                  <span className="text-xs font-bold text-[#ffd76b]">{counts.pending} Pending</span>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
                </div>
              ) : reports.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4">
                    <FileCheck className="w-7 h-7 text-white/20" />
                  </div>
                  <p className="text-white/30 text-sm">No reports to review</p>
                </div>
              ) : (
                reports.map((r, i) => (
                  <ReportRow key={r.id || i} report={r} onStatusChange={handleStatusChange} idx={i} />
                ))
              )}
            </motion.div>
          )}

          {activeTab === "stats" && (
            <motion.div key="stats" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <h2 className="text-xl font-bold text-white">Inspection Overview</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Total Reports", value: counts.total, color: "#e5e1e4" },
                  { label: "Pending Review", value: counts.pending, color: "#ffd76b" },
                  { label: "In Progress", value: counts.inProgress, color: "#5de6ff" },
                  { label: "Fixed", value: counts.fixed, color: "#4edea3" },
                ].map((s) => (
                  <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
                    <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-[11px] text-white/40 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-3">
                <p className="text-xs text-white/30 uppercase tracking-widest font-bold">Fix Rate</p>
                <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${counts.total ? (counts.fixed / counts.total) * 100 : 0}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full rounded-full bg-gradient-to-r from-[#4edea3] to-[#18C964]"
                  />
                </div>
                <p className="text-sm text-white font-semibold">
                  {counts.total ? Math.round((counts.fixed / counts.total) * 100) : 0}% of reports resolved
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === "profile" && (
            <motion.div key="profile" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <h2 className="text-xl font-bold text-white">Profile</h2>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 relative flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#ffd76b]/10 border border-[#ffd76b]/20 flex items-center justify-center mb-4">
                  <User className="w-8 h-8 text-[#ffd76b]" />
                </div>
                <div>
                  <p className="text-xl font-bold text-white mb-1">{user?.name || "Inspector"}</p>
                  <p className="text-sm text-white/40 mb-2">{user?.department || "Municipal Corp"}</p>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#ffd76b]/5 rounded-full border border-[#ffd76b]/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#ffd76b]" />
                    <span className="text-[10px] text-[#ffd76b] font-bold uppercase tracking-wider">Inspector</span>
                  </div>
                </div>
              </div>
              <div className="bg-[#ffd76b]/5 border border-[#ffd76b]/10 rounded-xl p-4">
                <p className="text-xs text-white/40 font-semibold">Inspector Permissions</p>
                <ul className="mt-2 space-y-1.5">
                  {["Review AI detections", "Verify & update reports", "Approve or reject reports", "View assigned locations", "Generate inspection reports"].map((p) => (
                    <li key={p} className="flex items-center gap-2 text-xs text-white/50">
                      <CheckCircle className="w-3 h-3 text-[#4edea3]" />{p}
                    </li>
                  ))}
                </ul>
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
              className="flex flex-col items-center gap-1 px-4 py-1"
            >
              <Icon className="w-5 h-5 transition-colors" style={{ color: active ? "#ffd76b" : "rgba(255,255,255,0.25)" }} />
              <span className="text-[10px] font-semibold transition-colors" style={{ color: active ? "#ffd76b" : "rgba(255,255,255,0.25)" }}>
                {t.label}
              </span>
              {active && <motion.div layoutId="inspector-tab-pill" className="w-1 h-1 rounded-full bg-[#ffd76b]" />}
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
}
