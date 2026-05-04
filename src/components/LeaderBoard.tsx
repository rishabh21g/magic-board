import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import type { LeaderboardEntry, UsersById } from "../hooks/useBoardSocket"
import { getUserColor } from "../lib/canvas"
import { useUser } from "../../Context/UserContext"

type Props = {
  status: "connecting" | "connected" | "disconnected"
  leaderboard: LeaderboardEntry[]
  usersById: UsersById
}

export default function LeaderBoard({ status, leaderboard, usersById }: Props) {
  const { userID } = useUser()

  const rows = useMemo(() => {
    return [...leaderboard].sort((a, b) => b.count - a.count)
  }, [leaderboard])

  return (
    <Card className="w-[320px] shrink-0">
      <CardHeader className="border-b">
        <CardTitle>Leaderboard</CardTitle>
        <CardDescription>
          Status: {status}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-2">
        {rows.length === 0 ? (
          <div className="text-muted-foreground">No data yet</div>
        ) : (
          rows.map((entry, idx) => {
            const username = usersById[entry.userID]?.username?.trim() || "Anonymous"
            const color = getUserColor(entry.userID, usersById)
            const isMe = entry.userID === userID

            return (
              <div
                key={entry.userID}
                className="flex items-center justify-between rounded-md px-2 py-1 ring-1 ring-foreground/10"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 text-muted-foreground">{idx + 1}</div>
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: color }}
                    aria-hidden
                  />
                  <div className="truncate">
                    {username} {isMe ? <span className="text-muted-foreground">(you)</span> : null}
                  </div>
                </div>

                <div className="tabular-nums font-medium">{entry.count}</div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}