package ws

import (
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/rishabh21g/magic-board/internal/game"
)

type Handler struct {
	hub         *Hub
	gameService *game.Service
}

func NewHandler(h *Hub, g *game.Service) *Handler {
	return &Handler{
		hub:         h,
		gameService: g,
	}
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}
