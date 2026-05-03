package store

import (
	"context"

	"github.com/rishabh21g/magic-board/internal/domain"
)

type Store interface {
	SetIfEmpty(ctx context.Context, blockID, userID string) (bool, error)
	SetEmpty(ctx context.Context, blockID string) error
	GetOwner(ctx context.Context, blockID string) (string, error)
	GetAllBlocks(ctx context.Context) ([]*domain.Block, error)
}
