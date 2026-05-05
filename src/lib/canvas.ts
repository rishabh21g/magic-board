import { CELL_GAP, CELL_SIZE, COLS, ROWS, STRIDE } from "@/constants/grid";
import type { UsersById } from "@/hooks/useBoardSocket";


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
  userColor : string,
  myUserID: string,
  hoveredCell: { row: number; col: number } | null,
  dpr: number
) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  // then use W/H in CSS units
  const W = COLS * STRIDE - CELL_GAP
  const H = ROWS * STRIDE - CELL_GAP
  ctx.clearRect(0, 0, W, H)

  const theme = getTheme(ctx.canvas)
  ctx.fillStyle = theme.background
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = theme.card
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

      if (block) {
        const color = getUserColor(block.userID, usersById)
        const isMe = block.userID === myUserID

        // Fill
        ctx.save()
        ctx.beginPath()
        roundRect(ctx, x, y, pw, ph, 3)

        if (isMe) {
          withAlpha(ctx, 0.18, () => {
            ctx.fillStyle = userColor || theme.primary
            ctx.fill()
          })

          withAlpha(ctx, 0.6, () => {
            ctx.strokeStyle = usersById[myUserID].color || theme.primary
            ctx.lineWidth = 1.5
            ctx.stroke()
          })
        } else {
          ctx.fillStyle = hexToRgba(color, 0.18)
          ctx.fill()

          ctx.strokeStyle = hexToRgba(color, 0.55)
          ctx.lineWidth = 1
          ctx.stroke()
        }

        ctx.restore()
      } else {
        // Empty cell
        ctx.save()
        ctx.beginPath()
        roundRect(ctx, x, y, pw, ph, 3)
        ctx.fillStyle = isHovered ? theme.muted : theme.card
        ctx.fill()
        ctx.strokeStyle = isHovered ? theme.ring : theme.border
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.restore()
      }

      // Hover glow overlay
      if (isHovered && !block) {
        ctx.save()
        ctx.shadowBlur = 12
        ctx.shadowColor = theme.primary
        ctx.beginPath()
        roundRect(ctx, x, y, pw, ph, 3)
        ctx.strokeStyle = theme.primary
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

function withAlpha(ctx: CanvasRenderingContext2D, alpha: number, fn: () => void) {
  ctx.save()
  ctx.globalAlpha = alpha
  fn()
  ctx.restore()
}

function cssVar(el: Element, name: string) {
  return getComputedStyle(el).getPropertyValue(name).trim()
}

function getTheme(el: Element) {
  return {
    background: cssVar(el, "--background"),
    card: cssVar(el, "--card"),
    border: cssVar(el, "--border"),
    muted: cssVar(el, "--muted"),
    ring: cssVar(el, "--ring"),
    primary: cssVar(el, "--primary"),
  }
}