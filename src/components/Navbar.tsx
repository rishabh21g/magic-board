import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Swords } from "lucide-react";

interface NavLink {
  label: string;
  href: string;
}

const NAV_LINKS: NavLink[] = [
  { label: "Arena", href: "#arena" },
  { label: "Leaderboard", href: "#leaderboard" },
  { label: "FAQ", href: "#faq" },
];

const CINZEL: React.CSSProperties = { fontFamily: "'Cinzel', serif" };

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = (): void => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0d0a00]/90 backdrop-blur-md border-b border-[#c8a84b]/20 shadow-[0_4px_32px_rgba(200,168,75,0.08)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Swords className="w-6 h-6 text-[#c8a84b]" />
              <div className="absolute -inset-1 rounded-full bg-[#c8a84b]/20 blur-sm" />
            </div>
            <span
              className="text-[#c8a84b] font-bold text-xl tracking-wider uppercase"
              style={{ ...CINZEL, textShadow: "0 0 20px rgba(200,168,75,0.5)" }}
            >
              MagicBoard
            </span>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-[#c8a84b]/70 hover:text-[#c8a84b] transition-colors text-sm tracking-widest uppercase"
                style={CINZEL}
              >
                {label}
              </a>
            ))}
          </nav>

          {/* GitHub CTA */}
          <motion.a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#c8a84b]/50 bg-[#c8a84b]/10 hover:bg-[#c8a84b]/20 transition-all duration-200 text-[#c8a84b] text-sm font-semibold tracking-wide group"
            style={CINZEL}
          >
            <Star className="w-4 h-4 group-hover:fill-[#c8a84b] transition-all" />
            <span>Star us on GitHub</span>
          </motion.a>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;