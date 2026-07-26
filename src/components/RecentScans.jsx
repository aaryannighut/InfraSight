import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle, AlertTriangle, XCircle, ChevronRight, MapPin, ScanLine } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const statusConfig = {
  critical: {
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    icon: XCircle,
    label: "Critical",
  },
  high: {
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    icon: AlertTriangle,
    label: "High",
  },
  medium: {
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    icon: AlertTriangle,
    label: "Medium",
  },
  low: {
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    icon: CheckCircle,
    label: "Clear",
  },
};

export default function RecentScans() {
  const [scans, setScans] = useState([]);

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const res = await fetch(`${API_URL}/admin/reports/map`);
        if (res.ok) {
          const data = await res.json();
          setScans(data.reports || []);
        }
      } catch {
        setScans([]);
      }
    };
    fetchScans();
  }, []);

  return (
    <motion.div
      className="rounded-2xl bg-zinc-900/50 border border-zinc-800/50 p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-zinc-500" />
            Recent Inspections & Scans
          </h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">Live damage scans uploaded by citizens and inspectors</p>
        </div>
      </div>

      {scans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <ScanLine className="w-8 h-8 text-zinc-700 mb-2 opacity-50" />
          <p className="text-xs font-semibold text-zinc-500">No scans recorded yet</p>
          <p className="text-[10px] text-zinc-600">Upload a damage photo to record your first live scan.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {scans.slice(0, 5).map((scan, i) => {
            const sev = scan.severity || scan.severity_score || 50;
            const pKey = sev > 75 ? "critical" : sev > 50 ? "high" : sev > 25 ? "medium" : "low";
            const config = statusConfig[pKey] || statusConfig.medium;
            const StatusIcon = config.icon;

            return (
              <motion.div
                key={scan.id || i}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-800/50 transition-colors cursor-pointer group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-lg bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  📷
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white truncate">
                      {scan.damage_type || "Infrastructure Defect"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3 h-3 text-zinc-600" />
                    <span className="text-[10px] text-zinc-500 truncate">
                      {scan.location_name || scan.location?.name || "Live Location"}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2 shrink-0">
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${config.bg} border ${config.border}`}
                  >
                    <StatusIcon className={`w-3 h-3 ${config.color}`} />
                    <span className={`text-[10px] font-bold ${config.color}`}>
                      {sev}% {config.label}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
