import React from "react";
import { motion } from "framer-motion";
import { type LucideIcon, Swords, GitBranchMinus, X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SocialLink {
  href: string;
  icon: LucideIcon;
  label: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CINZEL: React.CSSProperties = { fontFamily: "'Cinzel', serif" };

const SOCIAL_LINKS: SocialLink[] = [
  { href: "https://github.com", icon: GitBranchMinus, label: "GitHub" },
  { href: "https://twitter.com", icon: X, label: "Twitter" },
];

// ─── Footer ───────────────────────────────────────────────────────────────────

const Footer: React.FC = () => (
  <footer className="relative border-t border-[#c8a84b]/15 py-14 px-4 text-center">
    {/* Top glow line */}
    <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#c8a84b]/40 to-transparent" />

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="max-w-2xl mx-auto"
    >
      {/* Logo */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <Swords className="w-5 h-5 text-[#c8a84b]" />
        <span
          className="text-[#c8a84b] font-bold text-lg tracking-widest uppercase"
          style={CINZEL}
        >
          MagicBoard
        </span>
      </div>

      <p className="text-[#f5e6c8]/30 text-xs mb-6 leading-relaxed max-w-sm mx-auto">
        A real-time shared grid battle arena. Open source and built for warriors.
      </p>

      {/* Social links */}
      <div className="flex items-center justify-center gap-6 mb-8">
        {SOCIAL_LINKS.map(({ href, icon: Icon, label }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[#c8a84b]/50 hover:text-[#c8a84b] transition-colors text-sm"
            style={CINZEL}
          >
            <Icon className="w-4 h-4" />
            {label}
          </a>
        ))}
      </div>

      {/* Divider rune */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="h-px w-16 bg-[#c8a84b]/20" />
        <div className="w-1.5 h-1.5 rotate-45 bg-[#c8a84b]/30" />
        <div className="h-px w-16 bg-[#c8a84b]/20" />
      </div>

      <p
        className="text-[#f5e6c8]/20 text-xs tracking-wider"
        style={CINZEL}
      >
        © {new Date().getFullYear()} MagicBoard. All territories reserved.
      </p>
    </motion.div>
  </footer>
);

export default Footer;