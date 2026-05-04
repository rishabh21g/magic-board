// HTTP endpoints
export const HTTP_ENDPOINTS = {
  HEALTH: "/health",
};

// WebSocket endpoint (URL path; you still need ws://host:port)
export const WS_ENDPOINTS = {
  WS: "/ws",
};

// Client -> Server socket message types
export const WS_CLIENT_EVENTS = {
  CLAIM_BLOCK: "CLAIM_BLOCK",
};

// Server -> Client socket message types
export const WS_SERVER_EVENTS = {
  INIT_STATE: "INIT_STATE",
  BLOCK_UPDATED: "BLOCK_UPDATED",
  LEADERBOARD_UPDATE: "LEADERBOARD_UPDATE",
  USER_PROFILE_UPDATED: "USER_PROFILE_UPDATED",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
};

// Example payload shapes (for frontend reference)
export const WS_MESSAGE_EXAMPLES = {
  // Send this to claim/unclaim a block.
  // Note: Server toggles: if block already has an owner it will UNCLAIM it.
  CLAIM_BLOCK: {
    type: "CLAIM_BLOCK",
    payload: {
      blockID: "12-34",
      userID: "user-123",
      username: "Rishabh",
      color: "#ff0000",
    },
  },

  // Server sends this immediately after connect
  INIT_STATE: {
    type: "INIT_STATE",
    payload: {
      grid: [{ blockID: "12-34", userID: "user-123" }],
      leaderboard: [
        { userID: "user-123", count: 10, username: "Rishabh", color: "#ff0000" },
      ],
      users: {
        "user-123": { username: "Rishabh", color: "#ff0000" },
      },
    },
  },

  BLOCK_UPDATED: {
    type: "BLOCK_UPDATED",
    payload: { blockID: "12-34", userID: "user-123" }, // or userID: "" when unclaimed
  },

  LEADERBOARD_UPDATE: {
    type: "LEADERBOARD_UPDATE",
    payload: [
      { userID: "user-123", count: 10, username: "Rishabh", color: "#ff0000" },
    ],
  },

  USER_PROFILE_UPDATED: {
    type: "USER_PROFILE_UPDATED",
    payload: { userID: "user-123", username: "Rishabh", color: "#ff0000" },
  },

  // Note: this payload uses `user_id` (snake_case), per server code
  RATE_LIMIT_EXCEEDED: {
    type: "RATE_LIMIT_EXCEEDED",
    payload: {
      user_id: "user-123",
      message: "You have exceeded the rate limit. Please try again later.",
    },
  },
};


// How the Go server sends data (server -> client)
//
// Transport: WebSocket text frames containing JSON objects:
//   { "type": "<EVENT_NAME>", "payload": <any> }
//
// Delivery rules (based on server code):
// - INIT_STATE is sent only to the newly connected socket.
// - Everything else is broadcast to ALL connected sockets.
// - RATE_LIMIT_EXCEEDED is also broadcast (not private to one user).

export const WS_SERVER_EVENT_DOCS = {
  INIT_STATE: {
    sentWhen: "Immediately after WS connection is established",
    broadcast: false, // only to that client
    payloadShape: {
      grid: [{ blockID: "string", userID: "string" }],
      leaderboard: [{ userID: "string", count: 0, username: "string", color: "string" }],
      users: { "userID": { username: "string", color: "string" } },
    },
  },

  BLOCK_UPDATED: {
    sentWhen: "After a claim OR unclaim (toggle) is processed",
    broadcast: true,
    payloadShape: { blockID: "string", userID: "string" }, // userID: "" means unclaimed
  },

  LEADERBOARD_UPDATE: {
    sentWhen: "After a claim OR unclaim (toggle) is processed",
    broadcast: true,
    payloadShape: [{ userID: "string", count: 0, username: "string", color: "string" }],
  },

  USER_PROFILE_UPDATED: {
    sentWhen: "After every CLAIM_BLOCK request (profile is upserted each time)",
    broadcast: true,
    payloadShape: { userID: "string", username: "string", color: "string" },
  },

  RATE_LIMIT_EXCEEDED: {
    sentWhen: "When a user sends CLAIM_BLOCK too fast (limit: 1/sec per userID)",
    broadcast: true,
    payloadShape: { user_id: "string", message: "string" }, // note snake_case user_id
  },
};

// Minimal recommended receiver (frontend)
export function handleWsMessage(eventData, handlers) {
  // handlers example:
  // {
  //   INIT_STATE: (payload) => {},
  //   BLOCK_UPDATED: (payload) => {},
  //   LEADERBOARD_UPDATE: (payload) => {},
  //   USER_PROFILE_UPDATED: (payload) => {},
  //   RATE_LIMIT_EXCEEDED: (payload) => {},
  // }

  const msg = JSON.parse(eventData);
  const fn = handlers?.[msg.type];
  if (typeof fn === "function") fn(msg.payload);
}