package game

type ClaimBlockEvent struct {
	BlockID string `json:"id"`
	UserID  string `json:"user_id"`
}

type UnclaimBlockEvent struct {
	BlockID string `json:"id"`
	UserID  string `json:"user_id"`
}
