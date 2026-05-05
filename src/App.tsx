import { useEffect } from "react"
import LeaderBoard from "./components/LeaderBoard"
import MagicBoard from "./components/MagicBoard"
import { Button } from "./components/ui/button"
import { Separator } from "./components/ui/separator"
import { UserPreferenceCard } from "./components/UserPrerference"
import { useBoardSocket } from "./hooks/useBoardSocket"
import { getClickSound } from "./lib/click"

export default function App() {

  const board = useBoardSocket()
 
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return; 
      const target = e.target as Element | null;
      if (!target) return;

      const hit = target.closest(
        [
          '[data-slot="button"]',
          'button',
          '[role="button"]',
          'input[type="button"]',
          'input[type="submit"]',
          '[data-slot="dropdown-menu-trigger"]',
          '[data-slot="dropdown-menu-item"]',
          "canvas",
        ].join(",")
      );
      if (!hit) return;

      if ((hit as HTMLElement).hasAttribute("data-disabled")) return;
      if (hit instanceof HTMLButtonElement && hit.disabled) return;

      const audio = getClickSound();
      audio.currentTime = 0;
      audio.play().catch(() => {});
    };

    window.addEventListener("pointerdown", onPointerDown, true);
    return () => window.removeEventListener("pointerdown", onPointerDown, true);
  }, []);


  return (
    <div className="min-h-screen bg-background text-foreground dark flex flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 justify-center">
            <Button asChild variant="outline">
              <a
                href="https://github.com/rishabh21g/magic-board-server"
                target="_blank"
                rel="noreferrer"
              >
                GitHub Repo
              </a>
            </Button>
            <Separator orientation="vertical" className="h-6" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-full px-4 py-6 flex flex-1 min-h-0 w-full gap-4">
        <div className="flex-1 min-w-0">
          <MagicBoard
            status={board.status}
            blocksById={board.blocksById}
            usersById={board.usersById}
            claimCell={board.claimCell}
          />
        </div>

        <div className="w-80 shrink-0 flex flex-col gap-4">
          <LeaderBoard status={board.status} leaderboard={board.leaderboard} usersById={board.usersById}/>
          <UserPreferenceCard />
        </div>
      </main>
    </div>
  )
}