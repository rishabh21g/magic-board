package store

import (
	"context"
	"errors"

	"github.com/redis/go-redis/v9"
	"github.com/rishabh21g/magic-board/internal/domain"
)

// create a RedisStore struct that implements the Store interface
type RedisStore struct {
	client *redis.Client
}

// constructor function for creating a new RedisStore instance
func NewRedisStore(client *redis.Client) *RedisStore {
	return &RedisStore{
		client: client,
	}
}

// claim if empty: HSETNX grid <blockID> <userID>
func (r *RedisStore) SetIfEmpty(ctx context.Context, blockID, userID string) (bool, error) {
	ok, err := r.client.HSetNX(ctx, "grid", blockID, userID).Result()
	if err != nil {
		return false, err
	}
	return ok, nil
}

// get owner: HGET grid <blockID>
func (r *RedisStore) GetOwner(ctx context.Context, blockID string) (string, error) {
	owner, err := r.client.HGet(ctx, "grid", blockID).Result()
	if err == redis.Nil {
		return "", nil // unclaimed
	}
	if err != nil {
		return "", err
	}
	return owner, nil
}

// unclaim: HDEL grid <blockID>
func (r *RedisStore) SetEmpty(ctx context.Context, blockID string) error {
	_, err := r.client.HDel(ctx, "grid", blockID).Result()
	return err
}

// get entire grid
func (r *RedisStore) GetAllBlocks(ctx context.Context) ([]*domain.Block, error) {
	data, err := r.client.HGetAll(ctx, "grid").Result()

	if err != nil {
		return nil, errors.New(err.Error())
	}
	blocks := make([]*domain.Block, 0)
	for blockID, ownerID := range data {
		blocks = append(blocks, &domain.Block{
			BlockID:   blockID,
			OwnerID:   ownerID,
			Timestamp: 0,
		})
	}
	return blocks, nil
}
