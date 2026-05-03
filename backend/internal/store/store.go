package store

import "context"

type Store interface {
	SetIfEmpty(ctx context.Context, blockID, userID string) (bool, error)
	SetEmpty(ctx context.Context, blockID string) error
	GetOwner(ctx context.Context, blockID string) (string, error)
}
