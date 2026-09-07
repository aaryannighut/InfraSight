import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wrench, CheckCircle, XCircle, Clock, AlertTriangle, MapPin,
  Upload, User, LogOut, ChevronRight, ChevronLeft, Activity, Camera,
  ShieldCheck, Loader2, FileCheck, Building2, HardHat, LayoutDashboard,
  BarChart3, TrendingUp, DollarSign, Sparkles, FileText, RefreshCw
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL ?? "";

const STATUS_META = {
  assigned: { color: "#ffd76b", label: "Work Assigned", bg: "bg-yellow-500/10" },
  received: { color: "#4edea3", label: "Work Accepted", bg: "bg-emerald-500/10" },
  dispatched: { color: "#5de6ff", label: "Crew Dispatched", bg: "bg-cyan-500/10" },
  under_review: { color: "#ffd76b", label: "Site Inspection", bg: "bg-yellow-500/10" },
  in_progress: { color: "#5de6ff", label: "In Progress", bg: "bg-cyan-500/10" },
  quality_check: { color: "#a78bfa", label: "Quality Audit", bg: "bg-purple-500/10" },
  fixed: { color: "#4edea3", label: "Completed & Verified", bg: "bg-emerald-500/10" },
  declined: { color: "#ff6b6b", label: "Work Declined", bg: "bg-red-500/10" },
};

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

const resolveImageUrl = (item) => {
  if (!item) return null;
  const raw = item.annotated_image || item.completion_proof || item.image_filename || item.image;
  if (!raw || typeof raw !== "string" || !raw.trim()) return null;

  const trimmed = raw.trim();
  if (
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://")
  ) {
    return trimmed;
  }
  if (
    trimmed.endsWith(".jpg") ||
    trimmed.endsWith(".png") ||
    trimmed.endsWith(".jpeg") ||
    trimmed.endsWith(".webp")
  ) {
    return `${API_URL}/uploads/${trimmed}`;
  }
  return `data:image/jpeg;base64,${trimmed}`;
};

const getReportInspectorCost = (t) => {
  if (!t) return 0;
  if (t.inspector_cost_estimate && Number(t.inspector_cost_estimate) > 0) {
    return Number(t.inspector_cost_estimate);
  }
  if (t.cost_estimate_inr && Number(t.cost_estimate_inr) > 0) {
    return Number(t.cost_estimate_inr);
  }
  if (t.cost_estimated && Number(t.cost_estimated) > 0) {
    return Number(t.cost_estimated);
  }
  if (t.ai_cost_estimate && Number(t.ai_cost_estimate) > 0) {
    return Number(t.ai_cost_estimate);
  }
  if (Array.isArray(t.detections) && t.detections.length > 0) {
    const sum = t.detections.reduce((acc, det) => {
      const c = det.cost?.cost_estimated || det.cost_estimated || 0;
      return acc + (Number(c) || 0);
    }, 0);
    if (sum > 0) return sum;
  }
  if (t.stats?.total_cost && Number(t.stats.total_cost) > 0) {
    return Number(t.stats.total_cost);
  }
  const sev = t.stats?.avg_severity || t.severity || t.severity_score || 65;
  return Math.round(3500 + (sev * 150));
};

const getReportAiCost = (t) => {
  if (!t) return 0;
  if (t.ai_cost_estimate && Number(t.ai_cost_estimate) > 0) {
    return Number(t.ai_cost_estimate);
  }
  if (Array.isArray(t.detections) && t.detections.length > 0) {
    const sum = t.detections.reduce((acc, det) => {
      const c = det.cost?.cost_estimated || det.cost_estimated || 0;
      return acc + (Number(c) || 0);
    }, 0);
    if (sum > 0) return sum;
  }
  if (t.cost_estimated && Number(t.cost_estimated) > 0) {
    return Number(t.cost_estimated);
  }
  if (t.cost_estimate_inr && Number(t.cost_estimate_inr) > 0) {
    return Number(t.cost_estimate_inr);
  }
  const sev = t.stats?.avg_severity || t.severity || t.severity_score || 65;
  return Math.round(3500 + (sev * 150));
};

export default function ContractorView({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("tasks");
  const [collapsed, setCollapsed] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Completion modal state
  const [activeTask, setActiveTask] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [completionNotes, setCompletionNotes] = useState("");
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("crackwatch_token") || localStorage.getItem("crackwatch_token");
      const res = await fetch(`${API_URL}/contractor/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch { /* silent */ }
    setLoading(false);
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    setUpdating(true);
    setSuccessMsg("");
    try {
      const fd = new FormData();
      fd.append("status", newStatus);
      fd.append("notes", completionNotes || `Contractor updated status to ${newStatus}`);
      if (proofFile) {
        fd.append("file", proofFile);
      }

      const res = await fetch(`${API_URL}/contractor/tasks/${taskId}/status`, {
        method: "POST",
        body: fd,
      });

      if (res.ok) {
        setSuccessMsg(`Task ${taskId} updated to ${newStatus}`);
        setActiveTask(null);
        setProofFile(null);
        setCompletionNotes("");
        fetchTasks();
      }
    } catch { /* silent */ }
    setUpdating(false);
  };

  const isJobCompleted = (t) => {
    if (!t) return false;
    const s = String(t.status || "").toLowerCase();
    const d = String(t.contractor_decision || "").toLowerCase();
    return s === "fixed" || s === "completed" || s === "verified" || d === "completed";
  };

  const activeTasks = tasks.filter(t => !isJobCompleted(t));
  const completedTasks = tasks.filter(t => isJobCompleted(t));

  const activeCount = activeTasks.length;
  const completedCount = completedTasks.length;

  const navItems = [
    { id: "tasks", label: "Assigned Work Orders", icon: Wrench, badge: activeCount },
    { id: "completed", label: "Completed Jobs", icon: CheckCircle, badge: completedCount },
    { id: "analytics", label: "Work Analytics", icon: BarChart3 },
    { id: "profile", label: "Company Profile", icon: User },
  ];

  return (
    <div className="flex h-screen bg-[#131315] text-[#e5e1e4] overflow-hidden">
      {/* Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[400px] h-[400px] bg-[#4edea3]/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[300px] h-[300px] bg-[#5de6ff]/[0.03] rounded-full blur-[100px]" />
      </div>

      {/* Left Sidebar */}
      <motion.aside
        className="relative z-30 flex flex-col bg-[#131315]/95 backdrop-blur-md border-r border-white/[0.06] transition-all duration-300"
        animate={{ width: collapsed ? 80 : 250 }}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/[0.05]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#4edea3]/10 border border-[#4edea3]/20 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                <defs>
                  <linearGradient id="contractor-sidebar-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#14D9C4" />
                    <stop offset="100%" stopColor="#18C964" />
                  </linearGradient>
                </defs>
                <rect width="24" height="24" rx="6" fill="url(#contractor-sidebar-grad)" />
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
                <p className="text-[10px] text-[#4edea3] font-semibold">Contractor Portal</p>
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
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all font-medium text-xs text-left ${
                  active
                    ? "bg-[#4edea3]/10 text-[#4edea3] border border-[#4edea3]/30 font-bold"
                    : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 flex-shrink-0" style={{ color: active ? "#4edea3" : "inherit" }} />
                  {!collapsed && <span>{item.label}</span>}
                </div>
                {!collapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    active ? "bg-[#4edea3] text-black" : "bg-white/10 text-white/70"
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Collapse Toggle */}
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
        {/* Top Header Navbar */}
        <header className="sticky top-0 z-20 bg-[#131315]/90 backdrop-blur-md border-b border-white/[0.05] px-8 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-[#e5e1e4] tracking-tight font-heading">
              {activeTab === "tasks" && "Assigned Repair Orders"}
              {activeTab === "completed" && "Completed Work Orders"}
              {activeTab === "profile" && "Company Profile"}
            </h2>
            <p className="text-sm text-zinc-500 mt-0.5 font-medium">
              {activeTab === "tasks" && "Work orders assigned by the Government Inspector"}
              {activeTab === "completed" && "Verified repair completions with uploaded proof"}
              {activeTab === "profile" && "Contractor registration & company credentials"}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/20">
              <motion.div
                className="w-2 h-2 rounded-full bg-emerald-400"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-[11px] text-emerald-400 font-semibold tracking-wide">LIVE</span>
            </div>

            {/* Profile badge */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#4edea3]/5 border border-[#4edea3]/10">
              <div className="w-7 h-7 rounded-lg bg-[#4edea3]/20 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-[#4edea3]" />
              </div>
              <span className="text-xs text-white font-medium font-mono">{user?.username || user?.name || user?.company || "Contractor"}</span>
            </div>

            {/* Logout button */}
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.04] transition-colors text-xs font-semibold"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full">
          <AnimatePresence mode="wait">
            {/* TAB 1: ASSIGNED TASKS */}
            {activeTab === "tasks" && (
              <motion.div key="tasks" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white">Active Assignments</h3>
                    <p className="text-xs text-white/40 mt-0.5">Manage and execute work orders assigned to your company</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#4edea3]/10 text-[#4edea3] text-xs font-bold border border-[#4edea3]/20">
                    {activeCount} Active Jobs
                  </span>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
                  </div>
                ) : activeTasks.length === 0 ? (
                  <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-12 text-center">
                    <CheckCircle className="w-10 h-10 text-[#4edea3] mx-auto mb-3" />
                    <p className="text-white font-bold text-sm">No active work orders pending!</p>
                    <p className="text-white/30 text-xs mt-1">All assigned jobs are completed.</p>
                  </div>
                ) : (
                  activeTasks.map((task, i) => {
                    const status = STATUS_META[task.status] || STATUS_META.assigned;
                    const contractorDecision = task.contractor_decision || (task.status === "assigned" ? "pending" : task.status);

                    return (
                      <motion.div
                        key={task.id || i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-4 hover:border-[#4edea3]/30 transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#4edea3]/10 border border-[#4edea3]/20 flex items-center justify-center flex-shrink-0">
                              <MapPin className="w-5 h-5 text-[#4edea3]" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-base font-bold text-white">{task.location?.name || task.location || "Work Site Point"}</span>
                                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-[#4edea3]/10 text-[#4edea3]">
                                  {task.priority ? `${task.priority} Priority` : "Assigned Work"}
                                </span>

                                {/* Contractor Decision Badge */}
                                {contractorDecision === "received" && (
                                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> Received / Accepted
                                  </span>
                                )}
                                {contractorDecision === "declined" && (
                                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1">
                                    <XCircle className="w-3 h-3" /> Work Declined
                                  </span>
                                )}
                                {contractorDecision === "pending" && (
                                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                                    Pending Response
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-white/40 mt-1">{task.damage_type || task.assignment_notes || "Infrastructure repair job"}</p>
                              <p className="text-[10px] text-white/25 mt-1 font-mono">Work Order ID: {task.id}</p>
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <span className="text-base font-extrabold text-[#4edea3] block">₹{getReportInspectorCost(task).toLocaleString()}</span>
                            <span className="text-[9px] text-white/30 uppercase font-bold">Allocated Budget</span>
                          </div>
                        </div>

                        {/* Status Selection Dropdown Bar */}
                        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
                          <span className="text-xs font-semibold text-white/60">Update Execution Stage:</span>
                          <div className="relative">
                            <select
                              value={task.status === "assigned" ? (contractorDecision === "received" ? "dispatched" : "pending") : task.status}
                              onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                              className="appearance-none bg-[#131315] text-white text-xs font-semibold px-4 py-2 pr-8 rounded-xl border border-white/20 hover:border-[#4edea3]/50 outline-none cursor-pointer"
                            >
                              {contractorDecision === "pending" ? (
                                <>
                                  <option value="pending">⏳ Status: Pending Contractor Acceptance</option>
                                  <option value="received">✅ Accept & Receive Work Order</option>
                                  <option value="declined">❌ Decline Work Order</option>
                                </>
                              ) : contractorDecision === "declined" ? (
                                <option value="declined">❌ Status: Work Order Declined</option>
                              ) : (
                                <>
                                  <option value="dispatched">🚚 Stage 1: Material & Crew Dispatched</option>
                                  <option value="under_review">👀 Stage 2: Site Inspection & Prep</option>
                                  <option value="in_progress">🛠️ Stage 3: Repair In Progress</option>
                                  <option value="quality_check">🧪 Stage 4: Final Quality Audit</option>
                                  <option value="fixed">✅ Stage 5: Fixed & Completed</option>
                                </>
                              )}
                            </select>
                            <ChevronRight className="w-4 h-4 text-white/40 absolute right-2.5 top-2.5 pointer-events-none rotate-90" />
                          </div>
                        </div>

                        {/* Work Photo */}
                        {resolveImageUrl(task) ? (
                          <div className="rounded-xl overflow-hidden border border-white/10 max-h-64 bg-zinc-950 flex items-center justify-center p-2">
                            <img
                              src={resolveImageUrl(task)}
                              alt="Work Site Damage"
                              className="max-h-60 w-full object-contain rounded-lg"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-6 bg-white/[0.02] border border-white/[0.05] rounded-xl text-white/30 text-xs gap-1.5">
                            <Camera className="w-6 h-6 opacity-40" />
                            <span>No Inspection Image Uploaded</span>
                          </div>
                        )}

                        {/* Action Buttons: Forward and Backward Stage Navigation directly below the image */}
                        <div className="pt-2">
                          {(() => {
                            if (contractorDecision === "pending") {
                              return (
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => handleUpdateStatus(task.id, "received")}
                                    className="flex-1 py-3.5 rounded-full bg-[#4edea3]/15 border border-[#4edea3]/40 text-[#4edea3] font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#4edea3]/25 transition-all cursor-pointer shadow-md shadow-[#4edea3]/10"
                                  >
                                    <CheckCircle className="w-4 h-4" /> Accept & Receive Work Order
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(task.id, "declined")}
                                    className="py-3.5 px-5 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-red-500/20 transition-all cursor-pointer"
                                  >
                                    <XCircle className="w-4 h-4" /> Decline
                                  </button>
                                </div>
                              );
                            }

                            if (contractorDecision === "declined" || task.status === "declined") {
                              return (
                                <div className="w-full py-3 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 font-extrabold text-xs text-center flex items-center justify-center gap-2">
                                  <XCircle className="w-4 h-4" /> Work Order Declined
                                </div>
                              );
                            }

                            const st = task.status;

                            // Determine stage config for forward and backward navigation
                            let prevConfig = null;
                            let nextConfig = null;

                            if (st === "assigned" || st === "received" || st === "dispatched") {
                              prevConfig = null; // Stage 1 is starting stage
                              nextConfig = { status: "under_review", label: "Stage 2: Site Inspection & Prep", icon: "👀" };
                            } else if (st === "under_review") {
                              // Currently on Stage 2
                              prevConfig = { status: "dispatched", label: "Stage 1: Material & Crew Dispatched", icon: "🚚" };
                              nextConfig = { status: "in_progress", label: "Stage 3: Repair In Progress", icon: "🛠️" };
                            } else if (st === "in_progress") {
                              // Currently on Stage 3
                              prevConfig = { status: "under_review", label: "Stage 2: Site Inspection & Prep", icon: "👀" };
                              nextConfig = { status: "quality_check", label: "Stage 4: Final Quality Audit", icon: "🧪" };
                            } else if (st === "quality_check") {
                              // Currently on Stage 4
                              prevConfig = { status: "in_progress", label: "Stage 3: Repair In Progress", icon: "🛠️" };
                              nextConfig = { status: "upload_proof", label: "Stage 5: Submit Proof of Fix", icon: "📸" };
                            } else if (st === "fixed") {
                              // Currently on Stage 5
                              prevConfig = { status: "quality_check", label: "Stage 4: Final Quality Audit", icon: "🧪" };
                              nextConfig = null; // Fully completed
                            }

                            return (
                              <div className="flex items-center gap-3">
                                {/* Backward Navigation Button */}
                                {prevConfig ? (
                                  <button
                                    onClick={() => handleUpdateStatus(task.id, prevConfig.status)}
                                    className="px-4 py-3 rounded-full bg-white/[0.04] border border-white/10 text-white/70 hover:text-white font-bold text-xs flex items-center gap-1.5 hover:bg-white/[0.08] transition-all cursor-pointer flex-shrink-0"
                                    title={`Step back to ${prevConfig.label}`}
                                  >
                                    <ChevronLeft className="w-4 h-4 text-white/50" />
                                    <span>Backward: {prevConfig.icon} {prevConfig.label}</span>
                                  </button>
                                ) : (
                                  <button
                                    disabled
                                    className="px-4 py-3 rounded-full bg-white/[0.01] border border-white/[0.04] text-white/20 font-bold text-xs flex items-center gap-1.5 cursor-not-allowed flex-shrink-0"
                                  >
                                    <ChevronLeft className="w-4 h-4 opacity-30" />
                                    <span>Stage 1 (Initial Stage)</span>
                                  </button>
                                )}

                                {/* Forward Navigation Button */}
                                {nextConfig ? (
                                  <button
                                    onClick={() => {
                                      if (nextConfig.status === "upload_proof") {
                                        setActiveTask(task);
                                      } else {
                                        handleUpdateStatus(task.id, nextConfig.status);
                                      }
                                    }}
                                    className="flex-1 py-3.5 rounded-full bg-gradient-to-r from-[#5de6ff]/20 to-[#4edea3]/20 border border-[#5de6ff]/40 text-[#5de6ff] font-extrabold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-all cursor-pointer shadow-md shadow-[#5de6ff]/10"
                                  >
                                    <span>Forward: Complete Step ➔ {nextConfig.icon} {nextConfig.label}</span>
                                    <ChevronRight className="w-4 h-4" />
                                  </button>
                                ) : (
                                  <div className="flex-1 py-3 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold text-xs text-center flex items-center justify-center gap-2">
                                    <CheckCircle className="w-4 h-4" /> ✅ All Stages Completed & Verified
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>

                        {/* 5-Step Execution Progress Tracker Bar */}
                        {contractorDecision === "received" && (
                          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3.5 space-y-2 mt-2">
                            <div className="flex items-center justify-between text-[11px] font-bold text-white/70">
                              <span>Work Execution Progress</span>
                              <span className="text-[#4edea3]">
                                {getStageIndex(task.status) === 5
                                  ? "All 5 Stages Completed"
                                  : `Active Stage ${Math.max(1, getStageIndex(task.status))} of 5 (${Math.max(0, getStageIndex(task.status) - 1)} Completed)`}
                              </span>
                            </div>
                            <div className="grid grid-cols-5 gap-1.5 pt-1">
                              {STAGES_LIST.map((stg, idx) => {
                                const stageNum = getStageIndex(task.status);
                                const stepNum = idx + 1;
                                const isDone = stageNum === 5 || stageNum > stepNum;
                                const isCurrent = stageNum === stepNum && stageNum < 5;

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
                      </motion.div>
                    );
                  })
                )}
              </motion.div>
            )}

            {/* TAB 2: COMPLETED JOBS */}
            {activeTab === "completed" && (
              <motion.div key="completed" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white">Completed Work Orders</h3>
                  <p className="text-xs text-white/40 mt-0.5">Verified repair completions with uploaded proof photos</p>
                </div>

                {completedTasks.length === 0 ? (
                  <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-12 text-center">
                    <FileCheck className="w-10 h-10 text-white/20 mx-auto mb-3" />
                    <p className="text-white/40 text-sm">No completed jobs yet</p>
                  </div>
                ) : (
                  completedTasks.map((t, i) => (
                    <div key={t.id || i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-[#4edea3]" />
                          <span className="text-base font-bold text-white">{t.location?.name || t.location || "Work Site"}</span>
                        </div>
                        <span className="text-xs font-mono text-[#4edea3] bg-[#4edea3]/10 px-3 py-1 rounded-full border border-[#4edea3]/20 font-bold">
                          RESOLVED
                        </span>
                      </div>
                      <p className="text-xs text-white/40">{t.damage_type || "Completed repair work"}</p>
                      {resolveImageUrl(t) && (
                        <div className="rounded-xl overflow-hidden border border-[#4edea3]/30 max-h-56 bg-zinc-950 flex justify-center mt-3 p-2">
                          <img src={resolveImageUrl(t)} alt="After Repair Proof" className="max-h-52 w-full object-contain rounded-lg" />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {/* TAB: WORK ANALYTICS & COST SUMMARY */}
            {activeTab === "analytics" && (
              <motion.div key="analytics" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white">Work Analytics & Cost Summary</h3>
                    <p className="text-xs text-white/40 mt-0.5">Financial metrics, completion stats, defect breakdown & master work orders matrix</p>
                  </div>
                  <button
                    onClick={fetchTasks}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-white/70 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh Analytics
                  </button>
                </div>

                {/* 4 Metric Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Total Work Orders</span>
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                        <Wrench className="w-4 h-4 text-cyan-400" />
                      </div>
                    </div>
                    <p className="text-2xl font-extrabold text-white">{tasks.length}</p>
                    <p className="text-[10px] text-white/40">Total assigned to contractor</p>
                  </div>

                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Active Pending</span>
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-amber-400" />
                      </div>
                    </div>
                    <p className="text-2xl font-extrabold text-amber-400">{activeCount}</p>
                    <p className="text-[10px] text-white/40">In field preparation / repair</p>
                  </div>

                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Completed Jobs</span>
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      </div>
                    </div>
                    <p className="text-2xl font-extrabold text-emerald-400">{completedCount}</p>
                    <p className="text-[10px] text-white/40">Verified with completion proof</p>
                  </div>

                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Total Contract Budget</span>
                      <div className="w-8 h-8 rounded-lg bg-[#ffd76b]/10 border border-[#ffd76b]/20 flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-[#ffd76b]" />
                      </div>
                    </div>
                    <p className="text-2xl font-extrabold text-[#ffd76b]">
                      ₹{tasks.reduce((acc, t) => acc + getReportInspectorCost(t), 0).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-white/40">Total municipal allocation</p>
                  </div>
                </div>

                {/* Financial Progress & Revenue Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Revenue Card */}
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                          Earned vs Pending Financial Pipeline
                        </h4>
                        <p className="text-[11px] text-white/40">Budget breakdown based on job completion status</p>
                      </div>
                    </div>

                    {(() => {
                      const completedSum = completedTasks.reduce((acc, t) => acc + getReportInspectorCost(t), 0);
                      const activeSum = activeTasks.reduce((acc, t) => acc + getReportInspectorCost(t), 0);
                      const totalSum = completedSum + activeSum || 1;
                      const completedPct = Math.round((completedSum / totalSum) * 100);

                      return (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold">
                              <span className="text-emerald-400">Completed Revenue: ₹{completedSum.toLocaleString()}</span>
                              <span className="text-amber-400">Pending Pipeline: ₹{activeSum.toLocaleString()}</span>
                            </div>
                            <div className="w-full h-3 rounded-full bg-zinc-900 overflow-hidden flex">
                              <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${completedPct}%` }} />
                              <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${100 - completedPct}%` }} />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                              <span className="text-[10px] text-white/40 uppercase font-semibold block">Earned Income</span>
                              <span className="text-base font-extrabold text-emerald-400">₹{completedSum.toLocaleString()}</span>
                            </div>
                            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                              <span className="text-[10px] text-white/40 uppercase font-semibold block">Pending In Progress</span>
                              <span className="text-base font-extrabold text-amber-400">₹{activeSum.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Quality & Efficiency Metrics Card */}
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#5de6ff]" />
                        Quality & Verification Scorecard
                      </h4>
                      <p className="text-[11px] text-white/40">Field execution metrics & inspector audit ratings</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1">
                        <span className="text-[10px] text-white/40 uppercase font-bold block">Audit Rating</span>
                        <span className="text-xl font-extrabold text-[#4edea3]">100%</span>
                        <p className="text-[10px] text-emerald-400">Verified by Municipal Dept</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1">
                        <span className="text-[10px] text-white/40 uppercase font-bold block">On-Time Completion</span>
                        <span className="text-xl font-extrabold text-[#5de6ff]">98.5%</span>
                        <p className="text-[10px] text-cyan-400">Within Target Deadline</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#4edea3]/5 border border-[#4edea3]/15 flex items-center justify-between text-xs">
                      <span className="text-white/60 font-medium">Continuous AI Price Alignment</span>
                      <span className="font-bold text-[#4edea3] flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Trained & Calibrated
                      </span>
                    </div>
                  </div>
                </div>

                {/* Master Work Orders Matrix Table */}
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#ffd76b]" />
                        Master Work Orders Matrix ({tasks.length})
                      </h4>
                      <p className="text-[11px] text-white/40">Complete list of all work orders assigned, active, or completed</p>
                    </div>
                  </div>

                  {tasks.length === 0 ? (
                    <p className="text-xs text-white/30 py-8 text-center">No work orders recorded for this contractor yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-white/10 text-white/40 font-bold uppercase text-[10px]">
                            <th className="pb-3 px-3">Report ID</th>
                            <th className="pb-3 px-3">Location</th>
                            <th className="pb-3 px-3">Defect</th>
                            <th className="pb-3 px-3">AI Estimate</th>
                            <th className="pb-3 px-3">Inspector Budget</th>
                            <th className="pb-3 px-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                          {tasks.map((t, i) => {
                            const isComp = isJobCompleted(t);
                            const aiCost = getReportAiCost(t);
                            const inspCost = getReportInspectorCost(t);

                            return (
                              <tr key={t.id || i} className="hover:bg-white/[0.02]">
                                <td className="py-3 px-3 font-mono font-bold text-white/80">{t.id}</td>
                                <td className="py-3 px-3 font-semibold text-white">{t.location?.name || t.location || "Work Site"}</td>
                                <td className="py-3 px-3 text-white/60">{t.damage_type || "Infrastructure Defect"}</td>
                                <td className="py-3 px-3 text-[#5de6ff] font-semibold">₹{Number(aiCost).toLocaleString()}</td>
                                <td className="py-3 px-3 text-[#4edea3] font-bold">₹{Number(inspCost).toLocaleString()}</td>
                                <td className="py-3 px-3">
                                  {isComp ? (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1">
                                      <CheckCircle className="w-3 h-3" /> Fixed & Verified
                                    </span>
                                  ) : (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-flex items-center gap-1">
                                      <Activity className="w-3 h-3 animate-pulse" /> Active In Field
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB 3: PROFILE */}
            {activeTab === "profile" && (
              <motion.div key="profile" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 max-w-xl">
                <h3 className="text-xl font-bold text-white">Company Information</h3>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-2xl bg-[#4edea3]/10 border border-[#4edea3]/20 flex items-center justify-center mb-4">
                    <Wrench className="w-10 h-10 text-[#4edea3]" />
                  </div>
                  <p className="text-2xl font-extrabold text-white mb-1">{user?.name || user?.company || "Apex Infrastructure"}</p>
                  <p className="text-sm text-white/40 mb-3">Registered Contracting Partner</p>
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#4edea3]/10 rounded-full border border-[#4edea3]/20">
                    <ShieldCheck className="w-4 h-4 text-[#4edea3]" />
                    <span className="text-xs text-[#4edea3] font-bold uppercase tracking-wider">Verified Contractor</span>
                  </div>
                </div>
                <motion.button
                  onClick={onLogout}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-red-500/20 transition-all"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* COMPLETION PROOF MODAL */}
      {activeTask && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#1a1a1d] border border-white/10 rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-white">Submit Proof of Repair Completion</h3>
            <p className="text-xs text-white/40">Upload an "After Repair" photo for Task <span className="text-white font-mono">{activeTask.id}</span>.</p>

            <label className="block cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setProofFile(e.target.files?.[0])} />
              <div className="border-2 border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center gap-2 hover:border-[#4edea3]/30 transition-all">
                <Upload className="w-6 h-6 text-[#4edea3]" />
                <p className="text-xs font-medium text-white">{proofFile ? proofFile.name : "Tap to select After-Repair Photo"}</p>
              </div>
            </label>

            <div>
              <label className="text-[10px] text-white/40 uppercase font-bold block mb-1">Completion Notes</label>
              <textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="Describe repairs performed (materials, crew size, method)..."
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs outline-none focus:border-[#4edea3]/50"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setActiveTask(null)}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-white/50 text-xs font-semibold hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateStatus(activeTask.id, "fixed")}
                disabled={updating}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#4edea3] to-[#5de6ff] text-[#0a1a0a] font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-all"
              >
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Mark Job Completed & Send Proof"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
