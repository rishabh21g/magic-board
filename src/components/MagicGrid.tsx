import { useEffect, useRef, useCallback } from "react"
import { useBoardSocket } from "../hooks/useBoardSocket"
import { drawGrid } from "../lib/canvas"
import { CELL_GAP, CELL_SIZE, COLORS, COLS, ROWS, STRIDE } from "../constants/GRID"
import { useUser } from "../../Context/UserContext"


function MagicGrid() {
  const {  blocksById, claimCell ,ws } = useBoardSocket()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const userColorMap = useRef<Map<string, string>>(new Map())
  const hoveredCell = useRef<{ row: number; col: number } | null>(null)
  const flashCells = useRef<Set<string>>(new Set())
  const {userID} = useUser()

  // Canvas size
  const canvasW = COLS * STRIDE - CELL_GAP
  const canvasH = ROWS * STRIDE - CELL_GAP

  // Draw loop
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    drawGrid(ctx, blocksById, userID, userColorMap.current, hoveredCell.current, flashCells.current, dpr)
  }, [blocksById, userID])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = canvasW * dpr
    canvas.height = canvasH * dpr
    canvas.style.width = canvasW + "px"
    canvas.style.height = canvasH + "px"
    const ctx = canvas.getContext("2d")
    ctx?.scale(dpr, dpr)
    draw()
  }, [canvasW, canvasH])

  useEffect(() => {
    draw()
  }, [blocksById, draw])

  // Mouse handlers on canvas
  const getCellFromEvent = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const col = Math.floor(x / STRIDE)
    const row = Math.floor(y / STRIDE)
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return null
    // Check if click is within cell bounds (not gap)
    const localX = x - col * STRIDE
    const localY = y - row * STRIDE
    if (localX > CELL_SIZE || localY > CELL_SIZE) return null
    return { row, col }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const cell = getCellFromEvent(e)
    hoveredCell.current = cell
    draw()
  }

  const handleMouseLeave = () => {
    hoveredCell.current = null
    draw()
  }

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const cell = getCellFromEvent(e)
    if (!cell) return
    const blockID = `${cell.row},${cell.col}`
    const block = blocksById[blockID]
    if (block && block.userID === userID) return // Already mine
    claimCell(blockID, userID)
    ws.send(JSON.stringify({ type: "CLAIM_BLOCK", payload: { blockID, userID } }))
    // Flash animation
    flashCells.current.add(blockID)
    draw()
    setTimeout(() => {
      flashCells.current.delete(blockID)
      draw()
    }, 380)
  }

  return (
          <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            style={{
              display: "block",
              borderRadius: 6,
              border: `1px solid ${COLORS.goldDim}`,
              position: "relative",
              zIndex: 1,
            }}
          />
  )
}
    

export default MagicGrid