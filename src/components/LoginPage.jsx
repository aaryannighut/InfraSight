import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, User, ArrowRight, AlertTriangle, Shield, ChevronDown, UserCircle, Briefcase, Crown, ArrowLeft } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const ROLE_META = {
  citizen: {
    label: "Citizen",
    icon: UserCircle,
    color: "#5de6ff",
    colorBg: "#5de6ff",
    description: "Submit & track infrastructure reports",
  },
  inspector: {
    label: "Inspector",
    icon: Briefcase,
    color: "#ffd76b",
    colorBg: "#ffd76b",
    description: "Review AI detections & manage field reports",
  },
  admin: {
    label: "Administrator",
    icon: Crown,
    color: "#4edea3",
    colorBg: "#4edea3",
    description: "Full dashboard, analytics & system control",
  },
};

export default function LoginPage({ onLogin, onBack }) {
  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleRoleSelect = (r) => {
    setRole(r);
    setDropdownOpen(false);
    setUsername("");
    setPassword("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!role) { setError("Please select a login role first"); return; }
    if (!username || !password) { setError("Enter username and password"); return; }
    setLoading(true);
    setError("");

    try {
      const fd = new FormData();
      fd.append("username", username);
      fd.append("password", password);
      const res = await fetch(`${API_URL}/auth/login`, { method: "POST", body: fd });
      if (!res.ok) {
        setError("Invalid credentials. Please check your username and password.");
        setLoading(false);
        return;
      }
      const data = await res.json();

      // Validate that the JWT role matches the selected role
      if (data.role !== role) {
        setError(`This account does not have ${ROLE_META[role]?.label} access.`);
        setLoading(false);
        return;
      }

      localStorage.setItem("crackwatch_token", data.token);
      localStorage.setItem("crackwatch_user", JSON.stringify(data));
      onLogin(data);
    } catch {
      setError("Server not reachable. Please try again.");
    }
    setLoading(false);
  };

  const selectedMeta = role ? ROLE_META[role] : null;
  const RoleIcon = selectedMeta?.icon;

  return (
    <div className="min-h-screen bg-[#131315] flex items-center justify-center relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-[#4edea3]/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[15%] w-[400px] h-[400px] bg-[#5de6ff]/[0.03] rounded-full blur-[100px]" />
        <div className="absolute top-[50%] left-[-10%] w-[300px] h-[300px] bg-[#ffd76b]/[0.02] rounded-full blur-[100px]" />
      </div>

      {/* Back button */}
      {onBack && (
        <motion.button
          onClick={onBack}
          className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/30 hover:text-white/70 transition-colors text-xs font-medium"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </motion.button>
      )}

      <motion.div
        className="relative z-10 w-full max-w-md mx-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            className="w-16 h-16 rounded-2xl bg-[#4edea3]/10 border border-[#4edea3]/20 flex items-center justify-center mx-auto mb-4"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
              <defs>
                <linearGradient id="infra-grad-login" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#14D9C4" />
                  <stop offset="100%" stopColor="#18C964" />
                </linearGradient>
              </defs>
              <rect width="24" height="24" rx="6" fill="url(#infra-grad-login)" />
              <path d="M5 24 L11 6" stroke="white" strokeWidth="1" strokeOpacity="0.4" fill="none" />
              <path d="M19 24 L13 6" stroke="white" strokeWidth="1" strokeOpacity="0.4" fill="none" />
              <path d="M12 24 L12 6" stroke="white" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
              <path d="M7 10 L7 8 L9 8" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M17 10 L17 8 L15 8" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 14 L7 16 L9 16" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M17 14 L17 16 L15 16" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M11 11 L13 13 L11.5 15" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight" style={{ fontFamily: "Space Grotesk" }}>
            INFRA<span className="text-[#4edea3]">SIGHT</span>
          </h1>
          <p className="text-sm text-white/40 mt-1">AI-Based Infrastructure Damage Detection</p>
        </div>

        {/* Login card */}
        <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl p-6 border border-white/[0.06]">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-4 h-4 text-[#4edea3]" />
            <span className="text-xs text-white/40 font-semibold uppercase tracking-wider">Authorized Access Only</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Dropdown */}
            <div>
              <label className="text-[10px] text-white/30 uppercase tracking-[0.15em] font-bold mb-1.5 block">
                Login Role
              </label>
              <div className="relative">
                <motion.button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] text-left text-sm flex items-center justify-between gap-3 border border-white/[0.06] hover:border-white/[0.12] focus:outline-none focus:ring-1 focus:ring-[#4edea3]/30 transition-all"
                  whileTap={{ scale: 0.99 }}
                >
                  {selectedMeta ? (
                    <div className="flex items-center gap-3">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${selectedMeta.color}18` }}
                      >
                        <RoleIcon className="w-3.5 h-3.5" style={{ color: selectedMeta.color }} />
                      </div>
                      <span className="text-white font-medium">{selectedMeta.label}</span>
                    </div>
                  ) : (
                    <span className="text-white/30">Select Role</span>
                  )}
                  <motion.div animate={{ rotate: dropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4 text-white/30" />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 right-0 mt-2 rounded-xl bg-[#1a1a1d] border border-white/[0.08] overflow-hidden z-50 shadow-2xl"
                    >
                      {Object.entries(ROLE_META).map(([key, meta]) => {
                        const Icon = meta.icon;
                        return (
                          <motion.button
                            key={key}
                            type="button"
                            onClick={() => handleRoleSelect(key)}
                            className="w-full px-4 py-3.5 flex items-center gap-3 hover:bg-white/[0.04] transition-colors text-left group"
                            whileHover={{ x: 2 }}
                          >
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                              style={{ backgroundColor: `${meta.color}18` }}
                            >
                              <Icon className="w-4 h-4" style={{ color: meta.color }} />
                            </div>
                            <div>
                              <p className="text-sm text-white font-medium">{meta.label}</p>
                              <p className="text-[10px] text-white/30 mt-0.5">{meta.description}</p>
                            </div>
                            {role === key && (
                              <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
                            )}
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Credentials — shown after role selection */}
            <AnimatePresence mode="wait">
              {role && (
                <motion.div
                  key={role}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  {/* Role context pill */}
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-lg"
                    style={{ backgroundColor: `${selectedMeta.color}0f`, border: `1px solid ${selectedMeta.color}20` }}
                  >
                    <RoleIcon className="w-3 h-3" style={{ color: selectedMeta.color }} />
                    <span className="text-[11px] font-medium" style={{ color: selectedMeta.color }}>
                      Signing in as {selectedMeta.label}
                    </span>
                  </div>

                  <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-[0.15em] font-bold mb-1.5 block">
                      Email / Username
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                      <input
                        id="login-username"
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        placeholder="Enter username"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] text-white text-sm outline-none placeholder-white/15 focus:ring-1 focus:ring-[#4edea3]/30 transition-all border border-white/[0.04] focus:border-[#4edea3]/20"
                        autoComplete="username"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-[0.15em] font-bold mb-1.5 block">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                      <input
                        id="login-password"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] text-white text-sm outline-none placeholder-white/15 focus:ring-1 focus:ring-[#4edea3]/30 transition-all border border-white/[0.04] focus:border-[#4edea3]/20"
                        autoComplete="current-password"
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-3 rounded-lg bg-[#ff6b6b]/5 border border-[#ff6b6b]/10"
                    >
                      <AlertTriangle className="w-4 h-4 text-[#ff6b6b] flex-shrink-0" />
                      <span className="text-xs text-[#ff6b6b]">{error}</span>
                    </motion.div>
                  )}

                  <motion.button
                    type="submit"
                    id="login-submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                    style={{
                      background: `linear-gradient(135deg, ${selectedMeta.color}cc, ${selectedMeta.color}99)`,
                      color: "#0a1a0a",
                    }}
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ opacity: 0.92 }}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-[#0a1a0a] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>Sign In as {selectedMeta.label} <ArrowRight className="w-4 h-4" /></>
                    )}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* No role selected hint */}
            {!role && (
              <p className="text-[11px] text-white/20 text-center pt-2">
                Select your role above to continue
              </p>
            )}
          </form>
        </div>

        <p className="text-center text-[10px] text-white/15 mt-6">
          INFRASIGHT v1.0 · PS 1.4 – AI-Based Infrastructure Damage Detection
        </p>
      </motion.div>
    </div>
  );
}
