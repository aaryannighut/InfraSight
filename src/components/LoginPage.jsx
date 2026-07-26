import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, User, ArrowRight, AlertTriangle, Shield, ChevronDown, UserCircle, Briefcase, Wrench, ArrowLeft } from "lucide-react";

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
    description: "Review AI detections, set priority queue & assign work",
  },
  contractor: {
    label: "Contractor",
    icon: Wrench,
    color: "#4edea3",
    colorBg: "#4edea3",
    description: "View assigned work orders & upload repair proof",
  },
};

export default function LoginPage({ onLogin, onBack }) {
  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleRoleSelect = (r) => {
    setRole(r);
    setDropdownOpen(false);
    setUsername("");
    setPassword("");
    setName("");
    setIsSignUpMode(false);
    setError("");
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!name || !name.trim()) { setError("Please enter your full name"); return; }
    if (!username || !password) { setError("Username and password are required"); return; }
    setLoading(true);
    setError("");

    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("username", username);
      fd.append("password", password);
      const res = await fetch(`${API_URL}/auth/register`, { method: "POST", body: fd });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setError(errData.detail || "Registration failed. Username may already exist.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      sessionStorage.setItem("crackwatch_token", data.token);
      sessionStorage.setItem("crackwatch_user", JSON.stringify(data));
      onLogin(data);
    } catch {
      setError("Server not reachable. Please try again.");
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSignUpMode && role === "citizen") {
      return handleSignUp(e);
    }
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

      sessionStorage.setItem("crackwatch_token", data.token);
      sessionStorage.setItem("crackwatch_user", JSON.stringify(data));
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
        className="w-full max-w-md mx-4 bg-[#18181b] border border-white/[0.08] rounded-2xl p-8 shadow-2xl relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Top Logo */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#4edea3]/10 border border-[#4edea3]/20 flex items-center justify-center mb-3 shadow-lg shadow-[#4edea3]/5">
            <Shield className="w-6 h-6 text-[#4edea3]" />
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
            INFRA<span className="text-[#4edea3]">SIGHT</span>
          </h1>
          <p className="text-xs text-white/40 mt-1">Infrastructure Damage Intelligence Platform</p>
        </div>

        {/* Role Selector Dropdown */}
        <div className="mb-6 relative">
          <label className="text-[10px] text-white/40 uppercase tracking-[0.15em] font-bold mb-1.5 block">
            Select Your Access Portal
          </label>

          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-white/20 transition-all flex items-center justify-between text-left group"
          >
            {selectedMeta ? (
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${selectedMeta.color}15`, border: `1px solid ${selectedMeta.color}30` }}
                >
                  <RoleIcon className="w-4 h-4" style={{ color: selectedMeta.color }} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    {selectedMeta.label} Portal
                  </div>
                  <div className="text-[10px] text-white/40">{selectedMeta.description}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-white/30">
                <UserCircle className="w-5 h-5" />
                <span className="text-xs font-medium">Choose Role (Citizen / Inspector / Contractor)</span>
              </div>
            )}
            <ChevronDown className={`w-4 h-4 text-white/30 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 right-0 top-full mt-2 bg-[#1f1f23] border border-white/10 rounded-xl p-1.5 shadow-2xl z-30 space-y-1"
              >
                {Object.entries(ROLE_META).map(([key, meta]) => {
                  const Icon = meta.icon;
                  const isSelected = role === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleRoleSelect(key)}
                      className={`w-full p-3 rounded-lg flex items-start gap-3 transition-all text-left ${
                        isSelected
                          ? "bg-white/[0.08] border border-white/10"
                          : "hover:bg-white/[0.04] border border-transparent"
                      }`}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: `${meta.color}15`, border: `1px solid ${meta.color}30` }}
                      >
                        <Icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white flex items-center justify-between">
                          <span>{meta.label}</span>
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
                          )}
                        </div>
                        <p className="text-[10px] text-white/40 leading-relaxed mt-0.5 truncate">{meta.description}</p>
                      </div>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {role && selectedMeta && (
              <motion.div
                key={role}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {/* Citizen Sign In / Sign Up Mode Toggle */}
                {role === "citizen" && (
                  <div className="flex bg-white/[0.04] p-1 rounded-xl mb-3 border border-white/[0.06]">
                    <button
                      type="button"
                      onClick={() => { setIsSignUpMode(false); setError(""); }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        !isSignUpMode ? "bg-[#5de6ff]/20 text-[#5de6ff] border border-[#5de6ff]/30 shadow-sm" : "text-white/40 hover:text-white/70"
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsSignUpMode(true); setError(""); }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isSignUpMode ? "bg-[#5de6ff]/20 text-[#5de6ff] border border-[#5de6ff]/30 shadow-sm" : "text-white/40 hover:text-white/70"
                      }`}
                    >
                      Sign Up (New Citizen)
                    </button>
                  </div>
                )}

                {/* Role context pill */}
                <div
                  className="flex items-center justify-between px-3 py-2 rounded-lg"
                  style={{ backgroundColor: `${selectedMeta.color}0f`, border: `1px solid ${selectedMeta.color}20` }}
                >
                  <div className="flex items-center gap-2">
                    <RoleIcon className="w-3.5 h-3.5" style={{ color: selectedMeta.color }} />
                    <span className="text-[11px] font-medium" style={{ color: selectedMeta.color }}>
                      {isSignUpMode && role === "citizen" ? "Registering New Citizen Account" : `Signing in as ${selectedMeta.label}`}
                    </span>
                  </div>
                </div>

                {/* Full Name field (for Sign Up mode) */}
                {isSignUpMode && role === "citizen" && (
                  <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-[0.15em] font-bold mb-1.5 block">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                      <input
                        id="signup-name"
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] text-white text-sm outline-none placeholder-white/15 focus:ring-1 focus:ring-[#5de6ff]/30 transition-all border border-white/[0.04] focus:border-[#5de6ff]/20"
                        autoComplete="name"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[10px] text-white/30 uppercase tracking-[0.15em] font-bold mb-1.5 block">
                    Username
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
                      autoComplete={isSignUpMode ? "new-password" : "current-password"}
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
                    <>
                      {isSignUpMode && role === "citizen" ? "Create Account & Sign In" : `Sign In as ${selectedMeta.label}`}
                      <ArrowRight className="w-4 h-4" />
                    </>
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
      </motion.div>

      <p className="absolute bottom-6 text-center text-[10px] text-white/15">
        INFRASIGHT v1.0 · PS 1.4 – AI-Based Infrastructure Damage Detection
      </p>
    </div>
  );
}
