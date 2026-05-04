import React from "react";
import { motion } from "framer-motion";
import { Sword, Trophy, Flame, type LucideIcon } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BadgeItem {
  icon: LucideIcon;
  label: string;
}

interface EmberProps {
  delay: number;
  x: number;
  size: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CINZEL: React.CSSProperties = { fontFamily: "'Cinzel', serif" };
const CINZEL_DECO: React.CSSProperties = {
  fontFamily: "'Cinzel Decorative', 'Cinzel', serif",
};

const BADGE_DATA: BadgeItem[] = [
  { icon: Sword, label: "Real-time Battles" },
  { icon: Trophy, label: "Live Leaderboard" },
  { icon: Flame, label: "Territory Wars" },
];

const EMBERS: EmberProps[] = Array.from({ length: 18 }, (_, i) => ({
  delay: i * 0.3,
  x: 10 + ((i * 73) % 80),
  size: 2 + (i % 3),
}));

// ─── Sub-components ───────────────────────────────────────────────────────────

const Ember: React.FC<EmberProps> = ({ delay, x, size }) => (
  <motion.div
    className="absolute rounded-full bg-[#c8a84b] pointer-events-none"
    style={{ width: size, height: size, left: `${x}%`, bottom: "-10px" }}
    initial={{ opacity: 0, y: 0 }}
    animate={{
      opacity: [0, 0.8, 0.6, 0],
      y: [0, -180, -320, -400],
      x: [0, 10, -8, 14],
    }}
    transition={{
      duration: 4 + Math.random() * 2,
      delay,
      repeat: Infinity,
      ease: "easeOut",
    }}
  />
);

const CornerOrnament: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`absolute opacity-20 ${className}`}>
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
      <path d="M2 2 L20 2 L2 20 Z" stroke="#c8a84b" strokeWidth="1.5" />
      <path d="M2 2 L2 30" stroke="#c8a84b" strokeWidth="1" strokeDasharray="3 3" />
      <path d="M2 2 L30 2" stroke="#c8a84b" strokeWidth="1" strokeDasharray="3 3" />
    </svg>
  </div>
);

// ─── Hero ─────────────────────────────────────────────────────────────────────

const Hero: React.FC = () => (
  <section className="relative min-h-screen flex flex-col items-center justify-center pt-16 pb-24 overflow-hidden">
    {/* Radial glow */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full bg-[#c8a84b]/[0.08] blur-[120px]" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] rounded-full bg-[#e85d04]/10 blur-[80px]" />
    </div>

    {/* Ember particles */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {EMBERS.map((e, i) => (
        <Ember key={i} {...e} />
      ))}
    </div>

    {/* Corner ornaments */}
    <CornerOrnament className="top-20 left-6" />
    <CornerOrnament className="top-20 right-6 scale-x-[-1]" />

    <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
      {/* Pre-title pill */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#c8a84b]/30 bg-[#c8a84b]/10 text-[#c8a84b] text-xs tracking-[0.2em] uppercase mb-8"
        style={CINZEL}
      >
        <Flame className="w-3 h-3" />
        <span>The Arena is Open</span>
        <Flame className="w-3 h-3" />
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="text-6xl md:text-8xl font-black mb-4 leading-none tracking-tight"
        style={{
          ...CINZEL_DECO,
          background: "linear-gradient(180deg, #f5e6c8 0%, #c8a84b 50%, #8b5e0a 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          filter: "drop-shadow(0 0 40px rgba(200,168,75,0.4))",
        }}
      >
        MagicBoard
      </motion.h1>

      {/* Rune divider */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="flex items-center justify-center gap-3 my-5"
      >
        <div className="h-px w-24 bg-gradient-to-r from-transparent to-[#c8a84b]/60" />
        <div className="w-2 h-2 rotate-45 bg-[#c8a84b]" />
        <div className="h-px w-24 bg-gradient-to-l from-transparent to-[#c8a84b]/60" />
      </motion.div>

      {/* Sub-headlines */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.7 }}
        className="text-xl md:text-2xl text-[#c8a84b]/80 mb-3 font-semibold tracking-wide"
        style={CINZEL}
      >
        Claim Your Territory. Rank on the Leaderboard.
      </motion.p>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.85 }}
        className="text-lg md:text-xl text-[#f5e6c8]/50 mb-12 max-w-xl mx-auto"
      >
        Conquer the grid in real-time. Every block you capture is seen by every
        warrior on the board — instantly.
      </motion.p>

      {/* Feature badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0 }}
        className="flex flex-wrap justify-center gap-4 mb-12"
      >
        {BADGE_DATA.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1400]/80 border border-[#c8a84b]/20 text-[#c8a84b]/80 text-sm"
          >
            <Icon className="w-4 h-4 text-[#c8a84b]" />
            <span style={CINZEL}>{label}</span>
          </div>
        ))}
      </motion.div>

      {/* CTA buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.1 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <motion.a
          href="#arena"
          whileHover={{ scale: 1.04, boxShadow: "0 0 40px rgba(200,168,75,0.5)" }}
          whileTap={{ scale: 0.97 }}
          className="px-8 py-4 rounded-xl font-bold text-base tracking-widest uppercase text-[#0d0a00] bg-gradient-to-b from-[#f0c040] via-[#c8a84b] to-[#8b5e0a] border border-[#f0c040]/60 shadow-[0_0_24px_rgba(200,168,75,0.3)] transition-all duration-200 cursor-pointer"
          style={CINZEL}
        >
          ⚔ Enter the Arena
        </motion.a>
        <motion.a
          href="#leaderboard"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="px-8 py-4 rounded-xl font-bold text-base tracking-widest uppercase text-[#c8a84b] bg-[#c8a84b]/10 border border-[#c8a84b]/30 hover:bg-[#c8a84b]/20 transition-all duration-200 cursor-pointer"
          style={CINZEL}
        >
          🏆 View Rankings
        </motion.a>
      </motion.div>
    </div>

    {/* Scroll indicator */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.6 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#c8a84b]/40 text-xs tracking-widest uppercase"
      style={CINZEL}
    >
      <span>Scroll to Battle</span>
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="w-0.5 h-6 bg-gradient-to-b from-[#c8a84b]/40 to-transparent rounded-full"
      />
    </motion.div>
  </section>
);

export default Hero;