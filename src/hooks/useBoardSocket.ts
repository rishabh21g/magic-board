import { useCallback, useEffect, useRef, useState } from "react"
import { WS_URL } from "../lib/ws"
import { useUser } from "../../Context/UserContext";
import { toast } from "sonner";

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

type UserProfilePayload = { userID: string; username: string; color: string }

type ServerMessage =
  | { type: "INIT_STATE"; payload: InitStatePayload }
  | { type: "BLOCK_UPDATED"; payload: Block }
  | { type: "LEADERBOARD_UPDATE"; payload: LeaderboardEntry[] }
  | { type: "USER_PROFILE_UPDATED"; payload: UserProfilePayload }
  | { type: "RATE_LIMIT_EXCEEDED"; payload: { user_id: string; message: string } }

function toBlocksById(grid: Block[]) {
  const map: Record<string, Block> = {}
  for (const b of grid) map[b.blockID] = b
  return map
}

export function useBoardSocket(wsUrl: string = WS_URL) {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimerRef = useRef<number | null>(null)
  const reconnectAttemptRef = useRef(0)
  const shouldReconnectRef = useRef(true)
  const { userName, userColor } = useUser() 

  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("connecting")
  const [blocksById, setBlocksById] = useState<Record<string, Block>>({})
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [usersById, setUsersById] = useState<UsersById>({})
  const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null)

  const scheduleReconnect = useCallback(() => {
    if (!shouldReconnectRef.current) return
    if (reconnectTimerRef.current) window.clearTimeout(reconnectTimerRef.current)

    const attempt = reconnectAttemptRef.current++
    const delay = Math.min(10_000, 500 * 2 ** attempt) // 0.5s → 1s → 2s → ... → 10s
    reconnectTimerRef.current = window.setTimeout(() => connect(), delay)
  }, [])

  const connect = useCallback(() => {
    setStatus("connecting")
    const socket = new WebSocket(wsUrl)
    wsRef.current = socket

    socket.onopen = () => {
      reconnectAttemptRef.current = 0
      setStatus("connected")
    }

    socket.onmessage = (e) => {
      let msg: ServerMessage
      try {
        msg = JSON.parse(e.data)
      } catch {
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
          setBlocksById((prev) => {
            if (msg.payload.userID === "") {
              const next = { ...prev }
              delete next[msg.payload.blockID]
              return next
            }
            return { ...prev, [msg.payload.blockID]: msg.payload }
          })
          return
        case "LEADERBOARD_UPDATE":
          setLeaderboard(msg.payload)
          return
        case "RATE_LIMIT_EXCEEDED":
          setRateLimitMessage(msg.payload.message)
          toast.error(msg.payload.message)
          return
        case "USER_PROFILE_UPDATED":
          setUsersById((prev) => ({
            ...prev,
            [msg.payload.userID]: {
              username: msg.payload.username,
              color: msg.payload.color,
            },
          }))
          return
      }
    }

    socket.onerror = () => {
      try { socket.close() } catch (e){
  console.log(e)
      }
    }

    socket.onclose = () => {
      setStatus("disconnected")
      scheduleReconnect()
    }
  }, [wsUrl, scheduleReconnect])

  useEffect(() => {
    shouldReconnectRef.current = true
    connect()

    return () => {
      shouldReconnectRef.current = false
      if (reconnectTimerRef.current) window.clearTimeout(reconnectTimerRef.current)
      wsRef.current?.close()
    }
  }, [connect])

  const claimCell = useCallback((blockID: string, userID: string , username: string , color : string) => {
    const socket = wsRef.current
    if (!socket || socket.readyState !== WebSocket.OPEN) return
    socket.send(JSON.stringify({
      type: "CLAIM_BLOCK",
      payload: { blockID, userID, username, color },
    }))
  }, [userName, userColor])

  const updateUserProfile = useCallback((userID: string, username: string, color: string) => {
    const socket = wsRef.current
    if (!socket || socket.readyState !== WebSocket.OPEN) return
    socket.send(JSON.stringify({ type: "USER_PROFILE_UPDATED", payload: { userID, username, color } }))
  }, [])

  return {
    status,
    blocksById,
    leaderboard,
    usersById,
    rateLimitMessage,
    claimCell,
    updateUserProfile,
    ws: wsRef.current,
  }
}