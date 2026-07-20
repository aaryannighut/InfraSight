import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import {
  ScanLine,
  Shield,
  Zap,
  Eye,
  Brain,
  Layers,
  ArrowRight,
  Sparkles,
  Activity,
  AlertTriangle,
  ChevronDown,
  CheckCircle,
  Cpu,
  Database,
  Wifi,
  X,
  Play,
  Mail
} from "lucide-react";

const GithubIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

const LinkedinIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const TwitterIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

/* ─── Floating Orbs ─── */
function FloatingOrbs() {
  const orbs = [
    { size: 300, x: "10%", y: "20%", color: "emerald", delay: 0 },
    { size: 200, x: "70%", y: "10%", color: "cyan", delay: 1 },
    { size: 250, x: "80%", y: "60%", color: "violet", delay: 2 },
    { size: 180, x: "20%", y: "70%", color: "emerald", delay: 0.5 },
    { size: 150, x: "50%", y: "80%", color: "cyan", delay: 1.5 },
    { size: 120, x: "40%", y: "15%", color: "amber", delay: 3 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-3xl ${
            orb.color === "emerald"
              ? "bg-emerald-500/8"
              : orb.color === "cyan"
              ? "bg-cyan-500/8"
              : orb.color === "violet"
              ? "bg-violet-500/6"
              : "bg-amber-500/5"
          }`}
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
          }}
          animate={{
            x: [0, 30, -20, 10, 0],
            y: [0, -20, 15, -30, 0],
            scale: [1, 1.1, 0.95, 1.05, 1],
          }}
          transition={{
            duration: 12 + i * 2,
            repeat: Infinity,
            delay: orb.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ─── Particle Field ─── */
function ParticleField() {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 4 + 3,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-emerald-400/30"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            y: [0, -40],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

/* ─── Grid Background ─── */
function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}

/* ─── Floating 3D Cards ─── */
function FloatingCard({ children, className, delay = 0, x, y, rotate = 0 }) {
  return (
    <motion.div
      className={`absolute ${className}`}
      style={{ left: x, top: y }}
      initial={{ opacity: 0, scale: 0.5, rotate: rotate - 10 }}
      animate={{
        opacity: 1,
        scale: 1,
        rotate: rotate,
        y: [0, -15, 0],
      }}
      transition={{
        opacity: { delay, duration: 0.8 },
        scale: { delay, duration: 0.8, type: "spring" },
        rotate: { delay, duration: 0.8 },
        y: { delay: delay + 0.8, duration: 4, repeat: Infinity, ease: "easeInOut" },
      }}
      whileHover={{ scale: 1.1, rotate: 0, zIndex: 50 }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Scan Visualization ─── */
function ScanVisualization() {
  return (
    <motion.div
      className="relative w-64 h-44 rounded-xl border border-emerald-500/20 bg-zinc-900/60 backdrop-blur-xl overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5 }}
    >
      {/* Scan content */}
      <svg className="w-full h-full" viewBox="0 0 260 180">
        {/* Grid */}
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={`g${i}`} x1={i * 52} y1="0" x2={i * 52} y2="180" stroke="#10b981" strokeWidth="0.3" opacity="0.2" />
        ))}
        {Array.from({ length: 5 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 45} x2="260" y2={i * 45} stroke="#10b981" strokeWidth="0.3" opacity="0.2" />
        ))}
        {/* Cracks */}
        <motion.path
          d="M40 30 L80 60 L100 90 L95 120"
          stroke="#ef4444"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 2, duration: 2 }}
        />
        <motion.path
          d="M150 50 L180 70 L200 85"
          stroke="#f59e0b"
          strokeWidth="1.5"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 2.5, duration: 1.5 }}
        />
        {/* Detection boxes */}
        <motion.rect
          x="25" y="15" width="90" height="120" rx="2"
          stroke="#ef4444" strokeWidth="1.5" fill="none" strokeDasharray="4"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.5, 1] }}
          transition={{ delay: 3, duration: 2, repeat: Infinity }}
        />
        <motion.rect
          x="135" y="35" width="80" height="65" rx="2"
          stroke="#f59e0b" strokeWidth="1.5" fill="none" strokeDasharray="4"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.5, 1] }}
          transition={{ delay: 3.3, duration: 2, repeat: Infinity }}
        />
      </svg>

      {/* Scan line */}
      <motion.div
        className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute inset-x-0 -top-4 h-8 bg-gradient-to-b from-transparent via-emerald-400/5 to-transparent" />
      </motion.div>

      {/* Label */}
      <motion.div
        className="absolute top-2 left-2 px-2 py-0.5 rounded bg-red-500/90 text-[8px] font-bold text-white uppercase tracking-wider"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 3 }}
      >
        2 Cracks Found
      </motion.div>
    </motion.div>
  );
}

/* ─── Glowing Ring ─── */
function GlowRing() {
  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
      <motion.div
        className="w-[600px] h-[600px] rounded-full border border-emerald-500/10"
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.1, 0.3] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div
        className="absolute inset-8 rounded-full border border-cyan-500/10"
        animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.1, 0.2], rotate: [0, 180, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-16 rounded-full border border-violet-500/10"
        animate={{ scale: [1, 1.08, 1], opacity: [0.15, 0.05, 0.15], rotate: [360, 180, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

/* ─── Stats Ticker ─── */
function StatsTicker() {
  const stats = [
    "12,847 scans completed",
    "99.2% detection accuracy",
    "3.2s average scan time",
    "47 countries",
    "Critical crack detected — Bridge A-14",
    "System operational — all nodes active",
    "New model v4.7 deployed",
    "89 cracks detected today",
  ];

  return (
    <motion.div
      className="absolute bottom-24 left-0 right-0 overflow-hidden pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2 }}
    >
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {[...stats, ...stats].map((stat, i) => (
          <span
            key={i}
            className="text-xs text-zinc-600 flex items-center gap-2"
          >
            <span className="w-1 h-1 rounded-full bg-emerald-500/50" />
            {stat}
          </span>
        ))}
      </motion.div>
    </motion.div>
  );
}

/* ─── Mouse Follower ─── */
function useMousePosition() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handler = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);
  return pos;
}

/* ─── NEW COMPONENTS ─── */
const NAV_ITEMS = [
  {
    label: "Solutions",
    items: [
      { title: "Road Damage Detection", desc: "Detect potholes, cracks and pavement failures using AI." },
      { title: "Bridge Structural Monitoring", desc: "Monitor bridge cracks and structural health in real time." },
      { title: "Pipeline Leak Detection", desc: "Identify leakage and corrosion from visual inspections." },
      { title: "Smart City Monitoring", desc: "Centralized infrastructure monitoring for municipalities." }
    ]
  },
  {
    label: "AI Platform",
    items: [
      { title: "AI Detection Engine", desc: "YOLOv8 + Computer Vision" },
      { title: "Severity Analysis", desc: "Automatic damage severity scoring" },
      { title: "Predictive Maintenance", desc: "Forecast infrastructure deterioration" },
      { title: "Analytics Dashboard", desc: "Live monitoring & reporting" },
      { title: "Damage History", desc: "Historical inspection records" }
    ]
  },
  {
    label: "Technology",
    items: [
      { title: "Computer Vision" }, { title: "Deep Learning" }, { title: "YOLOv8" }, { title: "OpenCV" }, { title: "Edge AI" }, { title: "Cloud Integration" }
    ]
  },
  {
    label: "Resources",
    items: [
      { title: "Documentation" }, { title: "API Reference" }, { title: "Research Papers" }, { title: "Architecture" }, { title: "GitHub" }, { title: "Changelog" }
    ]
  },
  {
    label: "Company",
    items: [
      { title: "About Project" }, { title: "Contact" }, { title: "Future Roadmap" }, { title: "Team" }
    ]
  }
];

function NavDropdown({ item, index }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <motion.button
        className="group relative flex items-center gap-1 text-[13px] font-semibold text-zinc-400 hover:text-white transition-colors py-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 + index * 0.1 }}
      >
        {item.label}
        <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isOpen ? 'rotate-180 text-emerald-400' : ''}`} />
        <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-emerald-400 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-full left-1/2 -translate-x-1/2 pt-4 w-[300px] z-[100]"
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.6)] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
              <div className="relative z-10 flex flex-col gap-0.5">
                {item.items.map((subItem, idx) => (
                  <a
                    key={idx}
                    href="#"
                    className="block px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all group/item"
                  >
                    <div className="text-[13px] font-bold text-zinc-200 group-hover/item:text-emerald-400 transition-colors flex items-center gap-2">
                      {subItem.title}
                    </div>
                    {subItem.desc && (
                      <div className="text-[11px] text-zinc-500 mt-1 leading-relaxed group-hover/item:text-zinc-400 transition-colors">
                        {subItem.desc}
                      </div>
                    )}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BentoFeatures() {
  return (
    <div className="relative z-20 w-full max-w-6xl mx-auto px-8 py-24">
      <div className="text-center mb-16">
        <motion.h2 
          className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Intelligence at every layer.
        </motion.h2>
        <motion.p 
          className="text-zinc-400 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          Our platform combines real-time computer vision with predictive analytics to give you a complete picture of your infrastructure health.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Large Feature 1 */}
        <motion.div 
          className="md:col-span-2 relative h-[380px] rounded-3xl bg-zinc-900/40 backdrop-blur-xl border border-white/5 overflow-hidden group"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute top-8 left-8 z-10 max-w-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Real-time YOLOv8 Engine</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">Process video streams at 60 FPS to detect cracks, potholes, and structural anomalies instantly.</p>
          </div>
          <div className="absolute right-0 bottom-0 w-64 h-44 opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none translate-x-8 translate-y-8">
             <ScanVisualization />
          </div>
        </motion.div>

        {/* Feature 2: Live Metrics */}
        <motion.div 
          className="relative h-[380px] rounded-3xl bg-zinc-900/40 backdrop-blur-xl border border-white/5 overflow-hidden group p-8 flex flex-col justify-between"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Global Live Metrics</h3>
            <p className="text-sm text-zinc-400">Live data processing across our global network of sensors.</p>
          </div>

          <div className="space-y-4 relative z-10">
            <div className="p-4 rounded-xl bg-zinc-950/50 border border-white/5">
              <div className="text-xs text-zinc-500 mb-1">Total Scans Today</div>
              <div className="text-2xl font-black text-white flex items-center gap-2">
                24,192 <span className="text-xs text-emerald-400 font-medium flex items-center"><ArrowRight className="w-3 h-3 -rotate-45" /> +12%</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-zinc-950/50 border border-white/5">
              <div className="text-xs text-zinc-500 mb-1">Anomalies Found</div>
              <div className="text-2xl font-black text-white">
                1,843
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feature 3: Predictive */}
        <motion.div 
          className="relative h-[300px] rounded-3xl bg-zinc-900/40 backdrop-blur-xl border border-white/5 overflow-hidden group p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4 text-violet-400 relative z-10">
             <Brain className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 relative z-10">Predictive Maintenance</h3>
          <p className="text-sm text-zinc-400 relative z-10">AI predicts structural failures before they happen, saving millions in emergency repair costs.</p>
          
          <div className="absolute bottom-8 right-8 left-8 h-12 rounded-xl bg-zinc-950/50 border border-white/5 overflow-hidden flex items-center px-4 gap-4 z-10">
            <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
               <motion.div className="h-full bg-violet-500 rounded-full" animate={{ width: ["0%", "100%", "0%"] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
            </div>
          </div>
        </motion.div>

        {/* Feature 4: Integration */}
        <motion.div 
          className="md:col-span-2 relative h-[300px] rounded-3xl bg-zinc-900/40 backdrop-blur-xl border border-white/5 overflow-hidden group p-8 flex flex-col md:flex-row items-center gap-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <div className="absolute inset-0 bg-gradient-to-tl from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="flex-1 max-w-sm relative z-10 text-center md:text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400 mx-auto md:mx-0">
               <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Seamless Integration</h3>
            <p className="text-sm text-zinc-400">Connects with existing city infrastructure, drone feeds, and mobile apps via our enterprise API.</p>
          </div>

          <div className="flex-1 flex justify-center items-center relative z-10">
             <div className="relative w-40 h-40 md:w-48 md:h-48 border border-white/10 rounded-full animate-[spin_20s_linear_infinite]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-zinc-800 border border-emerald-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  <Database className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-8 h-8 rounded-full bg-zinc-800 border border-cyan-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                </div>
             </div>
             <div className="absolute w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-zinc-900 border border-white/20 flex items-center justify-center shadow-2xl z-10">
                <Wifi className="w-5 h-5 md:w-6 md:h-6 text-white" />
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function PremiumFooter() {
  const container = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { staggerChildren: 0.1, duration: 0.6 } }
  };
  
  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <footer className="relative z-20 bg-[#06070A] pt-20 border-t border-white/5">
      <motion.div 
        className="max-w-6xl mx-auto px-8 pb-12"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          <motion.div variants={item} className="lg:col-span-4">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                  <rect width="24" height="24" rx="6" fill="#10b981" fillOpacity="0.2" />
                  <path d="M5 24 L11 6" stroke="#10b981" strokeWidth="1" strokeOpacity="0.8" fill="none" />
                  <path d="M19 24 L13 6" stroke="#10b981" strokeWidth="1" strokeOpacity="0.8" fill="none" />
                  <path d="M12 24 L12 6" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
                </svg>
              </div>
              <span className="text-sm font-extrabold text-white tracking-wide">
                INFRASIGHT
              </span>
            </div>
            <p className="text-[13px] font-bold text-white mb-2">AI-powered Infrastructure Damage Detection Platform</p>
            <p className="text-xs text-zinc-400 leading-relaxed mb-6 pr-4">
              Helping governments, municipalities and infrastructure authorities detect structural damage early using Artificial Intelligence, Computer Vision and Predictive Analytics.
            </p>
            <div className="flex items-center gap-3">
              {[GithubIcon, LinkedinIcon, Mail, TwitterIcon].map((Icon, idx) => (
                <motion.a
                  key={idx}
                  href="#"
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all"
                  whileHover={{ scale: 1.1 }}
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          <motion.div variants={item} className="lg:col-span-3 lg:pl-8">
            <h4 className="text-white font-bold mb-6 text-sm">Solutions</h4>
            <ul className="space-y-3">
              {["Road Damage Detection", "Bridge Monitoring", "Pipeline Inspection", "Infrastructure Analytics", "Smart City Platform", "Government Dashboard"].map(link => (
                <li key={link}>
                  <motion.a href="#" className="inline-block text-xs text-zinc-400 hover:text-emerald-400 transition-colors" whileHover={{ x: 4 }}>
                    {link}
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={item} className="lg:col-span-3">
            <h4 className="text-white font-bold mb-6 text-sm">Technology</h4>
            <ul className="space-y-3">
              {["YOLOv8", "Computer Vision", "OpenCV", "Deep Learning", "Predictive Analytics", "Real-Time Detection", "Cloud Infrastructure"].map(link => (
                <li key={link}>
                  <motion.a href="#" className="inline-block text-xs text-zinc-400 hover:text-emerald-400 transition-colors" whileHover={{ x: 4 }}>
                    {link}
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={item} className="lg:col-span-2">
            <h4 className="text-white font-bold mb-6 text-sm">Resources</h4>
            <ul className="space-y-3">
              {["Documentation", "Research Papers", "API Reference", "Architecture", "Project Roadmap", "Support"].map(link => (
                <li key={link}>
                  <motion.a href="#" className="inline-block text-xs text-zinc-400 hover:text-emerald-400 transition-colors" whileHover={{ x: 4 }}>
                    {link}
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </motion.div>

      <div className="border-t border-white/5 bg-[#030407]">
        <div className="max-w-6xl mx-auto px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-zinc-500">
          <div>
            © 2026 INFRASIGHT <span className="mx-2 opacity-30">|</span> AI Infrastructure Monitoring Platform.
          </div>
          <div className="font-medium text-zinc-400">
            React • FastAPI • YOLOv8 • OpenCV • Tailwind CSS
          </div>
          <div>
            Built for Smart Cities & Sustainable Infrastructure.
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── MAIN HERO ─── */
export default function HeroPage({ onEnter }) {
  const [hovered, setHovered] = useState(false);
  const mouse = useMousePosition();
  const [loaded, setLoaded] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 300);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#06070A] overflow-x-hidden font-sans">
      <div className="relative h-screen bg-zinc-950 overflow-hidden flex flex-col">
      {/* Background layers */}
      <GridBackground />
      <FloatingOrbs />
      <ParticleField />
      <GlowRing />

      {/* Mouse-following spotlight */}
      <motion.div
        className="fixed w-[500px] h-[500px] rounded-full pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(16,185,129,0.04) 0%, transparent 70%)",
          left: mouse.x - 250,
          top: mouse.y - 250,
        }}
        animate={{ left: mouse.x - 250, top: mouse.y - 250 }}
        transition={{ type: "spring", damping: 30, stiffness: 200 }}
      />

      {/* Nav */}
      <motion.nav
        className="relative z-30 flex items-center justify-between px-8 py-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
            whileHover={{ scale: 1.1, rotate: 5 }}
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
          <span className="text-base font-extrabold text-white tracking-wide">
            INFRA<span className="text-emerald-400">SIGHT</span>
          </span>
        </div>

        <div className="flex items-center gap-6">
          {NAV_ITEMS.map((item, i) => (
            <NavDropdown key={item.label} item={item} index={i} />
          ))}
          <motion.button
            onClick={onEnter}
            className="px-4 py-2 rounded-lg bg-zinc-800/80 border border-zinc-700/50 text-xs text-zinc-300 hover:text-white hover:border-zinc-600 transition-all"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sign In
          </motion.button>
        </div>
      </motion.nav>

      {/* Main hero content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-8">
        <div className="max-w-6xl w-full flex items-center justify-between gap-16">
          {/* Left — Text */}
          <div className="flex-1 max-w-xl">
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/20 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-[11px] text-emerald-400 font-medium">
                v4.7 — Next-gen crack detection is here
              </span>
              <Sparkles className="w-3 h-3 text-emerald-400" />
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="text-4xl lg:text-5xl xl:text-6xl font-black text-white leading-[1.05] tracking-tighter mb-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              Detect structural{" "}
              <span className="relative">
                <span className="relative z-10 bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                  cracks
                </span>
                <motion.span
                  className="absolute -inset-1 bg-emerald-500/10 rounded-lg -z-0"
                  animate={{ opacity: [0, 0.5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </span>{" "}
              before they become{" "}
              <span className="bg-gradient-to-r from-red-400 to-amber-400 bg-clip-text text-transparent">
                disasters
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-base text-zinc-400 leading-relaxed mb-6 max-w-lg font-medium"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              AI-powered command center that detects infrastructure damage,
              estimates repair costs, and tells authorities exactly what to fix.
              From roads to bridges — smart maintenance starts here.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex items-center gap-4 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
            >
              <motion.button
                onClick={onEnter}
                className="group relative px-6 py-3 rounded-xl bg-emerald-500 text-black font-bold text-sm flex items-center gap-2 overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400"
                  initial={{ x: "-100%" }}
                  animate={hovered ? { x: "0%" } : { x: "-100%" }}
                  transition={{ duration: 0.3 }}
                />
                <span className="relative z-10 flex items-center gap-2">
                  Launch Dashboard
                  <motion.span
                    animate={{ x: hovered ? 4 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.span>
                </span>
              </motion.button>

              <motion.button
                onClick={() => setIsVideoOpen(true)}
                className="px-6 py-3 rounded-xl border border-zinc-700 text-zinc-300 font-medium text-sm hover:border-zinc-500 hover:text-white transition-all flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play className="w-4 h-4" />
                Watch Demo
              </motion.button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              className="flex items-center gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
            >
              {[
                { icon: Shield, text: "Enterprise-grade" },
                { icon: Zap, text: "Real-time analysis" },
                { icon: Brain, text: "AI-powered" },
              ].map((item, i) => (
                <motion.div
                  key={item.text}
                  className="flex items-center gap-1.5"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.3 + i * 0.15 }}
                >
                  <item.icon className="w-3.5 h-3.5 text-emerald-400/60" />
                  <span className="text-[11px] text-zinc-500">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right — Floating elements composition */}
          <div className="flex-1 relative h-[500px] hidden lg:block">
            {/* Main scan card */}
            <FloatingCard x="10%" y="15%" delay={1.2} rotate={-3}>
              <ScanVisualization />
            </FloatingCard>

            {/* Stats card */}
            <FloatingCard x="55%" y="5%" delay={1.5} rotate={5}>
              <div className="w-48 p-4 rounded-xl bg-zinc-900/70 backdrop-blur-xl border border-zinc-800/50 shadow-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span className="text-[11px] font-semibold text-white">Live Stats</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-zinc-500">Accuracy</span>
                    <span className="text-[11px] font-bold text-emerald-400">99.2%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                      initial={{ width: "0%" }}
                      animate={{ width: "99.2%" }}
                      transition={{ delay: 2, duration: 1.5 }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-zinc-500">Speed</span>
                    <span className="text-[11px] font-bold text-cyan-400">3.2s</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500"
                      initial={{ width: "0%" }}
                      animate={{ width: "85%" }}
                      transition={{ delay: 2.2, duration: 1.5 }}
                    />
                  </div>
                </div>
              </div>
            </FloatingCard>

            {/* Alert card */}
            <FloatingCard x="60%" y="50%" delay={1.8} rotate={-4}>
              <motion.div
                className="w-52 p-3 rounded-xl bg-red-500/5 backdrop-blur-xl border border-red-500/20 shadow-2xl"
                animate={{ boxShadow: ["0 0 0px rgba(239,68,68,0)", "0 0 20px rgba(239,68,68,0.1)", "0 0 0px rgba(239,68,68,0)"] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-[11px] font-bold text-red-400">Critical Alert</span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed">
                  Structural crack detected on Bridge A-14. Width: 2.4mm.
                  Immediate inspection required.
                </p>
                <div className="mt-2 flex gap-2">
                  <div className="px-2 py-0.5 rounded bg-red-500/10 text-[9px] text-red-400 font-semibold">
                    CRITICAL
                  </div>
                  <div className="px-2 py-0.5 rounded bg-zinc-800 text-[9px] text-zinc-400">
                    2 min ago
                  </div>
                </div>
              </motion.div>
            </FloatingCard>

            {/* Mini floating icons */}
            <FloatingCard x="5%" y="65%" delay={2} rotate={10}>
              <motion.div
                className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center backdrop-blur-xl"
                animate={{ rotate: [10, -5, 10] }}
                transition={{ duration: 6, repeat: Infinity }}
              >
                <Cpu className="w-5 h-5 text-violet-400" />
              </motion.div>
            </FloatingCard>

            <FloatingCard x="40%" y="75%" delay={2.2} rotate={-8}>
              <motion.div
                className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center backdrop-blur-xl"
                animate={{ rotate: [-8, 5, -8] }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                <Database className="w-5 h-5 text-cyan-400" />
              </motion.div>
            </FloatingCard>

            <FloatingCard x="75%" y="35%" delay={2.4} rotate={6}>
              <motion.div
                className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center backdrop-blur-xl"
                animate={{ rotate: [6, -3, 6] }}
                transition={{ duration: 7, repeat: Infinity }}
              >
                <Wifi className="w-4 h-4 text-amber-400" />
              </motion.div>
            </FloatingCard>

            {/* Connection lines (SVG) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <motion.line
                x1="35" y1="35" x2="65" y2="15"
                stroke="url(#lineGrad1)" strokeWidth="0.15"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 2.5, duration: 1.5 }}
              />
              <motion.line
                x1="65" y1="25" x2="70" y2="55"
                stroke="url(#lineGrad2)" strokeWidth="0.15"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 2.8, duration: 1.5 }}
              />
              <defs>
                <linearGradient id="lineGrad1">
                  <stop offset="0%" stopColor="rgba(16,185,129,0.3)" />
                  <stop offset="100%" stopColor="rgba(6,182,212,0.3)" />
                </linearGradient>
                <linearGradient id="lineGrad2">
                  <stop offset="0%" stopColor="rgba(6,182,212,0.3)" />
                  <stop offset="100%" stopColor="rgba(239,68,68,0.3)" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* Stats ticker */}
      <StatsTicker />

      {/* Bottom bar */}
      <motion.div
        className="relative z-20 flex items-center justify-center pb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <motion.div
          className="flex flex-col items-center gap-1 cursor-pointer"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          onClick={onEnter}
        >
          <span className="text-[10px] text-zinc-600 uppercase tracking-widest">
            Tap to enter
          </span>
          <ChevronDown className="w-4 h-4 text-zinc-600" />
        </motion.div>
      </motion.div>

      {/* Video Fullscreen Interactive Overlay */}
      <AnimatePresence>
        {isVideoOpen && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            {/* Subtle exit button */}
            <button
              className="absolute top-6 right-6 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md"
              onClick={() => setIsVideoOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
            
            <video
              src="/demo_video.mp4"
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              onEnded={() => setIsVideoOpen(false)}
              onContextMenu={(e) => e.preventDefault()}
            />
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      {/* Scrollable content below hero */}
      <BentoFeatures />
      <PremiumFooter />
    </div>
  );
}
