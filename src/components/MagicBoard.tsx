import { useCallback, useEffect, useMemo, useRef } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import type { Block, UsersById } from "../hooks/useBoardSocket"
import { drawGrid } from "../lib/canvas"
import { CELL_GAP, CELL_SIZE, COLS, ROWS, STRIDE } from "../constants/grid"
import { useUser } from "../../Context/UserContext"

type Props = {
  status: "connecting" | "connected" | "disconnected"
  blocksById: Record<string, Block>
  usersById: UsersById
  claimCell: (blockID: string, userID: string) => void
}

function getCellFromPoint(x: number, y: number) {
  const col = Math.floor(x / STRIDE)
  const row = Math.floor(y / STRIDE)
  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return null

  const localX = x - col * STRIDE
  const localY = y - row * STRIDE
  if (localX > CELL_SIZE || localY > CELL_SIZE) return null

  return { row, col }
}

export default function MagicBoard({ status, blocksById, usersById, claimCell }: Props) {
  const { userID } = useUser()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const hoveredCellRef = useRef<{ row: number; col: number } | null>(null)
  const lastHoverKeyRef = useRef<string | null>(null)

  const canvasW = useMemo(() => COLS * STRIDE - CELL_GAP, [])
  const canvasH = useMemo(() => ROWS * STRIDE - CELL_GAP, [])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.floor(canvasW * dpr)
    canvas.height = Math.floor(canvasH * dpr)
    canvas.style.width = `${canvasW}px`
    canvas.style.height = `${canvasH}px`
    drawGrid(ctx, blocksById, usersById, userID, hoveredCellRef.current, dpr)
  }, [blocksById, usersById, canvasW, canvasH, userID])

  useEffect(() => {
    draw()
  }, [draw])

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const cell = getCellFromPoint(x, y)
    hoveredCellRef.current = cell
    draw()

    if (!cell) {
      if (lastHoverKeyRef.current) toast.dismiss("hover-cell")
      lastHoverKeyRef.current = null
      return
    }

    const key = `${cell.row},${cell.col}`
    if (key === lastHoverKeyRef.current) return
    lastHoverKeyRef.current = key

    const block = blocksById[key]
    const owner = block ? usersById[block.userID] : null
    const username = owner?.username?.trim()

    toast.info(
      block
        ? `(${key}) owned by ${username || block.userID.slice(0, 8)}`
        : `(${key}) unclaimed`,
      { id: "hover-cell", duration: 900 }
    )
  }

  const handleMouseLeave = () => {
    hoveredCellRef.current = null
    lastHoverKeyRef.current = null
    toast.dismiss("hover-cell")
    draw()
  }

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const cell = getCellFromPoint(x, y)
    if (!cell) return

    const blockID = `${cell.row},${cell.col}`
    const block = blocksById[blockID]
    if (block && block.userID !== userID) return

    claimCell(blockID, userID)
  }

  return (
    <Card className="w-full">
      <CardHeader className="border-b">
        <CardTitle>Magic Board</CardTitle>
        <CardDescription>
          500 cells ({ROWS}×{COLS}) · Status: {status}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4">
        <div className="overflow-auto rounded-md ring-1 ring-foreground/10">
          <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            style={{ display: "block" }}
          />
        </div>
      </CardContent>
    </Card>
  )
}