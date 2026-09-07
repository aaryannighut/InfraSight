import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ScanLine,
  AlertTriangle,
  CheckCircle,
  Activity,
  ClipboardList,
  Wrench,
  FileCheck,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL ?? "";

function AnimatedCounter({ target, duration = 1500, prefix = "", suffix = "" }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const numTarget = typeof target === "string" ? parseFloat(target) : target;
    if (isNaN(numTarget)) { setCount(target); return; }
    let start = 0;
    const increment = numTarget / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= numTarget) {
        setCount(numTarget);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return (
    <span>
      {prefix}
      {typeof count === "number" ? count.toLocaleString("en-IN") : count}
      {suffix}
    </span>
  );
}

function buildStats(apiStats, reports = []) {
  const incomingCount = reports.filter(r => !r.assigned_to && r.status !== "fixed" && r.status !== "completed").length;
  const activeAssignedCount = reports.filter(r => r.assigned_to && r.status !== "fixed" && r.status !== "completed").length;
  const completedCount = reports.filter(r => r.status === "fixed" || r.status === "completed").length;
  const integrity = apiStats?.structural_integrity ?? (completedCount > 0 ? Math.min(100, 75 + completedCount * 5) : 82);

  return [
    {
      label: "Incoming Reports",
      value: incomingCount,
      change: incomingCount > 0 ? `${incomingCount} pending review` : "All reviewed",
      trend: incomingCount > 0 ? "up" : "down",
      icon: ClipboardList,
      color: "amber",
      gradient: "from-amber-500/20 to-amber-500/0",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-400",
    },
    {
      label: "Active Assigned Work",
      value: activeAssignedCount,
      change: activeAssignedCount > 0 ? `${activeAssignedCount} in field repair` : "No active jobs",
      trend: "up",
      icon: Wrench,
      color: "cyan",
      gradient: "from-cyan-500/20 to-cyan-500/0",
      iconBg: "bg-cyan-500/10",
      iconColor: "text-cyan-400",
    },
    {
      label: "Completed Repairs",
      value: completedCount,
      change: completedCount > 0 ? `${completedCount} fixed & verified` : "0 completed",
      trend: "up",
      icon: FileCheck,
      color: "emerald",
      gradient: "from-emerald-500/20 to-emerald-500/0",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-400",
    },
    {
      label: "Structural Integrity",
      value: integrity,
      change: integrity > 80 ? "Healthy System" : integrity > 50 ? "At risk" : "Critical",
      trend: integrity > 60 ? "up" : "down",
      icon: CheckCircle,
      color: "violet",
      gradient: "from-violet-500/20 to-violet-500/0",
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-400",
      suffix: "%",
    },
  ];
}

export default function StatsCards() {
  const [stats, setStats] = useState(buildStats(null, []));

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, reportsRes] = await Promise.all([
          fetch(`${API_URL}/stats`),
          fetch(`${API_URL}/admin/reports/map`),
        ]);
        let sData = null;
        let rData = [];
        if (statsRes.ok) sData = await statsRes.json();
        if (reportsRes.ok) {
          const rJson = await reportsRes.json();
          rData = rJson.reports || rJson || [];
        }
        setStats(buildStats(sData, rData));
      } catch {
        // keep fallback
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
        >
          <motion.div
            className="relative overflow-hidden rounded-2xl bg-zinc-900/50 border border-zinc-800/50 p-5 group cursor-pointer"
            whileHover={{ scale: 1.02, borderColor: "rgba(255,255,255,0.1)" }}
            transition={{ duration: 0.2 }}
          >
            {/* Background gradient */}
            <div
              className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${stat.gradient} opacity-50 blur-2xl group-hover:opacity-80 transition-opacity`}
            />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`flex items-center justify-center w-9 h-9 rounded-lg ${stat.iconBg}`}
                >
                  <stat.icon className={`w-4.5 h-4.5 ${stat.iconColor}`} />
                </div>
                <div
                  className={`flex items-center gap-1 text-xs font-medium ${
                    stat.trend === "up" && stat.color === "red" ? "text-red-400" :
                    stat.trend === "up" ? "text-emerald-400" : "text-zinc-500"
                  }`}
                >
                  {stat.trend === "up" ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {stat.change}
                </div>
              </div>

              <div className="text-3xl font-extrabold text-white tracking-tight mt-1">
                <AnimatedCounter
                  target={stat.value}
                  suffix={stat.suffix || ""}
                />
              </div>
              <p className="text-sm text-zinc-400 mt-1.5 font-semibold">{stat.label}</p>
            </div>

            {/* Animated bottom bar */}
            <motion.div
              className={`absolute bottom-0 left-0 h-[2px] bg-gradient-to-r ${
                stat.color === "emerald"
                  ? "from-emerald-500 to-emerald-500/0"
                  : stat.color === "red"
                  ? "from-red-500 to-red-500/0"
                  : stat.color === "cyan"
                  ? "from-cyan-500 to-cyan-500/0"
                  : "from-violet-500 to-violet-500/0"
              }`}
              initial={{ width: "0%" }}
              animate={{ width: "60%" }}
              transition={{ delay: i * 0.1 + 0.5, duration: 1 }}
            />
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
