package ws

import (
	"context"
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/rishabh21g/magic-board/internal/game"
	"github.com/rishabh21g/magic-board/internal/middleware"
)

// upgrader is used to upgrade HTTP connections to WebSocket connections
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// Handler manages WebSocket connections and interactions with the game service
type Handler struct {
	hub         *Hub
	gameService *game.Service
	rateLimiter *middleware.RateLimiter
}

// constructor function NewHandler initializes a new Handler instance with the provided Hub and game Service
func NewHandler(h *Hub, g *game.Service, rl *middleware.RateLimiter) *Handler {
	return &Handler{
		hub:         h,
		gameService: g,
		rateLimiter: rl,
	}
}

// ServeWs handles incoming WebSocket requests, upgrades them to WebSocket connections, and registers the clients with the hub
func (h *Handler) ServeWs(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Failed to upgrade connection: %v", err)
		return
	}
	client := NewClient(conn)
	h.hub.register <- client

	// start goroutines to read from and write to the client
	go client.WritePump()
	go client.ReadPump(h)
}

// claim block handler
func (h *Handler) handleClaimBlock(payload json.RawMessage) {
	var data game.ClaimBlockEvent
	err := json.Unmarshal(payload, &data)
	if err != nil {
		log.Printf("Failed to unmarshal claim block event: %v", err)
		return
	}
	var ctx = context.Background()
	// check if the user has exceeded the rate limit before processing the claim block request
	if !h.rateLimiter.Allow(ctx, data.UserID) {
		h.sendRateLimitExceeded(data.UserID)
		return
	}
	block, err := h.gameService.ClaimBlock(ctx, data.BlockID, data.UserID)
	if err != nil {
		log.Printf("Failed to claim block: %v", err)
		return
	}
	response := map[string]interface{}{
		"type": "block_claimed",
		"data": block,
	}
	msg, err := json.Marshal(response)
	if err != nil {
		log.Printf("Failed to marshal response: %v", err)
		return
	}

	h.hub.broadcast <- msg
}

// sendRateLimitExceeded sends a message to the client indicating that they have exceeded the rate limit
func (h *Handler) sendRateLimitExceeded(userID string) {
	response := map[string]interface{}{
		"type": "rate_limit_exceeded",
		"data": map[string]string{
			"user_id": userID,
			"message": "You have exceeded the rate limit. Please try again later.",
		},
	}
	msg, err := json.Marshal(response)
	if err != nil {
		log.Printf("Failed to marshal rate limit response: %v", err)
		return
	}
	h.hub.broadcast <- msg
}
