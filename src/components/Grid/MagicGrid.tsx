import { useEffect, useMemo, useRef } from "react"
import { useUser } from "../../../Context/UserContext"
import { useBoardSocket } from "../../hooks/useBoardSocket"
import { drawCell, drawGridLines } from "../../lib/draw"
import { CELL_SIZE, GRID_SIZE } from "../../constants/GRID"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"

const OWNER_COLORS = ["#f97316", "#facc15", "#4ade80", "#22d3ee", "#818cf8", "#e879f9", "#fb7185"]

function colorForOwner(ownerId: string) {
  let h = 0
  for (let i = 0; i < ownerId.length; i++) h = (h * 31 + ownerId.charCodeAt(i)) >>> 0
  return OWNER_COLORS[h % OWNER_COLORS.length]
}

export default function MagicGrid() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { userID } = useUser()
  const { blocksById, claimCell } = useBoardSocket()

  const blocks = useMemo(() => Object.values(blocksById), [blocksById])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = GRID_SIZE * CELL_SIZE
    canvas.height = GRID_SIZE * CELL_SIZE

    ctx.fillStyle = "#ef4444"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    drawGridLines(ctx, GRID_SIZE, CELL_SIZE)

    for (const b of blocks) {
      const [x, y] = b.id.split(",").map(Number)
      drawCell(ctx, x, y, colorForOwner(b.owner_id))
    }
  }, [blocks])

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Magic Board</CardTitle>
          <CardDescription>Click a cell to claim it (real-time updates).</CardDescription>
        </CardHeader>

        <CardContent className="flex justify-center">
          <div className="rounded-lg border bg-card p-3">
            <canvas
              ref={canvasRef}
              className="block rounded-md"
              onClick={(e) => {
                const rect = canvasRef.current?.getBoundingClientRect()
                if (!rect) return
                const x = Math.floor((e.clientX - rect.left) / CELL_SIZE)
                const y = Math.floor((e.clientY - rect.top) / CELL_SIZE)
                claimCell(`${x},${y}`, userID)
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}