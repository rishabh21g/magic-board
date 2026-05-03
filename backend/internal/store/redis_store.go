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

// implement the SetIfEmpty method for RedisStore if block is not owned by the user
// function solved the race condition
func (r *RedisStore) SetIfEmpty(ctx context.Context, blockID, userID string) (bool, error) {
	key := "block:" + blockID
	ok, err := r.client.SetNX(ctx, key, userID, 0).Result()
	if err != nil {
		return false, errors.New(err.Error())
	}
	return ok, nil
}

// implement the GetOwner method for RedisStore to retrieve the owner of a block
func (r *RedisStore) GetOwner(ctx context.Context, blockID string) (string, error) {
	key := "block:" + blockID
	owner, err := r.client.Get(ctx, key).Result()
	if err == redis.Nil {
		return "", nil // block is unclaimed
	} else if err != nil {
		return "", errors.New(err.Error())
	}
	return owner, nil
}

// unclaim a block by deleting the key from Redis
func (r *RedisStore) SetEmpty(ctx context.Context, blockID string) error {
	key := "block:" + blockID
	_, err := r.client.Del(ctx, key).Result()
	if err != nil {
		return errors.New(err.Error())
	}
	return nil
}

// get entire grid
func (r *RedisStore) GetAllBlocks(ctx context.Context) ([]*domain.Block, error) {
	data, err := r.client.HGetAll(ctx, "grid").Result()
	if err != nil {
		return nil, errors.New(err.Error())
	}
	var blocks []*domain.Block
	for blockID, ownerID := range data {
		blocks = append(blocks, &domain.Block{
			BlockID:   blockID,
			OwnerID:   ownerID,
			Timestamp: 0,
		})
	}
	return blocks, nil
}
