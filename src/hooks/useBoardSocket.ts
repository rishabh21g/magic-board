import { useCallback, useEffect, useRef, useState } from "react"
import { ws } from "../lib/ws"

export type Block = { blockID: string; userID: string; timestamp: number }
export type LeaderboardEntry = { userID: string; count: number }

export type UserInfo = {
  username: string
  color: string
}

export type UsersById = Record<string, UserInfo>

type InitStatePayload = {
  grid: Block[]
  leaderboard: LeaderboardEntry[]
  users: UsersById
}

type ServerMessage =
  | { type: "INIT_STATE"; payload: InitStatePayload }
  | { type: "BLOCK_UPDATED"; payload: Block }
  | { type: "LEADERBOARD_UPDATE"; payload: LeaderboardEntry[] }
  | { type: "RATE_LIMIT_EXCEEDED"; payload: { user_id: string; message: string } }

function toBlocksById(grid: Block[]) {
  const map: Record<string, Block> = {}
  for (const b of grid) map[b.blockID] = b
  return map
}

export function useBoardSocket() {
  const wsRef = useRef<WebSocket | null>(null)

  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("connecting")

  const [blocksById, setBlocksById] = useState<Record<string, Block>>({})
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [usersById, setUsersById] = useState<UsersById>({})
  const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null)

  const claimCell = useCallback((blockID: string, userID: string) => {
    const ws = wsRef.current
    if (!ws || ws.readyState !== WebSocket.OPEN) return
    ws.send(JSON.stringify({ type: "CLAIM_BLOCK", payload: { blockID, userID } }))
  }, [])

  useEffect(() => {
    setStatus("connecting")
    wsRef.current = ws

    ws.onopen = () => setStatus("connected")
    ws.onclose = () => setStatus("disconnected")
    ws.onerror = () => setStatus("disconnected")

    ws.onmessage = (e) => {
      let msg: ServerMessage
      try {
        msg = JSON.parse(e.data)
        console.log(msg)
      } catch (e) {
        console.error("Failed to parse WebSocket message:", e)
        return
      }
      console.log(msg)
      switch (msg.type) {
        case "INIT_STATE":
          setBlocksById(toBlocksById(msg.payload.grid))
          setLeaderboard(msg.payload.leaderboard)
          setUsersById(msg.payload.users)
          return

        case "BLOCK_UPDATED":
          setBlocksById((prev) => ({ ...prev, [msg.payload.blockID]: msg.payload }))
          return

        case "LEADERBOARD_UPDATE":
          setLeaderboard(msg.payload)
          return

        case "RATE_LIMIT_EXCEEDED":
          setRateLimitMessage(msg.payload.message)
          return
      }
    }

    return () => ws.close()
  }, [])

  return { status, blocksById, leaderboard, usersById, rateLimitMessage, claimCell, ws }
}