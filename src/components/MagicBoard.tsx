import React from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import GridSection from "./GridSection";
import Leaderboard from "./LeaderBoard";
import Footer from "./Footer";
import FAQ from "./FAQ";



const MagicBoard: React.FC = () => {
  return (
    <div className="magic-board-root min-h-screen bg-[#0d0a00] text-[#f5e6c8] overflow-x-hidden">
      {/* Parchment noise texture overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <GridSection />
        <Leaderboard />
        <FAQ />
        <Footer />
      </div>
    </div>
  );
};

export default MagicBoard;