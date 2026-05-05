Absolutely — here’s your content converted into clean Markdown format.

***

# Magic Board: A Real-time Collaborative Grid Game

Magic Board is a web-based, multi-user application where users can collaboratively claim cells on a shared grid. It features real-time updates, a live leaderboard, and basic user profile customization, all built with a modern frontend stack.

This project was developed to demonstrate proficiency in building interactive, real-time applications with React, managing complex state, and optimizing frontend performance.

## Core Features

- **Real-time Grid:** A shared grid where users can claim or unclaim cells. All changes are broadcast to all connected clients instantly.
- **Live Leaderboard:** A continuously updated leaderboard showing which users have claimed the most cells.
- **User Profiles:** Users can set a custom username and color, which is persisted locally and sent to the server with each action.
- **Live Stats:** A "Magic Data" panel shows live statistics about the board, including total cells, claimed cells, and cells claimed by the current user.
- **Optimized Rendering:** The main grid is rendered using the HTML5 `<canvas>` API to ensure smooth performance, even with a large number of cells.

## Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Real-time Communication:** WebSocket API
- **UI & Styling:**
  - Components: shadcn/ui
  - Styling: Tailwind CSS
  - Theming: CSS Variables for light/dark mode support
- **State Management:** React Hooks (`useContext`, `useState`, `useEffect`, `useCallback`)
- **Audio:** HTML5 `<audio>` for UI feedback

## How It Works: Architecture & Data Flow

The application is built around a client-server architecture with a clear, event-driven data flow facilitated by WebSockets.

### 1. Client-Server Communication (WebSockets)

The core of the real-time functionality is the WebSocket connection to the server (e.g., `ws://localhost:8080/ws`).

- **Protocol:** Communication happens via simple JSON objects with a `type` and `payload` field: `{ "type": "EVENT_NAME", "payload": {...} }`
- **Client-to-Server Events:** The primary action a user can take is claiming a cell. This is sent to the server via a `CLAIM_BLOCK` message, which includes the user's profile information (`ID`, `username`, `color`).
- **Server-to-Client Events:** The server processes actions and broadcasts state changes to all connected clients:
  - `INIT_STATE`: Sent once to a new client, providing the entire current state of the grid, leaderboard, and users.
  - `BLOCK_UPDATED`: Sent after any cell is claimed or unclaimed, updating a single cell on the board for all users.
  - `LEADERBOARD_UPDATE`: Sent after any change that affects scoring, providing the new sorted leaderboard.
  - `USER_PROFILE_UPDATED`: Sent after a user claims a block, ensuring all clients have the latest profile information for that user.

### 2. Frontend State Management

#### `useBoardSocket` Hook
This custom hook is the brain of the frontend. It encapsulates all WebSocket logic:

- Establishes and maintains the WebSocket connection.
- Includes automatic, exponential back-off for reconnect attempts.
- Listens for incoming server messages and updates the React state accordingly.
- Exposes the game state (`blocksById`, `leaderboard`, `usersById`) and action creators (`claimCell`) to the rest of the application.

#### `UserContext`
This React context provides a persistent user identity.

- It generates a unique `userID` for new users and stores it in `localStorage`.
- It allows users to set a `userName` and `userColor`, also persisted to `localStorage`.
- This context makes user data available to any component that needs it without prop-drilling.

## Optimizations & Key Decisions

Several key optimizations were implemented to ensure a robust and performant user experience.

### 1. Canvas for Grid Rendering

**Problem:** Rendering a large grid (e.g., \(10 \times 20 = 200\) cells) with individual DOM elements (e.g., `<div>`s) is inefficient. Each element adds overhead, and re-rendering them frequently can cause performance bottlenecks.

**Solution:** We use a single HTML5 `<canvas>` element to draw the entire grid. This is significantly more performant because we are manually controlling pixels in a single element rather than managing a large DOM tree. The `drawGrid` function is responsible for rendering all cells, their states (empty, claimed by me, claimed by others), and hover effects in a single pass.

### 2. Efficient Re-rendering with `useCallback`

**Problem:** In a React application, functions defined inside components are re-created on every render. If these functions are passed as props to child components (especially memoized ones), it can cause unnecessary re-renders.

**Solution:** The draw function within the `MagicBoard` component is wrapped in `useCallback`. Its dependency array is carefully managed (`[blocksById, usersById, userID, size.w, size.h]`) to ensure it only creates a new function when the data it needs to draw has actually changed. This prevents the canvas from re-drawing on every single mouse movement, only when state changes warrant it.

### 3. Dynamic Theming with CSS Variables

```ts
function getTheme(el: Element) {
  return {
    background: cssVar(el, "--background"),
    card: cssVar(el, "--card"),
    border: cssVar(el, "--border"),
    // ...etc
  };
}
```

**Problem:** The application supports a dark theme. Hard-coding colors in the JavaScript canvas drawing logic would make it difficult to sync with the CSS theme.

**Solution:** The `drawGrid` function reads CSS variables directly from the canvas element's computed style (`getComputedStyle`). This ensures that the canvas colors for the background, borders, and hover effects are always perfectly in sync with the active CSS theme (`.dark` or light).

### 4. Decoupled State and Unidirectional Data Flow

**Problem:** In a complex app, it can be tempting to have components directly modify state from various places, leading to unpredictable behavior.

**Solution:** The project enforces a clear, unidirectional data flow.

- **State Source of Truth:** The `useBoardSocket` hook is the single source of truth for all server-related state.
- **Actions:** Components don't modify state directly. They call action functions like `claimCell`.
- **Update Loop:** The `claimCell` function sends a message to the server. The server processes it and broadcasts an update. The `useBoardSocket` hook receives the update and modifies the state, which then flows down to the components, triggering a re-render. This loop ensures the UI is always a reflection of the server's state.

### 5. Global Click Sound Handler

**Problem:** Playing a sound effect for every button click could require adding logic to dozens of components.

**Solution:** A global `pointerdown` event listener is attached to the window in `App.tsx`. It uses event bubbling to check if the clicked element or any of its parents match a selector for "clickable" elements (like `button`, `[role="button"]`, or our canvas). This centralizes the logic, keeps components clean, and makes it easy to manage which interactions produce a sound.
