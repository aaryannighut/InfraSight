import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TooltipProvider } from "@/components/ui/tooltip";
import Sidebar from "@/components/Sidebar";
import StatsCards from "@/components/StatsCards";
import ScanZone from "@/components/ScanZone";
import AnalyticsChart from "@/components/AnalyticsChart";
import RecentScans from "@/components/RecentScans";
import HeroPage from "@/components/HeroPage";
import RepairPlan from "@/components/RepairPlan";
import GovtMap from "@/components/GovtMap";
import VideoScan from "@/components/VideoScan";
import LoginPage from "@/components/LoginPage";
import SettingsPage from "@/components/SettingsPage";
import AdvancedAnalytics from "@/components/AdvancedAnalytics";
import CitizenView from "@/components/CitizenView";
import InspectorView from "@/components/InspectorView";
import ContractorView from "@/components/ContractorView";
import {
  Bell,
  Search,
  User,
  ScanLine,
} from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React ErrorBoundary caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-2xl m-4 space-y-3">
          <h2 className="text-lg font-bold text-red-400">Something went wrong loading this view</h2>
          <p className="text-xs text-white/50">{this.state.error?.toString()}</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-red-500/20 text-red-300 rounded-xl text-xs font-bold hover:bg-red-500/30 transition-all"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function Header({ activeTab, user, onLogout }) {
  const [searchFocused, setSearchFocused] = useState(false);

  const titles = {
    dashboard: { title: "Command Center", sub: "Infrastructure monitoring & damage intelligence" },
    "inspector-reports": { title: "Incoming Citizen Reports", sub: "Review citizen complaints & verify AI detections" },
    "priority-queue": { title: "Priority Work Queue", sub: "Filter complaints by urgency level or cost & inspect details on right" },
    "assigned-work": { title: "Assigned Work Dashboard", sub: "Monitor active field work orders & contractor progress" },
    "completed-work": { title: "Completed Work Orders", sub: "Review completed field repairs, quality verification & completion proof" },
    "contractor-register": { title: "Contractor Portal", sub: "Register contractor credentials for field work orders" },
    scan: { title: "New Scan", sub: "Upload & analyze structural damage" },
    video: { title: "Video / Live Feed", sub: "Analyze video footage & real-time camera" },
    "govt-map": { title: "Reports Map", sub: "Citizen reports & admin controls" },
    "repair-plan": { title: "Repair Plan", sub: "Priority actions & cost estimation" },
    analytics: { title: "Analytics", sub: "Damage trends & pattern analysis" },
    history: { title: "Scan History", sub: "Past inspections & reports" },
    settings: { title: "Settings", sub: "System configuration" },
  };

  const { title, sub } = titles[activeTab] || titles.dashboard;

  return (
    <header className="flex items-center justify-between px-8 py-5 bg-[#131315]/80 backdrop-blur-md">
      <div>
        <motion.h2
          className="text-2xl font-extrabold text-[#e5e1e4] tracking-tight font-heading"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          key={title}
        >
          {title}
        </motion.h2>
        <p className="text-sm text-zinc-500 mt-0.5 font-medium">
          {sub}
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Live indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/20">
          <motion.div
            className="w-2 h-2 rounded-full bg-emerald-400"
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-[11px] text-emerald-400 font-semibold tracking-wide">LIVE</span>
        </div>

        {/* Profile */}
        <motion.button
          className="flex items-center gap-3 px-4 py-2 rounded-xl bg-zinc-900/30 border border-zinc-800/50 hover:border-zinc-700 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
            <User className="w-4 h-4 text-black" />
          </div>
          <div className="text-center">
            <span className="text-sm text-white font-semibold block leading-tight">{user?.name || 'Inspector'}</span>
            <span className="text-[10px] text-zinc-500">{user?.department || 'Municipal Dept.'}</span>
          </div>
        </motion.button>
      </div>
    </header>
  );
}

function DashboardView() {
  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <StatsCards />
      <ScanZone />
      <AnalyticsChart />
    </motion.div>
  );
}

function PlaceholderView({ title, icon }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center h-[60vh]"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <motion.div
        className="w-20 h-20 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center mb-6"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <ScanLine className="w-8 h-8 text-zinc-600" />
      </motion.div>
      <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
      <p className="text-sm text-zinc-500">Coming soon</p>
    </motion.div>
  );
}

function Dashboard({ activeTab, setActiveTab, user, onLogout }) {
  return (
    <div className="flex h-screen bg-[#131315] text-[#e5e1e4] overflow-hidden">
      {/* Ambient background — Stitch "Sovereign Intelligence" */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[15%] w-[500px] h-[500px] bg-[#4edea3]/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-[#5de6ff]/[0.03] rounded-full blur-[120px]" />
        <div className="absolute top-[40%] right-[30%] w-[300px] h-[300px] bg-[#ffb95f]/[0.02] rounded-full blur-[100px]" />
      </div>

      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <Header activeTab={activeTab} user={user} onLogout={onLogout} />
        <div className={`flex-1 overflow-y-auto ${activeTab === 'govt-map' ? '' : 'p-6'}`}>
          <ErrorBoundary>
            <AnimatePresence mode="wait">
              {activeTab === "dashboard" && <DashboardView key="dashboard" />}
              {activeTab === "inspector-reports" && (
                <motion.div key="inspector-reports" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <InspectorView user={user} onLogout={onLogout} tabOnly="incoming" />
                </motion.div>
              )}
              {activeTab === "priority-queue" && (
                <motion.div key="priority-queue" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <InspectorView user={user} onLogout={onLogout} tabOnly="priority" />
                </motion.div>
              )}
              {activeTab === "assigned-work" && (
                <motion.div key="assigned-work" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <InspectorView user={user} onLogout={onLogout} tabOnly="assigned" />
                </motion.div>
              )}
              {activeTab === "completed-work" && (
                <motion.div key="completed-work" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <InspectorView user={user} onLogout={onLogout} tabOnly="completed" />
                </motion.div>
              )}
              {activeTab === "contractor-register" && (
                <motion.div key="contractor-register" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <InspectorView user={user} onLogout={onLogout} tabOnly="contractors" />
                </motion.div>
              )}
              {activeTab === "scan" && (
                <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ScanZone />
                </motion.div>
              )}
              {activeTab === "video" && (
                <motion.div key="video" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <VideoScan />
                </motion.div>
              )}
              {activeTab === "analytics" && (
                <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <AdvancedAnalytics />
                </motion.div>
              )}
              {activeTab === "govt-map" && (
                <motion.div key="govt-map" className="h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <GovtMap />
                </motion.div>
              )}
              {activeTab === "repair-plan" && (
                <motion.div key="repair-plan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <RepairPlan />
                </motion.div>
              )}
              {activeTab === "settings" && (
                <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <SettingsPage user={user} onLogout={onLogout} />
                </motion.div>
              )}
            </AnimatePresence>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}

// ── App state machine ─────────────────────────────────────────────────────
function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem("crackwatch_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [screen, setScreen] = useState(() => {
    try {
      const saved = sessionStorage.getItem("crackwatch_user");
      return saved ? "dashboard" : "hero";
    } catch {
      return "hero";
    }
  });
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleLogout = () => {
    sessionStorage.removeItem("crackwatch_token");
    sessionStorage.removeItem("crackwatch_user");
    localStorage.removeItem("crackwatch_token");
    localStorage.removeItem("crackwatch_user");
    setUser(null);
    setScreen("hero");
  };

  const handleLogin = (data) => {
    sessionStorage.setItem("crackwatch_token", data.token);
    sessionStorage.setItem("crackwatch_user", JSON.stringify(data));
    setUser(data);
    setScreen("dashboard");
  };

  return (
    <ErrorBoundary>
      {user ? (
        user.role === "citizen" ? (
          <CitizenView user={user} onLogout={handleLogout} />
        ) : user.role === "contractor" ? (
          <ContractorView user={user} onLogout={handleLogout} />
        ) : (
          <TooltipProvider>
            {screen === "hero" ? (
              <HeroPage onEnter={() => setScreen("dashboard")} />
            ) : (
              <Dashboard activeTab={activeTab} setActiveTab={setActiveTab} user={user} onLogout={handleLogout} />
            )}
          </TooltipProvider>
        )
      ) : (
        <AnimatePresence mode="wait">
          {screen === "hero" && (
            <motion.div key="hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              <HeroPage onEnter={() => setScreen("login")} />
            </motion.div>
          )}
          {screen === "login" && (
            <motion.div key="login" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
              <LoginPage onLogin={handleLogin} onBack={() => setScreen("hero")} />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </ErrorBoundary>
  );
}

export default App;
