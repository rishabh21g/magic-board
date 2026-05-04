import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown } from "lucide-react";
import { useBoardSocket } from "../hooks/useBoardSocket";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Player {
  rank: number;
  name: string;
  cells: number;
  crown?: boolean;
}

interface LeaderboardRowProps {
  player: Player;
  index: number;
  maxCells: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CINZEL: React.CSSProperties = { fontFamily: "'Cinzel', serif" };
const MAX_CELLS = 500;
const RANK_MEDALS: string[] = ["🥇", "🥈", "🥉"];



// ─── LeaderboardRow ───────────────────────────────────────────────────────────

const LeaderboardRow: React.FC<LeaderboardRowProps> = ({
  player,
  index,
  maxCells,
}) => {
  const { rank, name, cells, crown } = player;
  const barPct = Math.min((cells / maxCells) * 100, 100);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, layout: { duration: 0.4 } }}
      className="grid grid-cols-[48px_1fr_120px_80px] gap-0 px-6 py-4 border-b border-[#c8a84b]/10 last:border-0 items-center hover:bg-[#c8a84b]/5 transition-colors"
    >
      {/* Rank */}
      <div className="flex items-center">
        {rank <= 3 ? (
          <span className="text-lg leading-none">{RANK_MEDALS[rank - 1]}</span>
        ) : (
          <span
            className="text-sm text-[#c8a84b]/40 font-bold"
            style={CINZEL}
          >
            {rank}
          </span>
        )}
      </div>

      {/* Name + avatar */}
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#0d0a00] font-black text-sm bg-[#c8a84b]"
        >
          {name[0]}
        </div>
        <div>
          <div className="flex items-center gap-1">
            <span
              className="text-[#f5e6c8] font-semibold text-sm"
              style={CINZEL}
            >
              {name}
            </span>
            {crown && <Crown className="w-3.5 h-3.5 text-[#c8a84b]" />}
          </div>
          {index === 0 && (
            <span
              className="text-[9px] text-[#e85d04] tracking-widest uppercase"
              style={CINZEL}
            >
              Reigning Champion
            </span>
          )}
        </div>
      </div>

      {/* Territory bar */}
      <div className="flex items-center px-2">
        <div className="flex-1 h-2 rounded-full bg-[#1a1400] overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${barPct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
           
          />
        </div>
      </div>

      {/* Cell count */}
      <div className="text-right">
        <AnimatePresence mode="wait">
          <motion.span
            key={cells}
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 8, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="text-[#c8a84b] font-bold text-sm"
            style={CINZEL}
          >
            {cells.toLocaleString()}
          </motion.span>
        </AnimatePresence>
        <div
          className="text-[9px] text-[#c8a84b]/30 tracking-wider uppercase"
          style={CINZEL}
        >
          cells
        </div>
      </div>
    </motion.div>
  );
};

// ─── Leaderboard ──────────────────────────────────────────────────────────────

const Leaderboard: React.FC = () => {
  const { leaderboard } = useBoardSocket();

  const players = useMemo((): Player[] => {
    return leaderboard
      .sort((a, b) => b.count - a.count)
      .map((entry, index) => ({
        rank: index + 1,
        name: entry.userID.slice(0, 8), 
        cells: entry.count,
        crown: index === 0,
      }));
  }, [leaderboard]);

  return (
    <section id="leaderboard" className="relative py-24 px-4">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-[#c8a84b]/5 blur-[100px]" />
      </div>

      <div className="relative max-w-3xl mx-auto">
        {/* Heading */}
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
            🏆 Hall of Champions 🏆
          </p>
          <h2
            className="text-4xl md:text-5xl font-black text-[#f5e6c8]"
            style={{
              fontFamily: "'Cinzel Decorative', 'Cinzel', serif",
              textShadow: "0 0 40px rgba(200,168,75,0.3)",
            }}
          >
            Leaderboard
          </h2>
          <div className="flex items-center justify-center gap-2 mt-4">
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-[#4ade80]"
            />
            <span
              className="text-[#4ade80] text-xs tracking-widest uppercase"
              style={CINZEL}
            >
              Updating in real time
            </span>
          </div>
        </motion.div>

        {/* Board */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="rounded-2xl border border-[#c8a84b]/25 bg-[#0d0a00]/90 backdrop-blur-xl overflow-hidden shadow-[0_0_60px_rgba(200,168,75,0.08)]"
        >
          {/* Table header */}
          <div
            className="grid grid-cols-[48px_1fr_120px_80px] gap-0 px-6 py-3 border-b border-[#c8a84b]/20 text-[10px] tracking-[0.2em] uppercase text-[#c8a84b]/40"
            style={CINZEL}
          >
            <span>#</span>
            <span>Warrior</span>
            <span className="text-center">Territory</span>
            <span className="text-right">Cells</span>
          </div>

          <AnimatePresence>
            {players.map((player, i) => (
              <LeaderboardRow
                key={player.name}
                player={player}
                index={i}
                maxCells={MAX_CELLS}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default Leaderboard;