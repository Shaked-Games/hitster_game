# Hitster 🎵

A local multiplayer music timeline game for 1–4 players sharing one screen.

## Setup

### Prerequisites
- Node.js 18+

### Install

```bash
# From the hitster/ root
npm install
npm run install:all
```

### Run

```bash
npm run dev
```

Opens:
- **Server** → `http://localhost:3001`
- **Client** → `http://localhost:5173`

Open `http://localhost:5173` in your browser.

---

## Add Your Songs

Edit `server/songs_list.csv`:

```
name,artist,year,spotify_link
Bohemian Rhapsody,Queen,1975,https://open.spotify.com/track/3z8h0TU7ReDPLIbEnYhWZb
```

---

## How to Play

1. Each player sits at one side of the screen
2. Press **Play** to hear the 30-second Spotify preview
3. Press **Done Listening**, then tap a slot on your timeline
4. Press **Lock In** to reveal the year
5. **Correct** → card added to your timeline. **Wrong** → card discarded
6. **First to 10 cards wins!**

---

## Project Structure

```
hitster/
├── package.json                  # Root – runs both with concurrently
│
├── server/
│   ├── package.json
│   ├── tsconfig.json
│   ├── songs_list.csv            # ← Your song data
│   └── src/
│       ├── index.ts              # Express server entry
│       ├── songService.ts        # CSV loading + Spotify utilities
│       ├── types.ts              # Server-side types
│       └── routes/
│           └── songs.ts          # GET /api/songs
│
└── client/
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    └── src/
        ├── main.tsx
        ├── App.tsx               # Root component + screen routing
        ├── types.ts              # Shared client types (Song, Player, GameState…)
        ├── index.css             # Global styles + CSS variables
        ├── constants/
        │   └── gameConstants.ts  # All magic numbers & phase enums
        ├── services/
        │   └── api.ts            # Server communication
        ├── hooks/
        │   └── useGameState.ts   # Full game logic via useReducer
        └── components/
            ├── PlayerSetup/      # Player-count selection screen
            ├── GameBoard/        # 4-sided board layout
            │   ├── GameBoard.tsx
            │   ├── PlayerZone.tsx
            │   ├── Timeline.tsx
            │   ├── SongCard.tsx
            │   └── CenterControl.tsx
            └── WinScreen/        # Victory screen
```
