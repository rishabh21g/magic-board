import { useBoardSocket } from "../hooks/useBoardSocket"
import MagicGrid from "./Grid/MagicGrid"
import { LeaderboardPanel } from "./Leaderboard/LeaderboardPanel"


export function MagicBoard() {
  const { leaderboard } = useBoardSocket()

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 grid gap-4 md:grid-cols-[1fr_320px]">
        <MagicGrid />
        <LeaderboardPanel entries={leaderboard} />
      </div>
    </div>
  )
}