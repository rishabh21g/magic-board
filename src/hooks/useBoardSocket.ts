import { useEffect, useRef, useState } from "react"



export function useBoardSocket() {
  const wsRef = useRef<WebSocket | null>(null)

  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("connecting")

  // WS  Initialization and event handling
  async function InitializeWebSocket() {
    const ws = new WebSocket("ws://localhost:8080/ws")
    wsRef.current = ws
    try {
      ws.onopen = () => setStatus("connected")
      setStatus("connecting")
      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data)
        console.log(msg)

        switch (msg.type) {
          case "INIT_STATE":
            console.log(msg)
            break

          case "BLOCK_UPDATED": {
            console.log(msg)
            break
          }

          case "RATE_LIMIT_EXCEEDED": {
            console.log(msg)
            break
          }
          case "LEADERBOARD_UPDATED": {
            console.log(msg)
            break
          }
          default:
            break
        }
      }

    } catch (e) {
      ws.onerror = () => setStatus("disconnected")
      console.error("Failed to initialize WebSocket:", e)
    } finally {
      setStatus("disconnected")
      ws.onclose = () => setStatus("disconnected")
    }

  }

  // Initialize WebSocket on component mount and clean up on unmount
  useEffect(() => {
    InitializeWebSocket()
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])



  return null
}