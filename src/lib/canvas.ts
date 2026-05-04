import { CELL_GAP, CELL_SIZE, COLORS, COLS, ROWS, STRIDE } from "../constants/grid"
import type { UsersById } from "../hooks/useBoardSocket"

const FALLBACK_OWNED = "#22c55e"
function normalizeHexColor(maybe: string | undefined) {
  const c = (maybe ?? "").trim()
  return /^#([0-9a-fA-F]{6})$/.test(c) ? c : ""
}

export function getUserColor(userID: string, usersById: UsersById): string {
  const explicit = normalizeHexColor(usersById[userID]?.color)
  return explicit || FALLBACK_OWNED
}

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  blocksById: Record<string, { blockID: string; userID: string; timestamp: number }>,
  usersById: UsersById,
  myUserID: string,
  hoveredCell: { row: number; col: number } | null,
  dpr: number
) {
  // (recommended) set transform once
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  // then use W/H in CSS units
  const W = COLS * STRIDE - CELL_GAP
  const H = ROWS * STRIDE - CELL_GAP
  ctx.clearRect(0, 0, W, H)

  // Background
  ctx.fillStyle = COLORS.surface
  ctx.fillRect(0, 0, W, H)

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = col * STRIDE
      const y = row * STRIDE
      const pw = CELL_SIZE
      const ph = CELL_SIZE
      const cellKey = `${row},${col}`
      const block = blocksById[cellKey]
      const isHovered = hoveredCell?.row === row && hoveredCell?.col === col
      const isFlash = false

      if (block) {
        const color = getUserColor(block.userID, usersById)
        const isMe = block.userID === myUserID

        // Fill
        ctx.save()
        ctx.beginPath()
        roundRect(ctx, x, y, pw, ph, 3)
        ctx.fillStyle = isMe
          ? isFlash ? COLORS.goldBright : "rgba(200,168,75,0.22)"
          : hexToRgba(color, isFlash ? 0.7 : 0.18)
        ctx.fill()

        // Border
        ctx.strokeStyle = isMe
          ? isFlash ? COLORS.goldBright : "rgba(200,168,75,0.6)"
          : hexToRgba(color, 0.55)
        ctx.lineWidth = isMe ? 1.5 : 1
        ctx.stroke()

        // Inner shimmer for "mine"
        if (isMe) {
          const grad = ctx.createLinearGradient(x, y, x + pw, y + ph)
          grad.addColorStop(0, "rgba(200,168,75,0.18)")
          grad.addColorStop(1, "rgba(200,168,75,0.0)")
          ctx.fillStyle = grad
          ctx.fill()
        }
        ctx.restore()
      } else {
        // Empty cell
        ctx.save()
        ctx.beginPath()
        roundRect(ctx, x, y, pw, ph, 3)
        ctx.fillStyle = isHovered ? "rgba(200,168,75,0.1)" : COLORS.emptyCell
        ctx.fill()
        ctx.strokeStyle = isHovered ? "rgba(200,168,75,0.4)" : COLORS.emptyBorder
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.restore()
      }

      // Hover glow overlay
      if (isHovered && !block) {
        ctx.save()
        ctx.shadowBlur = 12
        ctx.shadowColor = COLORS.gold
        ctx.beginPath()
        roundRect(ctx, x, y, pw, ph, 3)
        ctx.strokeStyle = COLORS.goldDim
        ctx.lineWidth = 1.5
        ctx.stroke()
        ctx.restore()
      }
    }
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}