import LeaderBoard from "./components/LeaderBoard"
import MagicBoard from "./components/MagicBoard"
import { Button } from "./components/ui/button"
import { Separator } from "./components/ui/separator"
import { UserPreferenceDialog } from "./components/UserPrerference"
import { useBoardSocket } from "./hooks/useBoardSocket"

export default function App() {
  const board = useBoardSocket()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <a
                href="https://github.com/<owner>/<repo>"
                target="_blank"
                rel="noreferrer"
              >
                GitHub Repo
              </a>
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <UserPreferenceDialog onProfileUpdated={board.updateUserProfile} />
          </div>
        </div>        
      </header>

      <main className="mx-auto max-w-full px-4 py-6 flex gap-2">
        <LeaderBoard status={board.status} leaderboard={board.leaderboard} usersById={board.usersById} />
        <MagicBoard status={board.status} blocksById={board.blocksById} usersById={board.usersById} claimCell={board.claimCell} />
      </main>
    </div>
  )
}