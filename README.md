# KnightChase

A real-time 2-player mobile game where you control a chess knight on an 8x8 board. Trap your opponent or capture them to win.

## Prerequisites

- Node.js 18+
- [Expo Go](https://expo.dev/client) app on both phones
- Firebase project (see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md))

## Setup

1. **Firebase:** Follow [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) — the config is pre-filled in `config/firebase.ts`, but you may want your own project for production.

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the dev server:**
   ```bash
   npx expo start
   ```

4. **Play on your phone:** Scan the QR code with the Expo Go app on both phones.

## How to Play

1. **Player 1** opens the app, enters a name, taps **Create Game** — gets a 4-character room code.
2. **Player 2** opens the app, enters a name, taps **Join Game**, types the room code.
3. The game starts immediately on both phones.

### Rules

- You control a chess knight (♞) on an 8x8 board.
- Knights move in an L-shape (like chess).
- **Every cell you leave is permanently blocked (✕)** — you can never visit it again.
- **You lose if:**
  - You have no valid moves on your turn, OR
  - The opponent lands on your cell (capture)
- Player 1 starts at top-left, Player 2 at bottom-right.
- Player 1 moves first, then turns alternate.

### Tips

- Green dots show your valid moves — tap one to move.
- Plan ahead — you'll run out of space fast.
- Cornering your opponent = victory.
