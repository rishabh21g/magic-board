package ws

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/rishabh21g/magic-board/internal/domain"
	"github.com/rishabh21g/magic-board/internal/game"
	"github.com/rishabh21g/magic-board/internal/middleware"
	"github.com/rishabh21g/magic-board/internal/store"
)

// upgrader is used to upgrade HTTP connections to WebSocket connections
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type wsMessage struct {
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload"`
}

// Handler manages WebSocket connections and interactions with the game service
type Handler struct {
	hub         *Hub
	gameService *game.Service
	rateLimiter *middleware.RateLimiter
	store       store.Store
}

// constructor function NewHandler initializes a new Handler instance with the provided Hub and game Service
func NewHandler(h *Hub, g *game.Service, rl *middleware.RateLimiter, s store.Store) *Handler {
	return &Handler{
		hub:         h,
		gameService: g,
		rateLimiter: rl,
		store:       s, // type assertion to access Redis client
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
	go h.getInitialGridState(client)
	go client.WritePump()
	go client.ReadPump(h)
}

// claim block handler
func (h *Handler) handleClaimBlock(payload json.RawMessage) {
	fmt.Printf("Received claim block request: %s\n", string(payload))
	var msg wsMessage
	if err := json.Unmarshal(payload, &msg); err != nil {
		log.Printf("Failed to unmarshal claim block event: %v", err)
		return
	}

	if msg.Type != "CLAIM_BLOCK" {
		return
	}

	var data game.ClaimBlockEvent
	if err := json.Unmarshal(msg.Payload, &data); err != nil {
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

	h.broadcastBlockUpdate(block)
}

// broadcastBlockUpdate broadcasts a block update to all connected clients
func (h *Handler) broadcastBlockUpdate(block *domain.Block) {
	response := map[string]interface{}{
		"type":    "BLOCK_UPDATED",
		"payload": block,
	}
	msg, err := json.Marshal(response)
	if err != nil {
		log.Printf("Failed to marshal block update response: %v", err)
		return
	}
	h.hub.broadcast <- msg
}

// sendRateLimitExceeded sends a message to the client indicating that they have exceeded the rate limit
func (h *Handler) sendRateLimitExceeded(userID string) {
	response := map[string]interface{}{
		"type": "RATE_LIMIT_EXCEEDED",
		"payload": map[string]string{
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

// sendGridState sends the current state of the grid to all connected clients
func (h *Handler) getInitialGridState(c *Client) {
	var ctx = context.Background()
	grid, err := h.store.GetAllBlocks(ctx)
	if err != nil {
		log.Printf("Failed to get grid state: %v", err)
		return
	}
	response := map[string]interface{}{
		"type":    "INIT_STATE",
		"payload": grid,
	}
	msg, err := json.Marshal(response)
	if err != nil {
		log.Printf("Failed to marshal initial grid state response: %v", err)
		return
	}
	c.send <- msg
}
