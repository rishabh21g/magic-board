import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Player {
  rank: number;
  name: string;
  cells: number;
  color: string;
  crown?: boolean;
}

interface WsMessage {
  players?: Player[];
}

export interface LeaderboardProps {
  wsUrl?: string;
}

interface LeaderboardRowProps {
  player: Player;
  index: number;
  isPulsing: boolean;
  maxCells: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CINZEL: React.CSSProperties = { fontFamily: "'Cinzel', serif" };
const MAX_CELLS = 500;
const RANK_MEDALS: string[] = ["🥇", "🥈", "🥉"];

const SEED_DATA: Player[] = [
  { rank: 1, name: "DarkKnight",  cells: 248, color: "#c8a84b", crown: true },
  { rank: 2, name: "ShadowMage",  cells: 201, color: "#818cf8" },
  { rank: 3, name: "IronWarden",  cells: 188, color: "#e85d04" },
  { rank: 4, name: "StormCaller", cells: 142, color: "#4ade80" },
  { rank: 5, name: "VoidHunter",  cells: 118, color: "#f472b6" },
  { rank: 6, name: "RuneSeeker",  cells: 97,  color: "#38bdf8" },
  { rank: 7, name: "GoldReaper",  cells: 74,  color: "#fb923c" },
  { rank: 8, name: "AshBlade",    cells: 53,  color: "#a3e635" },
];

// ─── LeaderboardRow ───────────────────────────────────────────────────────────

const LeaderboardRow: React.FC<LeaderboardRowProps> = ({
  player,
  index,
  isPulsing,
  maxCells,
}) => {
  const { rank, name, cells, color, crown } = player;
  const barPct = Math.min((cells / maxCells) * 100, 100);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{
        opacity: 1,
        x: 0,
        backgroundColor: isPulsing
          ? "rgba(200,168,75,0.08)"
          : "rgba(0,0,0,0)",
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
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#0d0a00] font-black text-sm flex-shrink-0"
          style={{ backgroundColor: color }}
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
            style={{
              background: `linear-gradient(90deg, ${color}88, ${color})`,
              boxShadow: `0 0 8px ${color}66`,
            }}
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

/**
 * Leaderboard — Live ranking table.
 *
 * Pass `wsUrl` to connect to your WebSocket server.
 * Expected message shape: `{ players: Player[] }`
 * Falls back to seed data when no wsUrl is provided.
 */
const Leaderboard: React.FC<LeaderboardProps> = ({ wsUrl }) => {
  const [players, setPlayers] = useState<Player[]>(SEED_DATA);
  const [pulse, setPulse] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const handleMessage = useCallback(
    (prev: Player[], next: Player[]): Player[] => {
      const changed = next.find((p, i) => prev[i]?.cells !== p.cells);
      if (changed) setPulse(changed.name);
      return next;
    },
    []
  );

  useEffect(() => {
    if (!wsUrl) return;

    wsRef.current = new WebSocket(wsUrl);
    wsRef.current.onmessage = (e: MessageEvent<string>) => {
      try {
        const data: WsMessage = JSON.parse(e.data);
        if (data.players) {
          setPlayers((prev) => handleMessage(prev, data.players!));
        }
      } catch {
        // Silently ignore malformed frames
      }
    };

    return () => {
      wsRef.current?.close();
    };
  }, [wsUrl, handleMessage]);

  // Clear pulse highlight after animation completes
  useEffect(() => {
    if (!pulse) return;
    const timer = setTimeout(() => setPulse(null), 1200);
    return () => clearTimeout(timer);
  }, [pulse]);

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
                isPulsing={pulse === player.name}
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