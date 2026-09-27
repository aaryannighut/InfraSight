import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const API_URL = import.meta.env.VITE_API_URL ?? "";

const DEFAULT_SCAN_DATA = [
  { date: "Mon", scans: 0, cracks: 0 },
  { date: "Tue", scans: 0, cracks: 0 },
  { date: "Wed", scans: 0, cracks: 0 },
  { date: "Thu", scans: 0, cracks: 0 },
  { date: "Fri", scans: 0, cracks: 0 },
  { date: "Sat", scans: 0, cracks: 0 },
  { date: "Sun", scans: 0, cracks: 0 },
];

const DEFAULT_SEVERITY_DATA = [
  { name: "Critical", value: 0, color: "#ef4444" },
  { name: "Moderate", value: 0, color: "#f59e0b" },
  { name: "Minor", value: 0, color: "#eab308" },
  { name: "Clear", value: 0, color: "#10b981" },
];

const DEFAULT_MONTHLY_DATA = [
  { month: "Jul", detected: 0, resolved: 0 },
  { month: "Aug", detected: 0, resolved: 0 },
  { month: "Sep", detected: 0, resolved: 0 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-xl">
        <p className="text-xs text-zinc-400 mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="text-xs font-semibold" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsChart() {
  const [scanData, setScanData] = useState(DEFAULT_SCAN_DATA);
  const [severityData, setSeverityData] = useState(DEFAULT_SEVERITY_DATA);
  const [monthlyData, setMonthlyData] = useState(DEFAULT_MONTHLY_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/analytics/summary`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to fetch analytics summary");
      })
      .then((data) => {
        if (data.scan_data?.length) setScanData(data.scan_data);
        if (data.severity_data?.length) setSeverityData(data.severity_data);
        if (data.monthly_data?.length) setMonthlyData(data.monthly_data);
      })
      .catch(() => {
        /* keep defaults */
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Scans over time - large chart */}
      <motion.div
        className="lg:col-span-2 rounded-xl bg-zinc-900/50 border border-zinc-800/50 p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Scan Activity</h3>
            <p className="text-[11px] text-zinc-500">Real-time daily scans & defect detections (Project Data)</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-zinc-500">Scans</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-[10px] text-zinc-500">Defects</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={scanData}>
            <defs>
              <linearGradient id="scanGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="crackGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="scans" stroke="#10b981" fill="url(#scanGradient)" strokeWidth={2} name="Scans" />
            <Area type="monotone" dataKey="cracks" stroke="#ef4444" fill="url(#crackGradient)" strokeWidth={2} name="Defects" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Severity distribution - donut */}
      <motion.div
        className="rounded-xl bg-zinc-900/50 border border-zinc-800/50 p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-sm font-semibold text-white mb-1">Severity Distribution</h3>
        <p className="text-[11px] text-zinc-500 mb-4">Project Reports Breakdown</p>
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie
              data={severityData}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={4}
              dataKey="value"
              strokeWidth={0}
            >
              {severityData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {severityData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-[10px] text-zinc-400">
                {item.name} <span className="text-zinc-600">({item.value})</span>
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Monthly trend */}
      <motion.div
        className="lg:col-span-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50 p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Monthly Trend</h3>
            <p className="text-[11px] text-zinc-500">Detected vs Resolved defects across project</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-[10px] text-zinc-500">Detected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-zinc-500">Resolved</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={monthlyData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="detected" fill="#ef4444" radius={[4, 4, 0, 0]} name="Detected" />
            <Bar dataKey="resolved" fill="#10b981" radius={[4, 4, 0, 0]} name="Resolved" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
