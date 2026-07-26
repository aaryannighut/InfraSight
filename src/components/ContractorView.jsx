import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wrench, CheckCircle, Clock, AlertTriangle, MapPin,
  Upload, User, LogOut, ChevronRight, Activity, Camera,
  ShieldCheck, Loader2, FileCheck, Building2, HardHat
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const STATUS_META = {
  assigned: { color: "#ffd76b", label: "Work Assigned", bg: "bg-yellow-500/10" },
  in_progress: { color: "#5de6ff", label: "In Progress", bg: "bg-cyan-500/10" },
  fixed: { color: "#4edea3", label: "Completed & Verified", bg: "bg-emerald-500/10" },
};

export default function ContractorView({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("tasks");
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

  const activeCount = tasks.filter(t => t.status !== "fixed").length;
  const completedCount = tasks.filter(t => t.status === "fixed").length;

  const tabs = [
    { id: "tasks", label: "Assigned Work Orders", icon: Wrench, badge: activeCount },
    { id: "completed", label: "Completed Jobs", icon: CheckCircle, badge: completedCount },
    { id: "profile", label: "Company Profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#131315] text-[#e5e1e4]">
      {/* Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[400px] h-[400px] bg-[#4edea3]/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[300px] h-[300px] bg-[#5de6ff]/[0.03] rounded-full blur-[100px]" />
      </div>

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#131315]/90 backdrop-blur-md border-b border-white/[0.05] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#4edea3]/10 border border-[#4edea3]/20 flex items-center justify-center">
            <Wrench className="w-4 h-4 text-[#4edea3]" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white" style={{ fontFamily: "Space Grotesk" }}>
              INFRA<span className="text-[#4edea3]">SIGHT</span>
            </h1>
            <p className="text-[10px] text-[#4edea3]/60">Contractor Execution Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#4edea3]/5 border border-[#4edea3]/10">
            <div className="w-6 h-6 rounded-lg bg-[#4edea3]/20 flex items-center justify-center">
              <User className="w-3 h-3 text-[#4edea3]" />
            </div>
            <span className="text-xs text-white font-medium">{user?.company || user?.name || "Contractor"}</span>
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

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-6 pb-24">
        <AnimatePresence mode="wait">
          {/* TAB 1: ASSIGNED TASKS */}
          {activeTab === "tasks" && (
            <motion.div key="tasks" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Assigned Repair Orders</h2>
                  <p className="text-xs text-white/40 mt-0.5">Work orders assigned by the Government Inspector</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#4edea3]/10 text-[#4edea3] text-xs font-bold">
                  {activeCount} Active Jobs
                </span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
                </div>
              ) : tasks.filter(t => t.status !== "fixed").length === 0 ? (
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-12 text-center">
                  <CheckCircle className="w-10 h-10 text-[#4edea3] mx-auto mb-3" />
                  <p className="text-white font-bold text-sm">No active work orders pending!</p>
                  <p className="text-white/30 text-xs mt-1">All assigned jobs are completed.</p>
                </div>
              ) : (
                tasks.filter(t => t.status !== "fixed").map((task, i) => {
                  const status = STATUS_META[task.status] || STATUS_META.assigned;

                  return (
                    <motion.div
                      key={task.id || i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-4 hover:border-[#4edea3]/30 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#4edea3]/10 border border-[#4edea3]/20 flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-5 h-5 text-[#4edea3]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">{task.location?.name || task.location || "Work Site Point"}</span>
                              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-[#4edea3]/10 text-[#4edea3]">
                                {task.priority ? `${task.priority} Priority` : "Assigned Work"}
                              </span>
                            </div>
                            <p className="text-xs text-white/40 mt-0.5">{task.damage_type || task.assignment_notes || "Infrastructure repair job"}</p>
                            <p className="text-[10px] text-white/25 mt-1">Work Order ID: {task.id}</p>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <span className="text-sm font-extrabold text-[#4edea3] block">₹{(task.cost_estimate_inr || 18500).toLocaleString()}</span>
                          <span className="text-[9px] text-white/30 uppercase font-bold">Allocated Budget</span>
                        </div>
                      </div>

                      {/* Work Photo */}
                      {task.annotated_image && (
                        <div className="rounded-xl overflow-hidden border border-white/10 max-h-48 bg-black flex justify-center">
                          <img src={task.annotated_image} alt="Work Site Damage" className="h-full object-contain" />
                        </div>
                      )}

                      {/* Action Bar */}
                      <div className="flex items-center gap-2 pt-2 border-t border-white/[0.04]">
                        {task.status !== "in_progress" && (
                          <button
                            onClick={() => handleUpdateStatus(task.id, "in_progress")}
                            className="flex-1 py-2.5 rounded-xl bg-[#5de6ff]/10 border border-[#5de6ff]/30 text-[#5de6ff] font-bold text-xs flex items-center justify-center gap-1.5"
                          >
                            <Activity className="w-4 h-4" /> Start Repair (Mark In Progress)
                          </button>
                        )}
                        <button
                          onClick={() => setActiveTask(task)}
                          className="flex-1 py-2.5 rounded-xl bg-[#4edea3]/10 border border-[#4edea3]/30 text-[#4edea3] font-bold text-xs flex items-center justify-center gap-1.5"
                        >
                          <Camera className="w-4 h-4" /> Submit Proof of Fix (Upload Photo)
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}

          {/* TAB 2: COMPLETED JOBS */}
          {activeTab === "completed" && (
            <motion.div key="completed" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white">Completed Work Orders</h2>
                <p className="text-xs text-white/40 mt-0.5">Verified repair completions with uploaded proof</p>
              </div>

              {tasks.filter(t => t.status === "fixed").length === 0 ? (
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-12 text-center">
                  <FileCheck className="w-10 h-10 text-white/20 mx-auto mb-3" />
                  <p className="text-white/40 text-sm">No completed jobs yet</p>
                </div>
              ) : (
                tasks.filter(t => t.status === "fixed").map((t, i) => (
                  <div key={t.id || i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-[#4edea3]" />
                        <span className="text-sm font-bold text-white">{t.location?.name || t.location || "Work Site"}</span>
                      </div>
                      <span className="text-xs font-mono text-[#4edea3] bg-[#4edea3]/10 px-2.5 py-1 rounded-full border border-[#4edea3]/20">
                        RESOLVED
                      </span>
                    </div>
                    <p className="text-xs text-white/40">{t.damage_type || "Completed repair work"}</p>
                    {t.completion_proof && (
                      <div className="rounded-xl overflow-hidden border border-[#4edea3]/30 max-h-48 bg-black flex justify-center">
                        <img src={t.completion_proof} alt="After Repair Proof" className="h-full object-contain" />
                      </div>
                    )}
                  </div>
                ))
              )}
            </motion.div>
          )}

          {/* TAB 3: PROFILE */}
          {activeTab === "profile" && (
            <motion.div key="profile" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <h2 className="text-xl font-bold text-white">Contractor Company Profile</h2>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#4edea3]/10 border border-[#4edea3]/20 flex items-center justify-center mb-4">
                  <Wrench className="w-8 h-8 text-[#4edea3]" />
                </div>
                <p className="text-xl font-bold text-white mb-1">{user?.name || user?.company || "Apex Infrastructure"}</p>
                <p className="text-sm text-white/40 mb-2">Registered Contracting Partner</p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#4edea3]/10 rounded-full border border-[#4edea3]/20">
                  <span className="text-[10px] text-[#4edea3] font-bold uppercase tracking-wider">Verified Contractor</span>
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
                className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs outline-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setActiveTask(null)}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-white/50 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateStatus(activeTask.id, "fixed")}
                disabled={updating}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#4edea3] to-[#5de6ff] text-[#0a1a0a] font-bold text-xs flex items-center justify-center gap-2"
              >
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Mark Job Completed & Send Proof"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#131315]/95 backdrop-blur-md border-t border-white/[0.06] px-4 py-3 flex items-center justify-around z-40">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="flex flex-col items-center gap-1 px-4 py-1"
            >
              <Icon className="w-5 h-5" style={{ color: active ? "#4edea3" : "rgba(255,255,255,0.25)" }} />
              <span className="text-[10px] font-semibold" style={{ color: active ? "#4edea3" : "rgba(255,255,255,0.25)" }}>
                {t.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
