// src/components/MagicData.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { COLS, ROWS } from "../constants/grid"
import { useUser } from "../../Context/UserContext"
import type { Block } from "../hooks/useBoardSocket"

type Props = {
  blocksById: Record<string, Block>
}

export default function MagicData({ blocksById }: Props) {
  const { userID } = useUser()

  const total = COLS * ROWS
  const claimed = Object.keys(blocksById).length
  const left = Math.max(0, total - claimed)

  let mine = 0
  for (const b of Object.values(blocksById)) {
    if (b.userID === userID) mine++
  }

  return (
    <Card className="w-80 shrink-0" size="sm">
      <CardHeader className="border-b">
        <CardTitle>Magic Data</CardTitle>
        <CardDescription>Board stats (live)</CardDescription>
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground">All</div>
          <div className="tabular-nums font-medium">{total}</div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-muted-foreground">Claimed</div>
          <div className="tabular-nums font-medium">{claimed}</div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-muted-foreground">Left</div>
          <div className="tabular-nums font-medium">{left}</div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-muted-foreground">My claimed</div>
          <div className="tabular-nums font-medium">{mine}</div>
        </div>
      </CardContent>
    </Card>
  )
}