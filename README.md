# games-web

A multiplayer browser game hub with poker, blackjack, dice, social deduction games, drawing/guessing, board games, voice chat, and room-based multiplayer lobbies.

## Features

### Big Room Lobby

- Create or join a Big Room with a room code.
- Big Room host can kick players.
- Players can create and join different game rooms inside the Big Room.
- Shared player economy:
  - Chips / money
  - Dice count
  - Bankruptcy counter
- Big Room chat and game room chat.
- Player chat bubbles appear on player cards for a short time.

### Game Rooms

Current supported game rooms:

- Poker
- Blackjack
- Liar's Dice
- Werewolf
- Who's Undercover
- Draw Guess
- 24 Points
- Regicide
- Gomoku
- Connect Four

### Voice Chat

- WebRTC mesh voice chat.
- Socket.IO signaling.
- Voice is scoped to the current game room.
- Players in different rooms cannot hear each other.
- Includes:
  - Join Voice
  - Mute / Unmute
  - Leave Voice
  - Connected peer list

## Constants

Game constants are located in:

```text
poker-web-mvp-.../server.js
```

Constants include:

```js
const STARTING_CHIPS = 1000;

const SMALL_BLIND = 5;
const BIG_BLIND = 10;
const POKER_ANTE = 10;
const MAX_POKER_PLAYERS = 10;

const MAX_BLACKJACK_PLAYERS = 7;
const BLACKJACK_BET = 50;
...
```

You can change these values directly in `server.js`.

## How to Start

### 1. Install Node.js

Install Node.js from:

```text
https://nodejs.org/
```

Recommended version:

```text
Node.js 20+
```

The project has also been tested with newer Node versions.

### 2. Open the project folder

Example:

```bat
cd D:\mypokerweb\poker-web-mvp-v18-5
```

### 3. Install dependencies

Run:

```bat
npm install
```

### 4. Start the server

Run:

```bat
npm start
```

Or:

```bat
node server.js
```

### 5. Open the game in browser

Go to:

```text
http://localhost:3000
```

## How to Play Locally With Friends on Same Wi-Fi

Start the server on your computer, then find your local IP address.

On Windows:

```bat
ipconfig
```

Look for something like:

```text
IPv4 Address . . . . . . . . . . . : 192.168.1.23
```

Other players on the same Wi-Fi can open:

```text
http://192.168.1.23:3000
```

Replace `192.168.1.23` with your actual local IP.

## How to Share Online With Cloudflare Tunnel

If you want friends outside your Wi-Fi to join, you can use Cloudflare Tunnel.

### 1. Install cloudflared

Download from:

```text
https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
```

### 2. Start your game server

In the project folder:

```bat
npm start
```

### 3. Open a second terminal

Run:

```bat
cloudflared tunnel --url http://localhost:3000
```

Cloudflare will show a temporary public URL like:

```text
https://example-name.trycloudflare.com
```

Send that link to your friends.

## One-click Windows Start Example

You can create a `.bat` file like this:

```bat
@echo off
cd /d D:\mypokerweb\poker-web-mvp-v18-5
start "Game Server" cmd /k "npm start"
timeout /t 3 >nul
start "Cloudflare Tunnel" cmd /k "cloudflared tunnel --url http://localhost:3000"
```

Change the folder path if your project is somewhere else.

## Project Structure

Typical project structure:

```text
poker-web-mvp-v18-5/
├─ server.js
├─ package.json
├─ package-lock.json
├─ undercover_word_bank.txt
├─ public/
│  ├─ index.html
│  ├─ client.js
│  └─ style.css
└─ README.md
```

## Main Files

### server.js

Contains:

- Express server
- Socket.IO multiplayer logic
- Big Room logic
- Game room logic
- Poker rules
- Blackjack rules
- Dice rules
- Social deduction rules
- Draw Guess rules
- 24 Points rules
- Regicide rules
- Gomoku rules
- Connect Four rules
- WebRTC voice signaling

### public/index.html

Contains:

- Main HTML layout
- Screens for lobby and game rooms
- Buttons and UI containers

### public/client.js

Contains:

- Frontend rendering
- Socket.IO client events
- Button handlers
- Canvas drawing logic
- WebRTC voice client logic

### public/style.css

Contains:

- Game UI styling
- Player cards
- Tables
- Boards
- Buttons
- Voice panel
- Animations

### undercover_word_bank.txt

Word bank for Who's Undercover.

Format:

```text
word1|word2
coffee|tea
cat|dog
```

Each line is one pair.

## Game Notes

### Poker

- Uses a standard 52-card deck.
- Cards are drawn from one shuffled deck per hand.
- Supports:
  - Ante
  - Fold
  - Check
  - Call
  - Raise
  - All-in
  - Show selected cards
  - Side pots
  - Tie pot splitting

### Blackjack

- Multiplayer player-vs-player dealer mode.
- Dealer rotates.
- Non-dealer players bet against the current dealer.
- Dealer gets one face-up card and one hidden card.
- Players act first.
- Dealer reveals hidden card after all players act.
- Dealer rules:
  - Below 17: must hit
  - 17 or above: must stand
  - 5 cards without busting: dealer wins
- Push returns the bet.
- Insurance exists when dealer shows Ace.

### Liar's Dice

- Players roll dice secretly.
- Players bid count and face.
- Players can challenge or spot on.
- Dice reveal one player at a time.
- Extra dice can be sold or bought in the Big Room Dice Bank.

### Werewolf

- Automatic phase progression.
- Supports:
  - Werewolves
  - Villagers
  - Seer
  - Witch
  - Hunter
- Werewolves can use wolf-only chat.
- Voting buttons appear on player cards.
- Dead players become visually dimmed.
- Winning team gains chips; losing team loses chips.

### Who's Undercover

- Players receive secret words.
- One or more undercover players receive different words.
- Players vote to eliminate.
- Highest vote is eliminated.
- Ties trigger revote logic.
- Winners gain chips.

### Draw Guess

- Similar to Gartic Phone.
- Flow:
  - Prompt
  - Draw
  - Guess
  - Draw
  - Guess
  - Gallery / voting
- Each prompt / drawing / guess phase has a 2-minute timer.
- Clear drawing requires confirmation.
- Final gallery reveals each chain one entry at a time.
- Players vote Good / Bad on each drawing or guess.
- Final scoring:
  - Good > Bad: +100
  - Bad > Good: -100
  - Tie: no change

### 24 Points

- Can be played solo or multiplayer.
- Uses four generated numbers with guaranteed solution.
- Players build expressions with buttons.
- First correct player wins chips from others.
- Skip requires all players to vote.
- Players can leave anytime.

### Regicide

- Cooperative card battle game.
- Entry fee applies.
- Defeating bosses gives chip rewards:
  - J: +25
  - Q: +50
  - K: +100
- Uses player deck, enemy deck, discard pile, and battle zone.
- Boss effects and suit immunity are shown in the UI.

### Gomoku

- 15×15 board.
- 2 players.
- Black goes first.
- First to connect 5 wins.

### Connect Four

- 7 columns × 6 rows.
- 2 players.
- Red goes first.
- First to connect 4 wins.

## Development

### Start dev server

```bat
npm start
```

### Check JavaScript syntax

```bat
node --check server.js
node --check public/client.js
```

### Install dependencies again

```bat
npm install
```

## Troubleshooting

### Port already in use

If port `3000` is already being used, close the old server window or change the port in `server.js`:

```js
const PORT = process.env.PORT || 3000;
```

Example:

```js
const PORT = process.env.PORT || 4000;
```

Then open:

```text
http://localhost:4000
```

### Friends cannot connect on same Wi-Fi

Check:

- Everyone is on the same Wi-Fi.
- You are using your local IPv4 address.
- Windows Firewall allows Node.js.
- The server is still running.

### Cloudflare link not working

Check:

- `npm start` is running first.
- Cloudflare tunnel points to:

```text
http://localhost:3000
```

- You copied the full `https://...trycloudflare.com` link.

### Voice chat not working

Check:

- Browser microphone permission is allowed.
- The page is opened with `https` when online.
- Localhost works with microphone permissions.
- Players joined the same game room voice.
- Try leaving and rejoining voice.

## Notes

This project is designed as a casual multiplayer web game hub.

It is not intended for real-money gambling.

All chips are virtual in-game values only.
