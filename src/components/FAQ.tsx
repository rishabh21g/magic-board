import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FaqItem {
  q: string;
  a: string;
}

interface AccordionItemProps extends FaqItem {
  index: number;
  isOpen: boolean;
  onToggle: (index: number) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CINZEL: React.CSSProperties = { fontFamily: "'Cinzel', serif" };

const FAQ_ITEMS: FaqItem[] = [
  {
    q: "How does real-time capturing work?",
    a: "The app uses WebSockets to maintain a persistent connection between your browser and the server. When you click a cell, the server records your claim and immediately broadcasts the update to every connected player — typically within milliseconds.",
  },
  {
    q: "Can two players capture the same cell simultaneously?",
    a: "The backend handles concurrency with atomic write operations. The first claim wins; if two players click at nearly the same time, only one will succeed and the loser will see the cell already taken in the next broadcast frame.",
  },
  {
    q: "Is there a limit to how many cells I can own?",
    a: "No hard cap — conquer as aggressively as you want. The leaderboard ranks players by total cells owned, so the more territory you hold, the higher you climb.",
  },
  {
    q: "Will there be cooldowns or area rules?",
    a: "We're experimenting with optional rule modes such as cooldown timers, lock-out periods, and area-control bonuses. Stay tuned — drop a ⭐ on GitHub to follow updates.",
  },
  {
    q: "Can I see who owns which cell?",
    a: "Yes. Hovering or tapping a cell shows the owner's name and a colour-coded flag. Each player gets a unique colour assigned on their first capture.",
  },
  {
    q: "How is the leaderboard updated?",
    a: "The leaderboard listens on the same WebSocket channel as the grid. Every time a cell changes hands the server emits a leaderboard diff and the UI animates the new standings in real time.",
  },
];

// ─── AccordionItem ────────────────────────────────────────────────────────────

const AccordionItem: React.FC<AccordionItemProps> = ({
  q,
  a,
  index,
  isOpen,
  onToggle,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.07 }}
    className="rounded-xl border border-[#c8a84b]/20 bg-[#0d0a00]/80 overflow-hidden"
  >
    <button
      onClick={() => onToggle(index)}
      className="w-full flex items-center justify-between px-6 py-4 text-left gap-4 group"
      aria-expanded={isOpen}
    >
      <span
        className="text-[#f5e6c8] text-sm font-semibold group-hover:text-[#c8a84b] transition-colors"
        style={CINZEL}
      >
        {q}
      </span>
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.25 }}
        className="shrink-0"
      >
        <ChevronDown className="w-4 h-4 text-[#c8a84b]/60" />
      </motion.div>
    </button>

    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key="answer"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <div className="px-6 pb-5 text-[#f5e6c8]/55 text-sm leading-relaxed border-t border-[#c8a84b]/10 pt-4">
            {a}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number): void => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section id="faq" className="relative py-24 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <p
            className="text-[#c8a84b]/60 text-xs tracking-[0.3em] uppercase mb-3"
            style={CINZEL}
          >
            📜 Sacred Scrolls 📜
          </p>
          <h2
            className="text-4xl font-black text-[#f5e6c8]"
            style={{
              fontFamily: "'Cinzel Decorative', 'Cinzel', serif",
              textShadow: "0 0 40px rgba(200,168,75,0.3)",
            }}
          >
            FAQ
          </h2>
        </motion.div>

        {/* Accordion */}
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <AccordionItem
              key={i}
              {...item}
              index={i}
              isOpen={openIndex === i}
              onToggle={handleToggle}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;