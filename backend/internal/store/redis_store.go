package store

import (
	"context"
	"errors"

	"github.com/redis/go-redis/v9"
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
