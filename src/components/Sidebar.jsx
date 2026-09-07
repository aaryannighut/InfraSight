import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScanLine,
  LayoutDashboard,
  Upload,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Shield,
  MapPin,
  Video,
  ClipboardList,
  ListOrdered,
  UserPlus,
  HardHat,
  CheckCircle,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Command Center", id: "dashboard" },
  { icon: ClipboardList, label: "Incoming Reports", id: "inspector-reports" },
  { icon: ListOrdered, label: "Priority Queue", id: "priority-queue" },
  { icon: HardHat, label: "Assigned Work", id: "assigned-work" },
  { icon: CheckCircle, label: "Completed Work", id: "completed-work" },
  { icon: UserPlus, label: "Contractors", id: "contractor-register" },
  { icon: Upload, label: "New Scan", id: "scan" },
  { icon: Video, label: "Video / Live", id: "video" },
  { icon: MapPin, label: "Reports Map", id: "govt-map" },
  { icon: Zap, label: "Repair Plan", id: "repair-plan" },
  { icon: BarChart3, label: "Analytics", id: "analytics" },
  { icon: Settings, label: "Settings", id: "settings" },
];

export default function Sidebar({ activeTab, onTabChange }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative flex flex-col h-screen bg-zinc-950 border-r border-zinc-800/30 overflow-hidden"
    >
      {/* Ambient glow */}
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-emerald-500/3 to-transparent pointer-events-none" />

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 relative z-10">
        <motion.div
          className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
          whileHover={{ scale: 1.05, rotate: 2 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
            <defs>
              <linearGradient id="infra-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#14D9C4" />
                <stop offset="100%" stopColor="#18C964" />
              </linearGradient>
            </defs>
            <rect width="24" height="24" rx="6" fill="url(#infra-grad)" />
            <path d="M5 24 L11 6" stroke="white" strokeWidth="1" strokeOpacity="0.4" fill="none" />
            <path d="M19 24 L13 6" stroke="white" strokeWidth="1" strokeOpacity="0.4" fill="none" />
            <path d="M12 24 L12 6" stroke="white" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
            
            <path d="M7 10 L7 8 L9 8" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M17 10 L17 8 L15 8" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 14 L7 16 L9 16" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M17 14 L17 16 L15 16" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            
            <path d="M11 11 L13 13 L11.5 15" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <motion.div
            className="absolute inset-0 rounded-xl bg-emerald-400/20"
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-base font-extrabold text-white tracking-wide leading-tight">
                INFRA<span className="text-emerald-400">SIGHT</span>
              </h1>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-4 mb-5 px-3 py-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10"
          >
            <div className="flex items-center gap-2">
              <motion.div
                className="w-2 h-2 rounded-full bg-emerald-400"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-xs text-emerald-400 font-bold tracking-wide">
                System Online
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-semibold transition-colors cursor-pointer ${
                isActive
                  ? "text-white"
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/30"
              }`}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.97 }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon
                className={`relative z-10 w-5 h-5 ${
                  isActive ? "text-emerald-400" : ""
                }`}
              />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    className="relative z-10 tracking-wide"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {isActive && !collapsed && item.id === "repair-plan" && (
                <motion.span
                  className="relative z-10 ml-auto text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  NEW
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-4 pb-5 space-y-3">

        <motion.button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30 transition-colors cursor-pointer"
          whileTap={{ scale: 0.95 }}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs font-medium">Collapse</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.aside>
  );
}
