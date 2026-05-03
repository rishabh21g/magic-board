package store

import "context"

type Store interface {
	SetIfEmpty(ctx context.Context, blockID, userID string) (bool, error)
}
