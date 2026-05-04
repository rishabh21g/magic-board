import React from "react";
import { motion } from "framer-motion";
import MagicGrid from "./MagicGrid";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CornerRuneProps {
  className?: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const CINZEL: React.CSSProperties = { fontFamily: "'Cinzel', serif" };

/** Decorative corner SVG rune ornament */
const CornerRune: React.FC<CornerRuneProps> = ({ className = "" }) => (
  <div className={`absolute w-6 h-6 pointer-events-none opacity-30 ${className}`}>
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 2 L10 2 L2 10 Z" stroke="#c8a84b" strokeWidth="1.2" />
      <line x1="2" y1="2" x2="2" y2="16" stroke="#c8a84b" strokeWidth="0.8" strokeDasharray="2 2" />
      <line x1="2" y1="2" x2="16" y2="2" stroke="#c8a84b" strokeWidth="0.8" strokeDasharray="2 2" />
    </svg>
  </div>
);

// ─── GridSection ──────────────────────────────────────────────────────────────

/**
 * GridSection — Apple-outlet–style glass enclosure around MagicGrid.
 * Provides ambient glow rings, chrome top/bottom bars, corner runes,
 * and a live-status indicator.
 */
const GridSection: React.FC = () => (
  <section id="arena" className="relative py-24 px-4">
    {/* Section heading */}
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="text-center mb-12"
    >
      <p
        className="text-[#c8a84b]/60 text-xs tracking-[0.3em] uppercase mb-3"
        style={CINZEL}
      >
        ⚔ The Battlefield ⚔
      </p>
      <h2
        className="text-4xl md:text-5xl font-black text-[#f5e6c8]"
        style={{
          fontFamily: "'Cinzel Decorative', 'Cinzel', serif",
          textShadow: "0 0 40px rgba(200,168,75,0.3)",
        }}
      >
        Claim the Grid
      </h2>
      <p className="mt-3 text-[#f5e6c8]/50 max-w-md mx-auto text-sm">
        Click any unclaimed cell to plant your flag. Others see it live.
        Control the most territory to rule the board.
      </p>
    </motion.div>

    {/* Enclosure wrapper */}
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative max-w-4xl mx-auto"
    >
      {/* Outer glow layers */}
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-[#c8a84b]/20 via-[#e85d04]/10 to-[#c8a84b]/20 blur-2xl pointer-events-none" />
      <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-[#c8a84b]/10 to-[#e85d04]/5 blur-md pointer-events-none" />

      {/* Glass container */}
      <div className="relative rounded-2xl border border-[#c8a84b]/30 bg-[#0d0a00]/80 backdrop-blur-xl overflow-hidden shadow-[0_0_80px_rgba(200,168,75,0.15),0_0_0_1px_rgba(200,168,75,0.1)]">
        {/* Top chrome bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#c8a84b]/20 bg-[#1a1400]/60">
          {/* Traffic lights */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#e85d04]/80" />
            <div className="w-3 h-3 rounded-full bg-[#c8a84b]/80" />
            <div className="w-3 h-3 rounded-full bg-[#4ade80]/60" />
          </div>
          <span
            className="text-[#c8a84b]/60 text-xs tracking-widest uppercase"
            style={CINZEL}
          >
            Magic Grid — Live Arena
          </span>
          {/* Live dot */}
          <div className="flex items-center gap-1.5">
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-[#4ade80]"
            />
            <span
              className="text-[#4ade80] text-xs tracking-widest uppercase"
              style={CINZEL}
            >
              Live
            </span>
          </div>
        </div>

        {/* Canvas area */}
        <div className="relative p-4 md:p-6">
          <CornerRune className="top-2 left-2" />
          <CornerRune className="top-2 right-2 scale-x-[-1]" />
          <CornerRune className="bottom-2 left-2 scale-y-[-1]" />
          <CornerRune className="bottom-2 right-2 scale-x-[-1] scale-y-[-1]" />

          {/*
           * MagicGrid is rendered here.
           * Replace components/MagicGrid.tsx with your real canvas component.
           */}
          <MagicGrid />
        </div>

        {/* Bottom status bar */}
        <div
          className="flex items-center justify-between px-5 py-2.5 border-t border-[#c8a84b]/20 bg-[#1a1400]/60 text-[10px] text-[#c8a84b]/40 tracking-widest uppercase"
          style={CINZEL}
        >
          <span>⚡ WebSocket Connected</span>
          <span>Click a cell to capture it</span>
          <span>🗡 Conquer the board</span>
        </div>
      </div>
    </motion.div>
  </section>
);

export default GridSection;