# Big Room Games MVP v18.5

Browser-based multiplayer game lobby with:

- Poker
- Blackjack with rotating human dealer
- Liar's Dice
- Werewolf with automated night roles
- Who's Undercover
- Draw Guess / Gartic Phone style drawing game
- Big Room chat and per-room chat

## v16 Changes

### Draw Guess performance rating

Draw Guess no longer rewards every participant automatically when the gallery is created.

After all draw/guess chains are completed, the game enters a `rating` phase.

In the rating phase:

- Each chain shows a performance-rating section.
- Players rate each participant's performance in that chain as:
  - Good
  - Bad
- Players cannot rate themselves.
- Ratings are grouped by chain and player, not just by individual guesses.

Final result:

- If a player has more Good ratings than Bad ratings, they win and gain +$100.
- If a player has more Bad ratings than Good ratings, they lose and lose -$100.
- If Good and Bad are equal, their chips do not change.

After every required rating is submitted, the game automatically enters the final gallery with results.

## Existing v15 fixes retained

### Werewolf

- If Witch does not save the wolf-attacked player, that player cannot be poisoned during the same poison phase.
- If Witch saves the attacked player, that player remains alive and can be poisoned in the same poison phase.
- Killed Seer/Witch roles are skipped with a short neutral delay to reduce information leakage.

### Draw Guess

- Chain assignment avoids sending a player their own previous guess immediately as a drawing task.
- Draw Guess requires at least 4 players.

## Run

```bash
npm install
npm start
```

Open:

```text
http://localhost:3000
```

## Cloudflare Tunnel

```bash
cloudflared tunnel --url http://localhost:3000
```

Share the generated `https://xxxx.trycloudflare.com` link.

## Notes

This is still an MVP prototype. There is no database yet, so rooms, chips, dice, chat, and game state reset if the server restarts.


## v16.1 Hotfix

- Fixed server crash: `ReferenceError: emitDrawingRoom is not defined`.
- Restored Draw Guess room state emission for rating/gallery phases.
- No rule changes from v16.


## v16.2 Hotfix

- Moved the Poker control bar lower.
- Added more spacing under the Poker table.
- Raised the control bar z-index so player cards do not visually cover the buttons.


## v16.3 Hotfix

- Poker showdown now shows each revealed player's real cards under their seat card.
- Poker action buttons are moved lower, into the area between the table and the player/log panels.
- Player seat positions are unchanged.


## v16.4 Hotfix

### Poker standard deck

- Poker uses a shuffled standard 52-card deck each hand.
- Cards are dealt from `table.deck.pop()`, so duplicates cannot appear inside one hand.

### Voluntary selected-card show

- Players can voluntarily show cards at any time while they still have cards from the current hand.
- Players can choose:
  - Show Left
  - Show Right
  - Show Both
- This works even after folding, and after winning by everyone else folding.
- Showing cards only reveals the selected card(s), not necessarily both cards.
- Other players are not forced to reveal.


## v16.5 Hotfix

### Poker ante-only start

Poker now starts with a table ante instead of blinds:

- Every active player pays $10 to enter the hand.
- There are no small blind / big blind forced bets.
- `currentBet` starts at 0.
- The first player can immediately Check.
- Folding after the hand starts loses the $10 ante already placed in the pot.

### Poker action order

- First hand: Poker room host acts first.
- Later hands: previous hand winner acts first.
- After that, turns continue clockwise using table player order.


## v16.6 Hotfix

### Poker clockwise street transition

Fixed a turn-order bug where the same player could check, trigger the next street, and immediately act again.

Now:

- First hand starts with Poker room host.
- Later hands start with the previous hand winner.
- During a hand, action moves clockwise.
- When a betting round ends and a new street opens, the next betting round starts with the next active player clockwise after the previous round's last actor.


## v16.7 Hotfix

### New game: 24 Points

Added a new room type:

```text
24 Points
```

Rules:

- Can be played solo or multiplayer.
- Each round shows 4 numbers from 1 to 13.
- Use each number exactly once.
- Allowed operators: `+`, `-`, `*`, `/`, and parentheses.
- First player to submit a valid expression equaling 24 wins the round.
- Multiplayer reward:
  - First correct player gets +$50.
  - Other players in the room lose -$10.
- Solo mode:
  - Player can solve puzzles alone without chip penalty to others.

Example expression:

```text
(8-4)*(7-1)
```


## v16.8 Hotfix

### 24 Points button-based UI

- Removed free text input for 24 Points.
- Expression entry is now button-based.
- Click the number cards at the top to use each number.
- Click operator buttons for `+ - * / ( )`.
- Added `Undo` and `Clear`.
- Submit sends the built expression to the server for validation.


## v16.9 Hotfix

### 24 Points

- Removed the expression result preview.
- Multiplayer rounds now auto-start the next round immediately after someone answers correctly.
- The previous correct-answer message stays visible during the next round, then gets replaced by the next correct-answer message.
- Number generation continues to require a solvable 24-point puzzle before showing the four numbers.


## v16.10 Hotfix

### 24 Points skip voting

- During an active 24 Points round, the top button becomes `Vote Skip`.
- A player clicking it only votes to skip.
- The round skips only when every player in the 24 Points room has voted to skip.
- The button shows current skip votes, like `Vote Skip 2/4`.

### 24 Points expression controls

- Removed the `Undo` wording.
- Added a `←` delete button.
- `←` deletes the most recent token from the expression.


## v16.11 Hotfix

### 24 Points reward update

- The first player to solve the round now takes `$20` from each other player.
- Example: in a 4-player room, the solver gains up to `$60`, and the other 3 players each lose `$20`.
- If a player has less than `$20`, they pay whatever chips they have left.


## v16.12 Hotfix

### New game: Regicide

Added a new game room type:

```text
Regicide
```

Core implemented rules:

- 1-4 player cooperative boss-fight room.
- Enemy deck uses J/Q/K enemies, with J before Q before K.
- Enemy stats:
  - J: 20 HP / 10 ATK
  - Q: 30 HP / 15 ATK
  - K: 40 HP / 20 ATK
- Player deck removes J/Q/K and uses non-face cards plus Joker count by player count.
- Hand limits:
  - 1 player: 8
  - 2 players: 7
  - 3 players: 6
  - 4 players: 5
- Current enemy immunity follows its suit.
- Suit powers:
  - Spades reduce enemy attack.
  - Hearts recover discard into the player deck.
  - Clubs double damage.
  - Diamonds draw cards round-robin.
- Legal plays:
  - One card.
  - A + one other card.
  - Same-rank combo with total <= 10.
  - Joker alone.
- Pass is allowed, but player still defends.
- If enemy survives, current player must discard enough value to defend.
- Exact kill converts enemy onto the player deck top.
- Overkill sends enemy to discard.
- Defeat all enemies to win; fail defense to lose.
- Solo Joker refresh tokens are included.

### Regicide rules drawer

- Regicide screen now has a side `Rules` button.
- Clicking it opens a rules drawer.
- The drawer loads `public/regicide_rules.md`.
- The project root also includes `regicide_rules.md`.


## v16.13 Hotfix

### Regicide card play fix

- Fixed Regicide hand selection controls.
- `Play Selected` and `Defend with Selected` now enable immediately after selecting cards.
- Hand cards now behave as proper selectable buttons.

### Regicide concise rules

- Replaced the long rules drawer text with a shorter, easier-to-read Chinese quick guide.
- The quick rules explain:
  - Goal
  - Boss order and stats
  - Turn flow
  - Suit abilities
  - Legal plays
  - Pass
  - Defense
  - Exact kill / overkill
  - Solo mode


## v16.14 Hotfix

### Regicide boss UI

- Boss is now enlarged and centered.
- Boss HP is shown as a visual health bar.
- Boss attack now uses the `🗡` icon.
- Added a floating attack arrow showing who the boss is targeting.
- Status and battle zone sit under the boss area.

### Regicide rules drawer

- Rules drawer no longer displays raw markdown.
- Replaced with structured rule cards:
  - Goal
  - Boss stats
  - Turn flow
  - Suit powers
  - Legal plays
  - Boss defeat
  - Pass warning


## v16.15 Hotfix

### Regicide suit guide

- Added a four-suit ability guide under the player's hand:
  - ♠ Spades: reduce boss attack
  - ♥ Hearts: return discard to deck
  - ♣ Clubs: double damage
  - ♦ Diamonds: draw cards round-robin

### Regicide card color distinction

- A cards are visually marked as `Pet` cards with a gold highlight.
- Joker cards are visually marked with a purple highlight.
- Normal cards use the regular hand-card style.


## v16.16 Hotfix

### Regicide controls

- Moved Start / Play / Pass / Defend / Solo Joker Refresh buttons above the player's hand.
- Boss area is now focused on boss display instead of action buttons.

### Regicide boss rewards and entry fee

- Regicide entry fee: each player pays `$100` when the run starts.
- Defeating a J gives every Regicide player `$25`.
- Defeating a Q gives every Regicide player `$50`.
- Defeating a K gives every Regicide player `$100`.

### Regicide boss defeat effect

- Added a boss defeat pop effect when a boss is defeated.
- The effect shows the defeated boss and reward.

### Regicide player phase effects

- Regicide player cards now clearly show:
  - Current turn
  - Attack phase
  - Defense phase
  - Joker choose-next phase

### Chat bubbles

- When a player sends a visible chat message, a fixed-size bubble briefly appears above that player's card.
- The bubble text automatically scales down for longer messages.
- This applies across Big Room and game-room chats.


## v16.17 Hotfix

### Regicide face-card values

- Added face-card point values next to the suit guide under the player's hand:
  - J = 10
  - Q = 15
  - K = 20

### Regicide boss immunity display

- Boss immunity is now shown as a larger badge.
- Active immunity pulses and uses a shield icon.
- If Joker removes immunity, the badge changes to a clearer `No immunity` state.


## v16.18 Hotfix

### Regicide Pet combo preview

- When an A/Pet card is selected together with exactly one other card, the Pet card shows a preview bubble above it.
- The preview shows:
  - Total combo value
  - Final damage
  - Suit effects that will trigger
  - Effects blocked by boss immunity


## v16.19 Hotfix

### Regicide defeat / victory cinematic effects

- When Regicide is lost because a player cannot defend, the boss now performs a dramatic slash effect.
- All Regicide player cards darken and show a slash effect.
- When players defeat a boss, the boss now receives a dramatic sword-slash effect in addition to the reward popup.
- Added a `loseEffect` state for clearer Regicide fail visuals.


## v16.20 Hotfix

### Regicide UI

- Pet combo preview now renders above other UI layers.
- Replaced the old Battle Status panel with a discard-pile visual stack and discard count.
- Added defeated-boss chips in the top-left of the Current Boss area, shown in defeat order.


## v16.21 Hotfix

### Regicide UI correction

- Corrected the old Discard Pile visual to show the Player Deck instead.
- Player Deck is now shown as a compact stack of cards with the remaining deck count on top.
- Player Deck panel and Battle Zone panel are smaller so they take less space under the boss.
- Battle Zone cards render smaller inside the compact panel.


## v16.22 Hotfix

- Pet combo preview now sits above the top action buttons.
- Regicide player cards show current profit/loss for this run.
- Hovering a defeated boss chip shows the full poker card preview.

## v17 Update

### Regicide

- Entry fee changed from `$100` to `$200` per player.
- Defeated boss chips now wrap after every 4 bosses, so the display becomes 4 per row.


## v17.1 Hotfix

### Blackjack hidden dealer card

- Fixed a multiplayer Blackjack visibility bug.
- During `playerTurns`, non-dealer players now see the dealer's second card as hidden on the dealer player's table card.
- Non-dealer players also see only the visible-card total for the dealer player.
- The dealer can still see their own full dealer hand.
- The center dealer display remains hidden until reveal/settlement.


## v17.2 Hotfix

### Blackjack manual dealer actions

- Dealer is no longer auto-played by the server.
- After all non-dealer players finish, the round enters `dealerTurn`.
- The dealer must manually click `Hit` or `Stand`.
- Dealer buttons are constrained:
  - Dealer can only `Hit` below 17.
  - Dealer can only `Stand` on 17 or higher.
  - Double Down and Insurance are disabled for dealer turn.
- Other players cannot press dealer action buttons.


## v17.3 Hotfix

### Blackjack dealer rules

- Only the current dealer can click `Deal Cards`.
- Blackjack host can no longer deal unless they are also the current dealer.
- Dealer's second card stays hidden from everyone during `playerTurns`.
- Dealer's hidden card is revealed when the game enters `dealerTurn`.
- Dealer's bet `+` / `-` controls are disabled while they are dealer.
- Dealer still acts manually:
  - Below 17: must Hit.
  - 17 or above: can Stand.


## v17.4 Hotfix

### Blackjack auto-deal

- Blackjack only: removed the `Deal Cards` button from the UI.
- After all eligible non-dealer players place their bets, cards are dealt automatically.
- Dealer still gets one visible card and one hidden card.
- Dealer still acts manually during `dealerTurn`.
- Other games are unchanged.


## v17.5 Hotfix

### 24 Points

- Players can now leave a 24 Points room at any time, even while a round is running.
- Leaving clears the 24 Points screen and returns the player to the Big Room.
- Creating or switching between 24 Points rooms is allowed while already inside a running 24 Points room.
- Player cards now show total profit/loss since that player entered the 24 Points room.


## v17.6 Hotfix

### Blackjack rule updates

- Dealer peeks/checks the hole card when the visible card is an Ace or 10-value card.
- If dealer has Blackjack on the initial two cards, the round reveals and settles immediately.
- Dealer 5-card rule added: if dealer reaches 5 cards without busting, dealer wins against all remaining non-busted player hands.
- If all betting players bust before dealer turn, dealer does not need to hit; the round settles immediately.
- Existing insurance payout math was left unchanged.


## v17.7 Layout refresh

- Poker, Blackjack, and Liar's Dice now use a left sidebar player list with scroll.
- The main table area stays centered on the right, so it no longer covers the action buttons.
- Buttons remain in a separate row underneath the table.
- Poker revealed/showed cards are visible on the player card in the left sidebar.
- Blackjack center now also shows your hand.


## v17.8 Hotfix

### Liar's Dice

- Dice now render inside the left player card instead of spilling into the next card.
- Sidebar dice cards have internal wrapping and spacing.
- Reveal timing changed from `700ms` to `1000ms`.
- During reveal, the left player list reveals players' dice one player at a time.

### Draw Guess

- Fixed chain routing so players do not receive a chain they already drew or guessed.
- Each chain now visits every non-owner player exactly once.
- Players still never receive their own original prompt's chain.


## v17.9 Hotfix

### Liar's Dice sidebar spacing

- Dice player cards now keep a fixed card height and fixed gap.
- Player spacing no longer compresses as player count increases.
- Dice stay inside each player card.
- The left list remains scrollable for large player counts.


## v17.10 Hotfix

### Liar's Dice visual tweak only

- Enlarged dice inside the left player cards.
- Nudged the Liar's Dice table slightly to the right.
- No gameplay logic changed.


## v17.11 Hotfix

### Big Room top-right display only

- Fixed top-right money display in the Big Room.
- `$0` now displays correctly instead of falling back to `$1000`.
- Dice display continues to use the current player's actual dice count.
- No gameplay logic changed.


## v18 Voice Chat

### WebRTC mesh voice

- Added game-room voice chat using browser WebRTC.
- Socket.IO is used only for signaling:
  - voice join / leave
  - WebRTC offer / answer
  - ICE candidates
  - mute status
- Voice is scoped to the current game room.
- Leaving or switching game rooms automatically disconnects voice.
- Added a floating voice panel with:
  - Join Voice
  - Mute / Unmute
  - Leave
  - connected peer list


## v18.1 Gomoku + Connect Four

### New game rooms

- Added Gomoku game rooms.
  - 15×15 board.
  - 2 players.
  - Host starts / resets the game.
  - Black goes first.
  - First player to connect 5 stones wins.
- Added Connect Four game rooms.
  - 7 columns × 6 rows.
  - 2 players.
  - Host starts / resets the game.
  - Red goes first.
  - First player to connect 4 pieces wins.
- Both games support:
  - Big Room creation / joining.
  - Room chat.
  - Room log.
  - Game-room voice chat from v18.
  - Big Room host kicking.


## v18.2 Blackjack hotfix

- Fixed a Blackjack UI render bug where the screen could stop updating before cards, hints, and controls were shown.
- Added the missing `bj-my-hand` DOM reference.
- Made shared card rendering null-safe.
- No Blackjack gameplay rules were changed.


## v18.3 Voice hotfix

- Fixed intermittent one-way / missing audio when a new player joins voice.
- ICE candidates that arrive before offer/answer setup are now queued instead of dropped.
- Queued ICE candidates are flushed after remote descriptions are set.
- WebRTC `disconnected` is treated as a temporary hiccup and only cleaned up after a delay.
- One failing peer connection no longer breaks future voice signaling.


## v18.4 Fairness and UI hotfixes

### Poker

- Added total hand contribution tracking for every player.
- Showdown now resolves main pot and side pots.
- Tied winners split the eligible pot evenly; odd chips are awarded by table order.
- A short all-in stack can no longer win more from a player than the amount that stack was eligible to contest.
- Poker left-side player cards now keep fixed spacing.
- Revealed/show cards are displayed inside the player card with more space so they are not blocked.

### Draw Guess

- Added a final guess step when the chain would otherwise end after a drawing.
- While waiting for other players, submitted prompts/drawings/guesses can be edited and submitted again.
- Updated drawing hints/buttons to show "Update" when a submission already exists.

### Voice

- Strengthened the voice panel fixed positioning and z-index.
- The voice panel forces a small viewport repaint so it does not require browser zoom changes to appear.

### Player cards

- Added a bankruptcy counter badge.
- When a player crosses from positive chips to zero chips, their counter increases by 1.
- The badge is shown on player cards across rooms.


## v18.5 Draw Guess hotfix

### Time limit

- Prompt, drawing, and guess phases now each have a 2-minute timer.
- Missing submissions are auto-filled when time runs out.
- The client shows a live countdown timer.

### Safer clear button

- Drawing `Clear` now requires a second click within 3 seconds.
- This prevents accidental full-canvas clearing.

### Step-by-step gallery voting

- Rating now reveals each chain one entry at a time.
- Players vote Good / Bad on the currently revealed drawing or guess.
- When voting on a guess, the previous drawing is shown beside it for context.
- At the end of each chain, the original prompt and final guess are shown together before moving to the next chain.
- Final scoring still uses Good > Bad = +100, Bad > Good = -100, tie = 0.
