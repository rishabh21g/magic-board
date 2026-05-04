import { useUser } from "../../../Context/UserContext"
import type { LeaderboardEntry } from "../../hooks/useBoardSocket"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

export function LeaderboardPanel({ entries }: { entries: LeaderboardEntry[] }) {
  const { userID } = useUser()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {entries.length === 0 ? (
          <div className="text-muted-foreground">No claims yet.</div>
        ) : (
          entries.map((e, idx) => (
            <div
              key={e.owner_id}
              className={[
                "flex items-center justify-between rounded-md border px-3 py-2 text-sm",
                e.owner_id === userID ? "bg-muted" : "",
              ].join(" ")}
            >
              <div className="flex items-center gap-2">
                <span className="w-6 text-muted-foreground">{idx + 1}.</span>
                <span className="font-mono">
                  {e.owner_id === userID ? "you" : e.owner_id.slice(0, 8)}
                </span>
              </div>
              <span className="font-semibold">{e.count}</span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}