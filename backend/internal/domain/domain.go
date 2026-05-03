package domain

type Block struct {
	BlockID   string `json:"id"`
	OwnerID   string `json:"owner_id"`
	Timestamp int64  `json:"timestamp"`
}
