import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import type { Block, UsersById } from "../hooks/useBoardSocket"
import { drawGrid } from "../lib/canvas"
import {CELL_SIZE, COLS, ROWS, STRIDE } from "../constants/grid"
import { useUser } from "../../Context/UserContext"

type Props = {
  status: "connecting" | "connected" | "disconnected"
  blocksById: Record<string, Block>
  usersById: UsersById
  claimCell: (blockID: string, userID: string , userName:string , userColor:string) => void
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
  const { userID , userColor , userName } = useUser()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const hoveredCellRef = useRef<{ row: number; col: number } | null>(null)
  const lastHoverKeyRef = useRef<string | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect()
      setSize({ w: r.width, h: r.height })
    })

    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || size.w === 0 || size.h === 0) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.floor(size.w * dpr)
    canvas.height = Math.floor(size.h * dpr)
    canvas.style.width = "100%"
    canvas.style.height = "100%"

    drawGrid(ctx, blocksById, usersById,userColor, userID, hoveredCellRef.current, dpr)
  }, [blocksById, usersById, userID, size.w, size.h])

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
      { id: "hover-cell", duration: 1000 }
    )
  }

  const handleMouseLeave = () => {
    hoveredCellRef.current = null
    lastHoverKeyRef.current = null
    toast.dismiss("hover-cell")
  }

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const cell = getCellFromPoint(x, y)
    if (!cell) return

    const blockID = `${cell.row},${cell.col}`

    claimCell(blockID, userID, userName , userColor)
  }

  return (
    
        <div ref={containerRef} className="w-full h-full">
          {status !== "connected" && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur">
              <div className="text-center">
                <p className="text-lg font-medium">
                  {status === "connecting" ? "Connecting..." : "Disconnected"}
                </p>
              </div>
            </div>
          )}
          <canvas
            ref={canvasRef}
            data-click-sound
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            style={{ display: "block" }}
            className="p-2 mx-auto max-w-full h-full overflow-y-auto cursor-pointer"
          />
        </div>
    
  )
}