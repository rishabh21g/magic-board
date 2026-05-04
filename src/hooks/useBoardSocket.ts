import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

type WsEnvelope =
  | { type: "INIT_STATE"; payload: Block[] }
  | { type: "BLOCK_UPDATED"; payload: Block }
  | { type: "RATE_LIMIT_EXCEEDED"; payload: { user_id: string; message: string } }
  | { type: string; payload: unknown }

export type Block = { id: string; owner_id: string; timestamp: number }

export type LeaderboardEntry = { owner_id: string; count: number }

export function useBoardSocket() {
  const wsRef = useRef<WebSocket | null>(null)

  const [blocksById, setBlocksById] = useState<Record<string, Block>>({})
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("connecting")

  useEffect(() => {
    setStatus("connecting")
    const ws = new WebSocket("ws://localhost:8080/ws")
    wsRef.current = ws

    ws.onopen = () => setStatus("connected")
    ws.onclose = () => setStatus("disconnected")
    ws.onerror = () => setStatus("disconnected")

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data) as WsEnvelope
      console.log(msg)

      switch (msg.type) {
        case "INIT_STATE": {
          const next: Record<string, Block> = {}
          for (const b of msg.payload) next[b.id] = b
          setBlocksById(next)
          break
        }
        case "BLOCK_UPDATED": {
          const b = msg.payload
          setBlocksById((prev) => ({ ...prev, [b.id]: b }))
          break
        }
        case "RATE_LIMIT_EXCEEDED": {
          toast.error(msg.payload.message)
          break
        }
        default:
          // ignore
          break
      }
    }

    return () => {
      wsRef.current = null
      ws.close()
    }
  }, [])

  const leaderboard: LeaderboardEntry[] = useMemo(() => {
    const counts = new Map<string, number>()
    for (const b of Object.values(blocksById)) {
      counts.set(b.owner_id, (counts.get(b.owner_id) ?? 0) + 1)
    }
    return Array.from(counts, ([owner_id, count]) => ({ owner_id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }, [blocksById])

  function claimCell(cellId: string, userID: string) {
    const ws = wsRef.current
    if (!ws || ws.readyState !== WebSocket.OPEN) return
    ws.send(JSON.stringify({ type: "CLAIM_BLOCK", payload: { blockID: cellId, userID } }))
  }

  return { status, blocksById, leaderboard, claimCell }
}