const socket = io();

const screens = {
  join: document.querySelector("#join-screen"),
  lobby: document.querySelector("#lobby-screen"),
  poker: document.querySelector("#poker-screen"),
  blackjack: document.querySelector("#blackjack-screen"),
  dice: document.querySelector("#dice-screen"),
  werewolf: document.querySelector("#werewolf-screen"),
  undercover: document.querySelector("#undercover-screen"),
  drawing: document.querySelector("#drawing-screen"),
  twentyfour: document.querySelector("#twentyfour-screen"),
  regicide: document.querySelector("#regicide-screen"),
  gomoku: document.querySelector("#gomoku-screen"),
  connectfour: document.querySelector("#connectfour-screen")
};

const nameInput = document.querySelector("#name-input");
const bigRoomInput = document.querySelector("#big-room-input");
const joinBigBtn = document.querySelector("#join-big-btn");
const joinError = document.querySelector("#join-error");

const bigRoomCodeEl = document.querySelector("#big-room-code");
const bigHostLineEl = document.querySelector("#big-host-line");
const myChipLineEl = document.querySelector("#my-chip-line");
const myDiceLineEl = document.querySelector("#my-dice-line");
const leaveBigBtn = document.querySelector("#leave-big-btn");
const gameTypeSelect = document.querySelector("#game-type-select");
const gameRoomNameInput = document.querySelector("#game-room-name");
const createGameBtn = document.querySelector("#create-game-btn");
const gameRoomListEl = document.querySelector("#game-room-list");
const bigPlayerListEl = document.querySelector("#big-player-list");
const bigLogEl = document.querySelector("#big-log");
const sellDieBtn = document.querySelector("#sell-die-btn");
const buyDieBtn = document.querySelector("#buy-die-btn");
const bigChatEl = document.querySelector("#big-chat");
const bigChatInput = document.querySelector("#big-chat-input");
const bigChatSend = document.querySelector("#big-chat-send");

// Voice
const voicePanel = document.querySelector("#voice-panel");
const voiceStatusText = document.querySelector("#voice-status-text");
const voiceJoinBtn = document.querySelector("#voice-join-btn");
const voiceMuteBtn = document.querySelector("#voice-mute-btn");
const voiceLeaveBtn = document.querySelector("#voice-leave-btn");
const voicePeerList = document.querySelector("#voice-peer-list");
const voiceAudioArea = document.querySelector("#voice-audio-area");

// Poker
const pokerRoomTitleEl = document.querySelector("#poker-room-title");
const pokerHostLineEl = document.querySelector("#poker-host-line");
const pokerChipLineEl = document.querySelector("#poker-chip-line");
const phaseEl = document.querySelector("#phase");
const potEl = document.querySelector("#pot");
const currentBetEl = document.querySelector("#current-bet");
const communityEl = document.querySelector("#community");
const myHandEl = document.querySelector("#my-hand");
const showLeftCardBtn = document.querySelector("#show-left-card-btn");
const showRightCardBtn = document.querySelector("#show-right-card-btn");
const showBothCardsBtn = document.querySelector("#show-both-cards-btn");
const seatsEl = document.querySelector("#seats");
const playersListEl = document.querySelector("#players-list");
const pokerLogEl = document.querySelector("#poker-log");
const turnHintEl = document.querySelector("#turn-hint");
const gameError = document.querySelector("#game-error");
const winnerBox = document.querySelector("#winner-box");
const startBtn = document.querySelector("#start-btn");
const foldBtn = document.querySelector("#fold-btn");
const checkBtn = document.querySelector("#check-btn");
const callBtn = document.querySelector("#call-btn");
const raiseSlider = document.querySelector("#raise-slider");
const raiseValue = document.querySelector("#raise-value");
const raiseBtn = document.querySelector("#raise-btn");
const pokerChatEl = document.querySelector("#poker-chat");
const pokerChatInput = document.querySelector("#poker-chat-input");
const pokerChatSend = document.querySelector("#poker-chat-send");

// Blackjack
const bjRoomTitleEl = document.querySelector("#bj-room-title");
const bjHostLineEl = document.querySelector("#bj-host-line");
const bjChipLineEl = document.querySelector("#bj-chip-line");
const bjPhaseEl = document.querySelector("#bj-phase");
const bjBetEl = document.querySelector("#bj-bet");
const bjDealerTotalEl = document.querySelector("#bj-dealer-total");
const bjDealerHandEl = document.querySelector("#bj-dealer-hand");
const bjMyHandEl = document.querySelector("#bj-my-hand");
const bjSeatsEl = document.querySelector("#bj-seats");
const bjResultsEl = document.querySelector("#bj-results");
const bjStartBtn = document.querySelector("#bj-start-btn");
const bjBetMinusBtn = document.querySelector("#bj-bet-minus");
const bjBetPlusBtn = document.querySelector("#bj-bet-plus");
const bjBetValueEl = document.querySelector("#bj-bet-value");
const bjPlaceBetBtn = document.querySelector("#bj-place-bet-btn");
const bjDealBtn = document.querySelector("#bj-deal-btn"); // removed from UI in v17.4; kept nullable for compatibility
const bjHitBtn = document.querySelector("#bj-hit-btn");
const bjStandBtn = document.querySelector("#bj-stand-btn");
const bjDoubleBtn = document.querySelector("#bj-double-btn");
const bjInsuranceBtn = document.querySelector("#bj-insurance-btn");
const bjHintEl = document.querySelector("#bj-hint");
const bjErrorEl = document.querySelector("#bj-error");
const bjPlayerListEl = document.querySelector("#bj-player-list");
const bjLogEl = document.querySelector("#bj-log");
const bjChatEl = document.querySelector("#bj-chat");
const bjChatInput = document.querySelector("#bj-chat-input");
const bjChatSend = document.querySelector("#bj-chat-send");

// Dice
const diceRoomTitleEl = document.querySelector("#dice-room-title");
const diceHostLineEl = document.querySelector("#dice-host-line");
const diceChipLineEl = document.querySelector("#dice-chip-line");
const diceCountLineEl = document.querySelector("#dice-count-line");
const dicePhaseEl = document.querySelector("#dice-phase");
const diceCurrentBidEl = document.querySelector("#dice-current-bid");
const diceTurnEl = document.querySelector("#dice-turn");
const diceSeatsEl = document.querySelector("#dice-seats");
const diceCenterBidEl = document.querySelector("#dice-center-bid");
const diceRevealEl = document.querySelector("#dice-reveal");
const diceStartBtn = document.querySelector("#dice-start-btn");
const diceCountMinusBtn = document.querySelector("#dice-count-minus");
const diceCountPlusBtn = document.querySelector("#dice-count-plus");
const diceFaceMinusBtn = document.querySelector("#dice-face-minus");
const diceFacePlusBtn = document.querySelector("#dice-face-plus");
const diceCountValueEl = document.querySelector("#dice-count-value");
const diceFaceValueEl = document.querySelector("#dice-face-value");
const diceBidBtn = document.querySelector("#dice-bid-btn");
const diceSpotOnBtn = document.querySelector("#dice-spoton-btn");
const diceChallengeBtn = document.querySelector("#dice-challenge-btn");
const diceHintEl = document.querySelector("#dice-hint");
const diceErrorEl = document.querySelector("#dice-error");
const dicePlayerListEl = document.querySelector("#dice-player-list");
const diceLogEl = document.querySelector("#dice-log");
const diceChatEl = document.querySelector("#dice-chat");
const diceChatInput = document.querySelector("#dice-chat-input");
const diceChatSend = document.querySelector("#dice-chat-send");

// Werewolf
const wwRoomTitleEl = document.querySelector("#ww-room-title");
const wwHostLineEl = document.querySelector("#ww-host-line");
const wwPhaseEl = document.querySelector("#ww-phase");
const wwRoundEl = document.querySelector("#ww-round");
const wwRoleEl = document.querySelector("#ww-role");
const wwStartBtn = document.querySelector("#ww-start-btn");
const wwNextPhaseBtn = document.querySelector("#ww-next-phase-btn");
const wwResultEl = document.querySelector("#ww-result");
const wwPlayerGridEl = document.querySelector("#ww-player-grid");
const wwHintEl = document.querySelector("#ww-hint");
const wwErrorEl = document.querySelector("#ww-error");
const wwLogEl = document.querySelector("#ww-log");
const wwChatEl = document.querySelector("#ww-chat");
const wwWolfChatWrap = document.querySelector("#ww-wolf-chat-wrap");
const wwWolfChatEl = document.querySelector("#ww-wolf-chat");
const wwWolfOnlyLabel = document.querySelector("#ww-wolf-only-label");
const wwWolfOnlyToggle = document.querySelector("#ww-wolf-only-toggle");
const wwChatInput = document.querySelector("#ww-chat-input");
const wwChatSend = document.querySelector("#ww-chat-send");

// Who's Undercover
const ucRoomTitleEl = document.querySelector("#uc-room-title");
const ucHostLineEl = document.querySelector("#uc-host-line");
const ucPhaseEl = document.querySelector("#uc-phase");
const ucRoundEl = document.querySelector("#uc-round");
const ucWordEl = document.querySelector("#uc-word");
const ucStartBtn = document.querySelector("#uc-start-btn");
const ucResultEl = document.querySelector("#uc-result");
const ucPlayerGridEl = document.querySelector("#uc-player-grid");
const ucHintEl = document.querySelector("#uc-hint");
const ucErrorEl = document.querySelector("#uc-error");
const ucLogEl = document.querySelector("#uc-log");
const ucChatEl = document.querySelector("#uc-chat");
const ucChatInput = document.querySelector("#uc-chat-input");
const ucChatSend = document.querySelector("#uc-chat-send");

// Draw Guess
const dgRoomTitleEl = document.querySelector("#dg-room-title");
const dgHostLineEl = document.querySelector("#dg-host-line");
const dgPhaseEl = document.querySelector("#dg-phase");
const dgStepEl = document.querySelector("#dg-step");
const dgSubmittedEl = document.querySelector("#dg-submitted");
const dgStartBtn = document.querySelector("#dg-start-btn");
const dgTaskBox = document.querySelector("#dg-task-box");
const dgPromptArea = document.querySelector("#dg-prompt-area");
const dgPromptInput = document.querySelector("#dg-prompt-input");
const dgSubmitPrompt = document.querySelector("#dg-submit-prompt");
const dgDrawArea = document.querySelector("#dg-draw-area");
const dgCanvas = document.querySelector("#dg-canvas");
const dgClearCanvas = document.querySelector("#dg-clear-canvas");
const dgSubmitDrawing = document.querySelector("#dg-submit-drawing");
const dgGuessArea = document.querySelector("#dg-guess-area");
const dgGuessInput = document.querySelector("#dg-guess-input");
const dgSubmitGuess = document.querySelector("#dg-submit-guess");
const dgGallery = document.querySelector("#dg-gallery");
const dgPlayerGridEl = document.querySelector("#dg-player-grid");
const dgHintEl = document.querySelector("#dg-hint");
const dgErrorEl = document.querySelector("#dg-error");
const dgLogEl = document.querySelector("#dg-log");
const dgChatEl = document.querySelector("#dg-chat");
const dgChatInput = document.querySelector("#dg-chat-input");
const dgChatSend = document.querySelector("#dg-chat-send");

// 24 Points
const tfRoomTitleEl = document.querySelector("#tf-room-title");
const tfHostLineEl = document.querySelector("#tf-host-line");
const tfPhaseEl = document.querySelector("#tf-phase");
const tfRoundEl = document.querySelector("#tf-round");
const tfStartBtn = document.querySelector("#tf-start-btn");
const tfCardsEl = document.querySelector("#tf-cards");
const tfExpressionDisplayEl = document.querySelector("#tf-expression-display");
const tfClearBtn = document.querySelector("#tf-clear-btn");
const tfDeleteBtn = document.querySelector("#tf-delete-btn");
const tfSubmitBtn = document.querySelector("#tf-submit-btn");
const tfResultEl = document.querySelector("#tf-result");
const tfPlayerGridEl = document.querySelector("#tf-player-grid");
const tfHintEl = document.querySelector("#tf-hint");
const tfErrorEl = document.querySelector("#tf-error");
const tfLogEl = document.querySelector("#tf-log");
const tfChatEl = document.querySelector("#tf-chat");
const tfChatInput = document.querySelector("#tf-chat-input");
const tfChatSend = document.querySelector("#tf-chat-send");

// Regicide
const regRoomTitleEl = document.querySelector("#reg-room-title");
const regHostLineEl = document.querySelector("#reg-host-line");
const regPhaseEl = document.querySelector("#reg-phase");
const regEnemyDeckEl = document.querySelector("#reg-enemy-deck");
const regPlayerDeckEl = document.querySelector("#reg-player-deck");
const regDiscardEl = document.querySelector("#reg-discard");
const regStartBtn = document.querySelector("#reg-start-btn");
const regPassBtn = document.querySelector("#reg-pass-btn");
const regPlayBtn = document.querySelector("#reg-play-btn");
const regDefendBtn = document.querySelector("#reg-defend-btn");
const regSoloRefreshBtn = document.querySelector("#reg-solo-refresh-btn");
const regEnemyCardEl = document.querySelector("#reg-enemy-card");
const regStatusLinesEl = document.querySelector("#reg-status-lines");
const regBattleZoneEl = document.querySelector("#reg-battle-zone");
const regChooseNextEl = document.querySelector("#reg-choose-next");
const regChooseNextButtonsEl = document.querySelector("#reg-choose-next-buttons");
const regHandEl = document.querySelector("#reg-hand");
const regResultEl = document.querySelector("#reg-result");
const regPlayerGridEl = document.querySelector("#reg-player-grid");
const regHintEl = document.querySelector("#reg-hint");
const regErrorEl = document.querySelector("#reg-error");
const regLogEl = document.querySelector("#reg-log");
const regChatEl = document.querySelector("#reg-chat");
const regChatInput = document.querySelector("#reg-chat-input");
const regChatSend = document.querySelector("#reg-chat-send");

// Gomoku
const gomokuRoomTitleEl = document.querySelector("#gomoku-room-title");
const gomokuHostLineEl = document.querySelector("#gomoku-host-line");
const gomokuChipLineEl = document.querySelector("#gomoku-chip-line");
const gomokuPhaseEl = document.querySelector("#gomoku-phase");
const gomokuTurnEl = document.querySelector("#gomoku-turn");
const gomokuResultLineEl = document.querySelector("#gomoku-result-line");
const gomokuBoardEl = document.querySelector("#gomoku-board");
const gomokuPlayerListEl = document.querySelector("#gomoku-player-list");
const gomokuStartBtn = document.querySelector("#gomoku-start-btn");
const gomokuHintEl = document.querySelector("#gomoku-hint");
const gomokuErrorEl = document.querySelector("#gomoku-error");
const gomokuLogEl = document.querySelector("#gomoku-log");
const gomokuChatEl = document.querySelector("#gomoku-chat");
const gomokuChatInput = document.querySelector("#gomoku-chat-input");
const gomokuChatSend = document.querySelector("#gomoku-chat-send");

// Connect Four
const c4RoomTitleEl = document.querySelector("#c4-room-title");
const c4HostLineEl = document.querySelector("#c4-host-line");
const c4ChipLineEl = document.querySelector("#c4-chip-line");
const c4PhaseEl = document.querySelector("#c4-phase");
const c4TurnEl = document.querySelector("#c4-turn");
const c4ResultLineEl = document.querySelector("#c4-result-line");
const c4BoardEl = document.querySelector("#c4-board");
const c4PlayerListEl = document.querySelector("#c4-player-list");
const c4StartBtn = document.querySelector("#c4-start-btn");
const c4HintEl = document.querySelector("#c4-hint");
const c4ErrorEl = document.querySelector("#c4-error");
const c4LogEl = document.querySelector("#c4-log");
const c4ChatEl = document.querySelector("#c4-chat");
const c4ChatInput = document.querySelector("#c4-chat-input");
const c4ChatSend = document.querySelector("#c4-chat-send");
const regRulesToggle = document.querySelector("#regicide-rules-toggle");
const regRulesDrawer = document.querySelector("#regicide-rules-drawer");
const regRulesClose = document.querySelector("#regicide-rules-close");
const regRulesContent = document.querySelector("#regicide-rules-content");





let latestBigState = null;
let latestPokerState = null;
let latestBlackjackState = null;
let latestDiceState = null;
let latestWerewolfState = null;
let latestUndercoverState = null;
let latestDrawingState = null;
let latestTwentyFourState = null;
let latestRegicideState = null;
let latestGomokuState = null;
let latestConnectFourState = null;
let regicideSelected = new Set();
let regicideRulesLoaded = false;
let tfExpressionTokens = [];
let tfBuilderRoundKey = "";
let bjSelectedBet = 50;
let drawingCanvasReady = false;
let drawingActive = false;
let drawingColor = "#111827";
let drawingEraser = false;
let lastDrawingTaskKey = "";
let drawingTimerInterval = null;
let dgClearConfirmUntil = 0; 

let diceBidCount = 1;
let diceBidFace = 1;
let lastDiceBidKey = "";
let diceRevealAnimation = {
  key: null,
  step: 0,
  timer: null
};

function saveInputs() {
  localStorage.setItem("bigPokerName", nameInput.value);
  localStorage.setItem("bigPokerRoom", bigRoomInput.value);
}

function loadInputs() {
  nameInput.value = localStorage.getItem("bigPokerName") || "";
  bigRoomInput.value = localStorage.getItem("bigPokerRoom") || "";
}

function showScreen(name) {
  Object.entries(screens).forEach(([key, el]) => {
    el.classList.toggle("hidden", key !== name);
  });
}

function chatBubbleHtml(player) {
  const bubble = player?.chatBubble;
  if (!bubble?.message || !bubble?.ts) return "";

  const age = Date.now() - Number(bubble.ts || 0);
  if (age > 6500) return "";

  const text = String(bubble.message);
  const sizeClass = text.length > 80 ? "tiny" : text.length > 45 ? "small" : "";
  return `<div class="player-chat-bubble ${sizeClass}">${escapeHtml(text)}</div>`;
}

function money(value) {
  return `$${Number(value || 0)}`;
}

function bankruptcyBadge(player) {
  const count = Number(player?.brokeCount || 0);
  return count > 0 ? `<div class="bankruptcy-badge">破产 ×${count}</div>` : "";
}


function currentBigPlayer() {
  if (!latestBigState) return null;
  return latestBigState.players.find(p => p.id === latestBigState.myId) || null;
}

function isBigHost() {
  return latestBigState && latestBigState.hostId === latestBigState.myId;
}

function updateChipLabels() {
  const me = currentBigPlayer();
  const chips = money(me?.chips ?? latestBigState?.startingChips ?? 1000);
  const dice = me?.diceCount ?? 5;

  myChipLineEl.textContent = chips;
  pokerChipLineEl.textContent = chips;
  bjChipLineEl.textContent = chips;
  diceChipLineEl.textContent = chips;
  if (gomokuChipLineEl) gomokuChipLineEl.textContent = chips;
  if (c4ChipLineEl) c4ChipLineEl.textContent = chips;

  myDiceLineEl.textContent = `🎲 ${dice}`;
  diceCountLineEl.textContent = `🎲 ${dice}`;
}


function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderChat(container, messages = []) {
  if (!container) return;
  container.innerHTML = messages.length
    ? messages.map(item => `
      <div class="chat-message">
        <div class="chat-meta">
          <strong>${escapeHtml(item.name)}</strong>
          <span>${escapeHtml(item.time)}</span>
        </div>
        <p>${escapeHtml(item.message)}</p>
      </div>
    `).join("")
    : `<p class="muted">No messages yet.</p>`;

  container.scrollTop = container.scrollHeight;
}

function sendChat(input, eventName) {
  const message = input?.value?.trim();
  if (!message) return;
  socket.emit(eventName, { message });
  input.value = "";
}

function updateDiceBankButtons() {
  const me = currentBigPlayer();
  if (!me || !sellDieBtn || !buyDieBtn || !latestBigState) return;

  const value = latestBigState.diceCashValue ?? 100;
  const minimum = latestBigState.diceExchangeMinimum ?? 5;
  const maxDice = latestBigState.maxDiceCount ?? 10;

  sellDieBtn.textContent = `Sell Extra Die +${money(value)}`;
  sellDieBtn.disabled = Number(me.diceCount ?? minimum) <= minimum;

  buyDieBtn.textContent = `Buy Die -${money(value)}`;
  buyDieBtn.disabled = Number(me.diceCount ?? minimum) >= maxDice || Number(me.chips || 0) < value;
}

function cardHtml(card, hidden = false) {
  if (hidden || !card) return `<div class="card hidden-card">?</div>`;
  const red = card.suit === "♥" || card.suit === "♦";
  return `
    <div class="card ${red ? "red" : ""}">
      <span>${card.rank}</span>
      <span>${card.suit}</span>
    </div>
  `;
}

function diceHtml(values, hidden = false, hiddenCount = 5) {
  if (hidden) {
    const count = Math.max(1, Number(hiddenCount || 5));
    return `<div class="dice-row">${Array.from({ length: count }).map(() => `<span class="die hidden-die">?</span>`).join("")}</div>`;
  }
  if (!values || values.length === 0) return `<span class="muted">No dice</span>`;
  return `<div class="dice-row">${values.map(v => `<span class="die ${Number(v) === 1 ? "wild-die" : ""}" title="${Number(v) === 1 ? "Wild: can count as any face" : `Face ${v}`}">${diceFaceIcon(v)}</span>`).join("")}</div>`;
}

function diceFaceIcon(face) {
  const icons = {
    1: "⚀",
    2: "⚁",
    3: "⚂",
    4: "⚃",
    5: "⚄",
    6: "⚅"
  };
  return icons[Number(face)] || "🎲";
}

function formatDiceBid(count, face) {
  return `${count} × <span class="inline-die">${diceFaceIcon(face)}</span>`;
}

function renderCards(container, cards, emptyText = "No cards yet") {
  if (!container) return;
  if (!cards || cards.length === 0) {
    container.innerHTML = `<p class="muted">${emptyText}</p>`;
    return;
  }
  container.innerHTML = cards.map(card => cardHtml(card)).join("");
}

function playerSeatPosition(index, count) {
  // Edge-focused positions so player cards do not cover center cards / bid panel.
  const layouts = {
    1: [[50, 92]],
    2: [[9, 52], [91, 52]],
    3: [[8, 67], [92, 67], [50, 5]],
    4: [[8, 45], [92, 45], [70, 90], [30, 90]],
    5: [[50, 5], [93, 38], [82, 86], [18, 86], [7, 38]],
    6: [[50, 5], [91, 32], [91, 70], [50, 92], [9, 70], [9, 32]],
    7: [[50, 5], [82, 18], [94, 50], [78, 86], [50, 94], [22, 86], [6, 50]],
    8: [[50, 5], [76, 14], [94, 38], [94, 66], [76, 88], [50, 94], [24, 88], [6, 50]],
    9: [[50, 5], [73, 11], [91, 29], [95, 55], [83, 82], [50, 94], [17, 82], [5, 55], [9, 29]],
    10: [[50, 5], [70, 10], [88, 25], [96, 48], [88, 74], [70, 90], [50, 96], [30, 90], [12, 74], [4, 48]]
  };

  const layout = layouts[Math.min(Math.max(count, 1), 10)];
  const [x, y] = layout[index % layout.length];
  return { x, y };
}

// ---------- Big Room ----------

function renderBigPlayer(player) {
  const me = player.id === latestBigState.myId;
  const canKick = isBigHost() && !me;

  return `
    <article class="list-player">
      ${chatBubbleHtml(player)}
      ${bankruptcyBadge(player)}
      <div class="player-row">
        <strong>
          ${player.name}${me ? "（you）" : ""}
          ${player.isBigHost ? " · Big Host" : ""}
        </strong>
        <span>${money(player.chips)}</span>
      </div>
      <div class="player-row">
        <span>${player.currentRoomName ? `In ${player.currentRoomName}` : "In lobby"}</span>
        <span>🎲 ${player.diceCount ?? 5}</span>
      </div>
      ${canKick ? `<button class="mini-kick-btn" data-kick-id="${player.id}">Kick from Big Room</button>` : ""}
    </article>
  `;
}

function gameTypeLabel(type) {
  if (type === "poker") return "Poker";
  if (type === "blackjack") return "Blackjack";
  if (type === "dice") return "Liar's Dice";
  if (type === "werewolf") return "Werewolf";
  if (type === "undercover") return "Who's Undercover";
  if (type === "drawing") return "Draw Guess";
  if (type === "twentyfour") return "24 Points";
  if (type === "regicide") return "Regicide";
  if (type === "gomoku") return "Gomoku";
  if (type === "connectfour") return "Connect Four";
  return type;
}

function gameTypeIcon(type) {
  if (type === "poker") return "♠";
  if (type === "blackjack") return "🃏";
  if (type === "dice") return "🎲";
  if (type === "werewolf") return "🐺";
  if (type === "undercover") return "🕵️";
  if (type === "drawing") return "🎨";
  if (type === "twentyfour") return "🧮";
  if (type === "regicide") return "👑";
  if (type === "gomoku") return "⚫";
  if (type === "connectfour") return "🔴";
  return "🎮";
}

function renderGameRoomCard(room) {
  const me = currentBigPlayer();
  const current = me?.currentGameType === room.type && me?.currentRoomId === room.id;

  let running = false;
  if (room.type === "poker") running = room.phase !== "waiting" && room.phase !== "showdown";
  if (room.type === "blackjack") running = room.phase === "playerTurns" || room.phase === "dealerTurn";
  if (room.type === "dice") running = room.phase === "bidding";
  if (room.type === "werewolf") running = room.phase !== "waiting" && room.phase !== "gameEnd";
  if (room.type === "undercover") running = room.phase !== "waiting" && room.phase !== "gameEnd";
  if (room.type === "drawing") running = room.phase !== "waiting" && room.phase !== "gallery";
  if (room.type === "twentyfour") running = room.phase === "playing";
  if (room.type === "regicide") running = ["playing", "defending", "chooseNext"].includes(room.phase);
  if (room.type === "gomoku") running = room.phase === "playing";
  if (room.type === "connectfour") running = room.phase === "playing";

  return `
    <article class="room-card ${current ? "current-room" : ""}">
      <div>
        <h3>${gameTypeIcon(room.type)} ${room.name}</h3>
        <p class="muted">
          ${gameTypeLabel(room.type)} · ${room.playerCount}/${room.maxPlayers} players · Phase: ${room.phase}
          ${room.hostName ? ` · Host: ${room.hostName}` : ""}
        </p>
      </div>
      <button
        data-join-type="${room.type}"
        data-join-id="${room.id}"
        ${running && !current ? "disabled" : ""}
      >
        ${current ? "Entered" : running ? "In round" : "Enter"}
      </button>
    </article>
  `;
}

function renderBigState(state) {
  latestBigState = state;

  const host = state.players.find(p => p.id === state.hostId);
  bigRoomCodeEl.textContent = state.code;
  bigHostLineEl.textContent = `Big room host: ${host?.name || "none"} · ${isBigHost() ? "You can kick players." : "Only big room host can kick players."}`;

  updateChipLabels();
  updateDiceBankButtons();

  const rooms = state.gameRooms || [
    ...(state.pokerRooms || []),
    ...(state.blackjackRooms || []),
    ...(state.diceRooms || [])
  ];

  gameRoomListEl.innerHTML = rooms.length
    ? rooms.map(renderGameRoomCard).join("")
    : `<p class="muted">No game rooms yet. Create one to start.</p>`;

  bigPlayerListEl.innerHTML = state.players.map(renderBigPlayer).join("");
  bigLogEl.innerHTML = state.log.map(item => `<p>${item}</p>`).join("");
  renderChat(bigChatEl, state.chat);

  const me = currentBigPlayer();
  if (!me?.currentRoomId && !latestPokerState && !latestBlackjackState && !latestDiceState && !latestGomokuState && !latestConnectFourState) {
    showScreen("lobby");
  }
}

// ---------- Poker ----------

function renderPokerSeat(player, index, count, state) {
  const revealed = state.revealedHands?.[player.id];
  const isMe = player.id === state.myId;
  const canKick = latestBigState?.hostId === state.myId && !isMe;
  const betHtml = player.bet > 0 ? `<div class="bet-bubble">${money(player.bet)}</div>` : "";

  const cardsHtml = revealed
    ? `<div class="seat-showdown-cards">${revealed.hand.map(card => cardHtml(card)).join("")}</div>`
    : `<div class="seat-card-count">${player.cardsCount || 0} cards</div>`;

  return `
    <article class="seat sidebar-seat poker-sidebar-seat ${player.folded ? "folded" : ""} ${state.winners?.some(w => w.id === player.id) ? "winner-seat" : ""} ${player.isTurn ? "turn" : ""} ${isMe ? "me" : ""}">
      ${chatBubbleHtml(player)}
      ${bankruptcyBadge(player)}
      ${betHtml}
      <div class="avatar">${player.name.slice(0, 1).toUpperCase()}</div>
      <div class="seat-name"><strong>${player.name}${isMe ? "（you）" : ""}</strong></div>
      <div class="seat-meta">
        <span>${money(player.chips)}</span>
        ${player.isBigHost ? `<span>Big Host</span>` : ""}
        ${player.isPokerHost ? `<span>Poker Host</span>` : ""}
        ${player.isDealer ? `<span>D</span>` : ""}
        ${player.isLastWinner ? `<span>Last win</span>` : ""}
      </div>
      <div class="seat-status">
        ${player.folded ? `<span class="badge">Folded</span>` : ""}
        ${player.allIn ? `<span class="badge">All-in</span>` : ""}
        ${player.isTurn ? `<span class="badge hot">Turn</span>` : ""}
      </div>
      ${cardsHtml}
      ${revealed ? `<p class="hand-name">${revealed.handName}</p>` : ""}
      ${canKick ? `<button class="kick-btn" data-kick-id="${player.id}">Kick</button>` : ""}
    </article>
  `;
}

function renderPokerPlayerList(player, state) {
  const isMe = player.id === state.myId;
  const canKick = state.bigHostId === state.myId && !isMe;
  return `
    <article class="list-player ${player.folded ? "folded" : ""}">
      <div class="player-row">
        <strong>
          ${player.name}${isMe ? "（you）" : ""}
          ${player.isBigHost ? " · Big Host" : ""}
          ${player.isPokerHost ? " · Poker Host" : ""}
          ${player.isDealer ? " · D" : ""}
        </strong>
        <span>${player.connected ? "online" : "offline"}</span>
      </div>
      <div class="player-row">
        <span>Chips: ${player.chips}</span>
        <span>Bet: ${player.bet}</span>
      </div>
      ${canKick ? `<button class="mini-kick-btn" data-kick-id="${player.id}">Kick from Big Room</button>` : ""}
    </article>
  `;
}

function updateRaiseSlider(state, myPlayer, isMyTurn) {
  const toCall = Math.max(0, state.currentBet - (myPlayer?.bet || 0));
  const maxRaise = Math.max(0, (myPlayer?.chips || 0) - toCall);
  const minRaise = state.bigBlind;

  raiseSlider.min = String(minRaise);
  raiseSlider.max = String(Math.max(minRaise, Math.floor(maxRaise / 10) * 10 || minRaise));
  raiseSlider.step = "10";

  const currentValue = Number(raiseSlider.value || minRaise);
  const safeValue = Math.min(Math.max(currentValue, minRaise), Number(raiseSlider.max));
  raiseSlider.value = String(safeValue);
  raiseValue.textContent = safeValue;

  const canRaise = isMyTurn && maxRaise >= minRaise;
  raiseSlider.disabled = !canRaise;
  raiseBtn.disabled = !canRaise;
}

function renderPokerState(state) {
  latestPokerState = state;
  if (!state) {
    latestPokerState = null;
    setVoiceContext(null, null);
    showScreen("lobby");
    return;
  }
  setVoiceContext("poker", state);

  latestBlackjackState = null;
  latestDiceState = null;
  showScreen("poker");
  updateChipLabels();

  const mySeat = state.players.find(p => p.id === state.myId);
  const pokerHost = state.players.find(p => p.id === state.pokerHostId);
  const turnPlayer = state.players.find(p => p.id === state.turnPlayerId);
  const isPokerHost = state.pokerHostId === state.myId;
  const isMyTurn = state.turnPlayerId === state.myId;
  const isRunning = ["preflop", "flop", "turn", "river"].includes(state.phase);
  const toCall = Math.max(0, state.currentBet - (mySeat?.bet || 0));

  pokerRoomTitleEl.textContent = state.name;
  pokerHostLineEl.textContent = `Poker room host: ${pokerHost?.name || "none"} · First player in this Poker Room can start.`;
  phaseEl.textContent = state.phase;
  potEl.textContent = state.pot;
  currentBetEl.textContent = state.currentBet;

  renderCards(communityEl, state.community, "Community cards appear here.");
  renderCards(myHandEl, state.myHand, "Your cards appear when a hand starts.");

  const hasLeftCard = Boolean(state.myHand?.[0]);
  const hasRightCard = Boolean(state.myHand?.[1]);
  showLeftCardBtn.disabled = !hasLeftCard;
  showRightCardBtn.disabled = !hasRightCard;
  showBothCardsBtn.disabled = !(hasLeftCard || hasRightCard);

  seatsEl.innerHTML = state.players.map((player, index) => renderPokerSeat(player, index, state.players.length, state)).join("");
  playersListEl.innerHTML = state.players.map(player => renderPokerPlayerList(player, state)).join("");
  pokerLogEl.innerHTML = state.log.map(item => `<p>${item}</p>`).join("");
  renderChat(pokerChatEl, state.chat);

  turnHintEl.textContent = isRunning
    ? (isMyTurn ? `Your turn. ${toCall > 0 ? `Call amount: ${toCall}.` : "You can check."}` : `Waiting for ${turnPlayer?.name || "another player"}...`)
    : (isPokerHost ? "You are the poker room host. Start a hand when at least 2 players are ready." : "Waiting for the poker room host to start.");

  startBtn.disabled = !isPokerHost || isRunning || state.players.length < 2;
  startBtn.textContent = isPokerHost ? "Start / Next Hand" : "Only Poker Host Can Start";
  foldBtn.disabled = !isMyTurn;
  checkBtn.disabled = !isMyTurn || toCall !== 0;
  callBtn.disabled = !isMyTurn || toCall === 0;
  callBtn.textContent = toCall > 0 ? `Call ${toCall}` : "Call";

  updateRaiseSlider(state, mySeat, isMyTurn);

  if (state.winners?.length) {
    winnerBox.classList.remove("hidden");
    winnerBox.innerHTML = `
      <strong>Winner${state.winners.length > 1 ? "s" : ""}</strong>
      <p>${state.winners.map(w => `${w.name} — ${w.handName} +${money(w.amount)}`).join("<br>")}</p>
    `;
  } else {
    winnerBox.classList.add("hidden");
    winnerBox.innerHTML = "";
  }
}

// ---------- Blackjack ----------

function blackjackBubble(player) {
  if (player.isDealer) return `<div class="bet-bubble status-bubble dealer-bubble">DEALER</div>`;
  if (player.isTurn) return `<div class="bet-bubble status-bubble turn-bubble">TURN</div>`;
  if (player.status === "stand") return `<div class="bet-bubble status-bubble stand-bubble">STAND</div>`;
  if (player.status === "bust") return `<div class="bet-bubble status-bubble bust-bubble">BUST</div>`;
  if (player.result === "won") return `<div class="bet-bubble status-bubble win-bubble">WIN</div>`;
  if (player.result === "lost") return `<div class="bet-bubble status-bubble bust-bubble">LOST</div>`;
  if (player.result === "push") return `<div class="bet-bubble status-bubble push-bubble">PUSH</div>`;
  if (player.bet > 0) return `<div class="bet-bubble">${money(player.bet)}</div>`;
  return "";
}

function renderBlackjackSeat(player, index, count, state) {
  const isMe = player.id === state.myId;
  const canKick = state.bigHostId === state.myId && !isMe;
  const statusBubble = blackjackBubble(player);
  const bust = player.status === "bust" || player.result === "lost";

  return `
    <article class="seat sidebar-seat blackjack-seat ${bust ? "folded" : ""} ${player.result === "won" ? "winner-seat" : ""} ${player.isTurn ? "turn" : ""} ${isMe ? "me" : ""}">
      ${chatBubbleHtml(player)}
      ${bankruptcyBadge(player)}
      ${statusBubble}
      <div class="avatar bj-avatar">${player.name.slice(0, 1).toUpperCase()}</div>
      <div class="seat-name"><strong>${player.name}${isMe ? "（you）" : ""}</strong></div>
      <div class="seat-meta">
        <span>${money(player.chips)}</span>
        <span>Total ${player.total}</span>
        ${player.isDealer ? `<span>Dealer</span>` : ""}
        ${player.isBlackjackHost ? `<span>BJ Host</span>` : ""}
        ${player.isTurn ? `<span>Turn</span>` : ""}
      </div>
      <div class="seat-status">
        <span class="badge ${player.result === "won" ? "win-badge" : ""}">${player.result || player.status}</span>
      </div>
      <div class="seat-cards blackjack-seat-cards">${player.hand.map(c => cardHtml(c)).join("") || cardHtml(null, true)}</div>
      ${canKick ? `<button class="kick-btn" data-kick-id="${player.id}">Kick</button>` : ""}
    </article>
  `;
}

function renderBjPlayer(player, state) {
  const isMe = player.id === state.myId;
  const canKick = state.bigHostId === state.myId && !isMe;
  return `
    <article class="list-player ${player.status === "bust" ? "folded" : ""}">
      ${chatBubbleHtml(player)}
      ${bankruptcyBadge(player)}
      <div class="player-row">
        <strong>
          ${player.name}${isMe ? "（you）" : ""}
          ${player.isBigHost ? " · Big Host" : ""}
          ${player.isBlackjackHost ? " · BJ Host" : ""}
          ${player.isTurn ? " · Turn" : ""}
        </strong>
        <span>${money(player.chips)}</span>
      </div>
      <div class="player-row">
        <span>Total: ${player.total}</span>
        <span>Bet: ${player.bet}</span>
      </div>
      <div class="cards small-cards">${player.hand.map(c => cardHtml(c)).join("") || `<span class="muted">No hand</span>`}</div>
      <p class="muted">Status: ${player.status}${player.result ? ` · ${player.result}` : ""}</p>
      ${canKick ? `<button class="mini-kick-btn" data-kick-id="${player.id}">Kick from Big Room</button>` : ""}
    </article>
  `;
}

function renderBlackjackState(state) {
  latestBlackjackState = state;
  if (!state) {
    latestBlackjackState = null;
    setVoiceContext(null, null);
    showScreen("lobby");
    return;
  }
  setVoiceContext("blackjack", state);

  latestPokerState = null;
  latestDiceState = null;
  latestWerewolfState = null;
  latestUndercoverState = null;
  showScreen("blackjack");
  updateChipLabels();

  const host = state.players.find(p => p.id === state.hostId);
  const dealer = state.players.find(p => p.isDealer);
  const myPlayer = state.players.find(p => p.id === state.myId);
  const isHost = state.hostId === state.myId;
  const isDealer = myPlayer?.isDealer;
  const isMyTurn = myPlayer?.isTurn;
  const playerTurnPhase = state.phase === "playerTurns";
  const dealerTurnPhase = state.phase === "dealerTurn";
  const running = playerTurnPhase || dealerTurnPhase;
  const betting = state.phase === "betting";
  const dealerCardCount = dealer?.hand?.filter(Boolean).length || state.dealerHand?.filter(Boolean).length || 0;
  const dealerCanHit = dealerTurnPhase && isDealer && isMyTurn && Number(state.dealerTotal || 0) < 17 && dealerCardCount < 5;
  const dealerCanStand = dealerTurnPhase && isDealer && isMyTurn && Number(state.dealerTotal || 0) >= 17;
  const minBet = state.minBet || 10;
  const step = state.betStep || 10;
  const maxBet = Math.max(minBet, currentBigPlayer()?.chips || myPlayer?.chips || minBet);

  bjSelectedBet = Math.min(Math.max(bjSelectedBet, minBet), maxBet);
  bjSelectedBet = Math.floor(bjSelectedBet / step) * step;
  bjBetValueEl.textContent = bjSelectedBet;

  bjRoomTitleEl.textContent = state.name;
  bjHostLineEl.textContent = `Room host: ${host?.name || "none"} · Current dealer: ${dealer?.name || "none"} · Players bet against the rotating dealer.`;
  bjPhaseEl.textContent = state.phase;
  bjBetEl.textContent = betting ? "choose" : (myPlayer?.bet || state.bet || 0);
  bjDealerTotalEl.textContent = state.dealerHoleHidden ? `${state.dealerTotal}+?` : state.dealerTotal;
  renderCards(bjDealerHandEl, state.dealerHand, "Dealer cards appear here.");
  renderCards(bjMyHandEl, myPlayer?.hand || [], "Your cards appear here.");

  bjSeatsEl.innerHTML = state.players.map((player, index) => renderBlackjackSeat(player, index, state.players.length, state)).join("");

  bjStartBtn.disabled = !isHost || (state.phase !== "waiting" && state.phase !== "roundEnd");
  bjStartBtn.textContent = "Open Betting";
  bjBetMinusBtn.disabled = !betting || isDealer || bjSelectedBet <= minBet;
  bjBetPlusBtn.disabled = !betting || isDealer || bjSelectedBet + step > maxBet;
  bjPlaceBetBtn.disabled = !betting || !myPlayer || myPlayer.status !== "betting" || myPlayer.isDealer;

  bjHitBtn.disabled = playerTurnPhase
    ? !isMyTurn || isDealer
    : !dealerCanHit;
  bjStandBtn.disabled = playerTurnPhase
    ? !isMyTurn || isDealer
    : !dealerCanStand;
  bjDoubleBtn.disabled = !playerTurnPhase || !isMyTurn || isDealer || !myPlayer?.canDouble;
  bjInsuranceBtn.disabled = !playerTurnPhase || !isMyTurn || isDealer || !myPlayer?.canInsurance;

  bjHintEl.textContent = betting
    ? (myPlayer?.isDealer ? "You are the dealer this round. Cards will deal automatically after all players bet." : (myPlayer?.status === "betPlaced" ? `Your bet is ${money(myPlayer.bet)}. Waiting for everyone else to bet; cards will deal automatically.` : "Choose your bet and click Place Bet."))
    : dealerTurnPhase
      ? (isDealer
        ? (dealerCanHit ? `Dealer turn. Total ${state.dealerTotal}: Hit is required until 17. Five cards without busting wins for dealer.` : `Dealer turn. Total ${state.dealerTotal}: Stand to finish the round.`)
        : "Waiting for dealer to Hit or Stand...")
      : playerTurnPhase
        ? (isMyTurn ? `Your turn. Your total is ${myPlayer?.total}.` : "Waiting for another player...")
        : (isHost ? "Open betting to start a Blackjack round." : "Waiting for Blackjack host to open betting.");

  bjPlayerListEl.innerHTML = state.players.map(player => renderBjPlayer(player, state)).join("");
  bjLogEl.innerHTML = state.log.map(item => `<p>${item}</p>`).join("");
  renderChat(bjChatEl, state.chat);

  if (state.results?.length) {
    bjResultsEl.classList.remove("hidden");
    bjResultsEl.innerHTML = `
      <strong>Round Results</strong>
      <p>${state.results.map(r => `${r.name}: ${r.result}, total ${r.total}, bet ${money(r.bet)}, payout ${money(r.payout + (r.insurancePayout || 0))}`).join("<br>")}</p>
    `;
  } else {
    bjResultsEl.classList.add("hidden");
    bjResultsEl.innerHTML = "";
  }
}

// ---------- Liar's Dice ----------

function isDiceBidLegal(state, count = diceBidCount, face = diceBidFace) {
  count = Number(count);
  face = Number(face);

  if (!Number.isInteger(count) || !Number.isInteger(face)) return false;
  if (count < 1 || face < 1 || face > 6) return false;
  if (!state?.currentBid) return true;

  return count > state.currentBid.count ||
    (count === state.currentBid.count && face > state.currentBid.face);
}

function syncDiceControls(state) {
  const key = state.currentBid ? `${state.currentBid.count}-${state.currentBid.face}-${state.currentBid.bidderId}` : "none";
  if (key !== lastDiceBidKey) {
    if (!state.currentBid) {
      diceBidCount = 1;
      diceBidFace = 1;
    } else if (state.currentBid.face < 6) {
      diceBidCount = state.currentBid.count;
      diceBidFace = state.currentBid.face + 1;
    } else {
      diceBidCount = state.currentBid.count + 1;
      diceBidFace = 1;
    }
    lastDiceBidKey = key;
  }

  diceBidCount = Math.max(1, diceBidCount);
  diceBidFace = Math.min(6, Math.max(1, diceBidFace));
  diceCountValueEl.textContent = diceBidCount;
  diceFaceValueEl.innerHTML = diceFaceIcon(diceBidFace);
}

function updateDiceControlButtons(state) {
  const running = state.phase === "bidding";
  const isMyTurn = state.turnPlayerId === state.myId;
  const myPlayer = state.players.find(p => p.id === state.myId);
  const minimum = state.diceExchangeMinimum ?? 5;
  const cashValue = state.diceCashValue ?? 50;

  const canDecreaseCount = diceBidCount > 1 && isDiceBidLegal(state, diceBidCount - 1, diceBidFace);
  const canDecreaseFace = diceBidFace > 1 && isDiceBidLegal(state, diceBidCount, diceBidFace - 1);

  diceCountMinusBtn.disabled = !running || !isMyTurn || !canDecreaseCount;
  diceCountPlusBtn.disabled = !running || !isMyTurn;
  diceFaceMinusBtn.disabled = !running || !isMyTurn || !canDecreaseFace;
  diceFacePlusBtn.disabled = !running || !isMyTurn || diceBidFace >= 6;

  diceBidBtn.disabled = !running || !isMyTurn || !isDiceBidLegal(state);
  diceSpotOnBtn.disabled = !running || !isMyTurn || !state.currentBid;
  diceChallengeBtn.disabled = !running || !isMyTurn || !state.currentBid;

}


function diceRevealKey(state) {
  if (!state?.lastReveal) return null;
  const reveal = state.lastReveal;
  return [
    reveal.mode,
    reveal.bid?.count,
    reveal.bid?.face,
    reveal.actual,
    reveal.challengerId,
    reveal.winnerId,
    reveal.loserId,
    state.phase
  ].join("|");
}

function startDiceRevealAnimation(state) {
  const key = diceRevealKey(state);
  if (!key) {
    if (diceRevealAnimation.timer) clearInterval(diceRevealAnimation.timer);
    diceRevealAnimation = { key: null, step: 0, timer: null };
    return;
  }

  if (diceRevealAnimation.key === key) return;

  if (diceRevealAnimation.timer) clearInterval(diceRevealAnimation.timer);

  const total = state.lastReveal?.allDice?.length || 0;
  diceRevealAnimation = { key, step: 0, timer: null };

  diceRevealAnimation.timer = setInterval(() => {
    diceRevealAnimation.step += 1;
    if (diceRevealAnimation.step >= total) {
      clearInterval(diceRevealAnimation.timer);
      diceRevealAnimation.timer = null;
    }
    if (latestDiceState) renderDiceState(latestDiceState);
  }, 1000);
}

function revealedDicePlayerIds(state) {
  if (!state?.lastReveal) return new Set();
  const all = state.lastReveal.allDice || [];
  const step = Math.min(diceRevealAnimation.step, all.length);
  return new Set(all.slice(0, step).map(item => item.id));
}

function diceFromReveal(state, playerId) {
  return state?.lastReveal?.allDice?.find(item => item.id === playerId)?.dice || [];
}

function shouldShowDiceForPlayer(state, player) {
  if (!state?.lastReveal) return Boolean(player.dice?.length);
  if (player.id === state.myId) return true;
  return revealedDicePlayerIds(state).has(player.id);
}

function diceWildMatchCount(dice, face) {
  return (dice || []).filter(value => Number(value) === Number(face) || (Number(face) !== 1 && Number(value) === 1)).length;
}

function revealedWildCount(state) {
  if (!state?.lastReveal?.bid) return 0;
  const revealed = revealedDicePlayerIds(state);
  return (state.lastReveal.allDice || [])
    .filter(item => revealed.has(item.id))
    .reduce((sum, item) => sum + diceWildMatchCount(item.dice, state.lastReveal.bid.face), 0);
}

function diceRevealCenterHtml(state) {
  if (!state?.lastReveal) return "";

  const reveal = state.lastReveal;
  const totalPlayers = reveal.allDice?.length || 0;
  const shownPlayers = Math.min(diceRevealAnimation.step, totalPlayers);
  const currentCount = revealedWildCount(state);
  const bidText = formatDiceBid(reveal.bid.count, reveal.bid.face);
  const modeTitle = reveal.mode === "spotOn" ? "SPOT ON!" : "Challenge Reveal";

  return `
    <div class="${reveal.mode === "spotOn" ? "spoton-splash" : "reveal-splash"}">${modeTitle}</div>
    <p>Bid: ${bidText}</p>
    <p>Revealed players: ${shownPlayers}/${totalPlayers}</p>
    <p>Current wild count: <strong>${currentCount}</strong></p>
    ${shownPlayers >= totalPlayers ? `
      <p>Final actual: <strong>${reveal.actual}</strong></p>
      <p>${reveal.transferSummary || ""}</p>
      ${state.gameWinnerName ? `<p><strong>${state.gameWinnerName} wins the game.</strong></p>` : ""}
    ` : ""}
  `;
}

function renderDiceSeat(player, index, count, state) {
  const isMe = player.id === state.myId;
  const canKick = state.bigHostId === state.myId && !isMe;
  const isBidder = state.currentBid?.bidderId === player.id || state.lastReveal?.bidderId === player.id;
  const bid = state.currentBid || state.lastReveal?.bid;
  const bidHtml = isBidder && bid ? `<div class="bet-bubble dice-bet">${formatDiceBid(bid.count, bid.face)}</div>` : "";
  const showDice = shouldShowDiceForPlayer(state, player);
  const diceValues = state.lastReveal ? diceFromReveal(state, player.id) : player.dice;
  const diceContent = showDice ? diceHtml(diceValues) : diceHtml([], true, player.diceCount);

  return `
    <article class="seat sidebar-seat dice-seat ${!player.active ? "folded" : ""} ${state.lastReveal?.loserId === player.id ? "shake-seat" : ""} ${state.lastReveal?.winnerId === player.id || state.gameWinnerId === player.id ? "winner-seat" : ""} ${player.isTurn ? "turn" : ""} ${isMe ? "me" : ""}">
      ${chatBubbleHtml(player)}
      ${bankruptcyBadge(player)}
      ${bidHtml}
      <div class="avatar dice-avatar">${player.name.slice(0, 1).toUpperCase()}</div>
      <div class="seat-name"><strong>${player.name}${isMe ? "（you）" : ""}</strong></div>
      <div class="seat-meta">
        <span>${money(player.chips)}</span>
        <span>🎲 ${player.diceCount}</span>
        ${player.isDiceHost ? `<span>Dice Host</span>` : ""}
        ${player.isTurn ? `<span>Turn</span>` : ""}
        ${Number(player.diceCount) > 5 ? `<span>Extra +${Number(player.diceCount) - 5}</span>` : ""}
      </div>
      <div class="seat-card-count">${player.diceCount} dice total</div>
      <div class="seat-dice">${diceContent}</div>
      ${canKick ? `<button class="kick-btn" data-kick-id="${player.id}">Kick</button>` : ""}
    </article>
  `;
}

function renderDicePlayer(player, state) {
  const isMe = player.id === state.myId;
  const canKick = state.bigHostId === state.myId && !isMe;
  const showDice = shouldShowDiceForPlayer(state, player);
  const diceValues = state.lastReveal ? diceFromReveal(state, player.id) : player.dice;
  const diceContent = showDice ? diceHtml(diceValues) : diceHtml([], true, player.diceCount);

  return `
    <article class="list-player ${!player.active ? "folded" : ""}">
      ${chatBubbleHtml(player)}
      <div class="player-row">
        <strong>
          ${player.name}${isMe ? "（you）" : ""}
          ${player.isBigHost ? " · Big Host" : ""}
          ${player.isDiceHost ? " · Dice Host" : ""}
          ${player.isTurn ? " · Turn" : ""}
        </strong>
        <span>${player.diceCount} dice</span>
      </div>
      ${diceContent}
      ${canKick ? `<button class="mini-kick-btn" data-kick-id="${player.id}">Kick from Big Room</button>` : ""}
    </article>
  `;
}

function renderDiceState(state) {
  latestDiceState = state;
  if (!state) {
    latestDiceState = null;
    setVoiceContext(null, null);
    showScreen("lobby");
    return;
  }
  setVoiceContext("dice", state);

  latestPokerState = null;
  latestBlackjackState = null;
  showScreen("dice");
  updateChipLabels();
  syncDiceControls(state);
  startDiceRevealAnimation(state);

  const host = state.players.find(p => p.id === state.hostId);
  const turnPlayer = state.players.find(p => p.id === state.turnPlayerId);
  const myPlayer = state.players.find(p => p.id === state.myId);
  const isHost = state.hostId === state.myId;
  const isMyTurn = state.turnPlayerId === state.myId;
  const running = state.phase === "bidding";

  diceRoomTitleEl.textContent = state.name;
  diceHostLineEl.textContent = `Liar's Dice host: ${host?.name || "none"} · ⚀ is wild and can count as any face.`;
  dicePhaseEl.textContent = state.phase;
  diceCurrentBidEl.innerHTML = state.currentBid ? formatDiceBid(state.currentBid.count, state.currentBid.face) : "none";
  diceTurnEl.textContent = turnPlayer?.name || "none";
  diceCenterBidEl.innerHTML = `
    <div class="current-bid-stack">
      <div>${state.currentBid ? formatDiceBid(state.currentBid.count, state.currentBid.face) : "none"}</div>
      <div class="your-dice-center"><span>Your Dice</span>${diceHtml(myPlayer?.dice || [], false)}</div>
    </div>
  `;

  diceSeatsEl.innerHTML = state.players.map((player, index) => renderDiceSeat(player, index, state.players.length, state)).join("");

  diceStartBtn.disabled = !isHost || running || state.phase === "gameEnd";
  updateDiceControlButtons(state);

  diceHintEl.textContent = running
    ? (isMyTurn ? "Your turn: raise the bid, call Spot On, or Challenge. ⚀ is wild." : `Waiting for ${turnPlayer?.name || "another player"}...`)
    : (state.phase === "gameEnd"
      ? `${state.gameWinnerName || "Someone"} wins the game. Extra dice can be exchanged now.`
      : (isHost ? "Start / roll a Liar's Dice round." : "Waiting for Liar's Dice host to start."));

  if (state.lastReveal) {
    diceRevealEl.classList.remove("hidden");
    diceRevealEl.innerHTML = diceRevealCenterHtml(state);
  } else {
    diceRevealEl.classList.add("hidden");
    diceRevealEl.innerHTML = "";
  }

  dicePlayerListEl.innerHTML = state.players.map(player => renderDicePlayer(player, state)).join("");
  diceLogEl.innerHTML = state.log.map(item => `<p>${item}</p>`).join("");
  renderChat(diceChatEl, state.chat);
}


// ---------- Social games: Werewolf + Who's Undercover ----------

function canCurrentPlayerVote(state, currentPlayer, targetPlayer, type) {
  if (!currentPlayer || !targetPlayer) return false;
  if (!currentPlayer.alive || !targetPlayer.alive) return false;
  if (currentPlayer.id === targetPlayer.id) return false;

  if (type === "ww") {
    if (state.phase !== "day") return false;
    if (state.voteCandidates && !state.voteCandidates.includes(targetPlayer.id)) return false;
    return true;
  }

  if (type === "uc") return state.phase === "discussion" || state.phase === "voting";
  return false;
}

function werewolfCardAction(player, state, currentPlayer) {
  if (!currentPlayer?.alive || !player.alive || state.phase === "gameEnd") return "";

  if (state.phase === "night-wolves" && currentPlayer.role === "Werewolf") {
    return `<button class="vote-above-head kill-action" data-ww-kill="${player.id}">Kill</button>`;
  }

  if (state.phase === "night-seer" && currentPlayer.role === "Seer") {
    return `<button class="vote-above-head seer-action" data-ww-seer="${player.id}">Check</button>`;
  }

  if (
    state.phase === "night-witch-save" &&
    currentPlayer.role === "Witch" &&
    state.witchInfo?.canSave &&
    player.id === state.witchInfo.pendingKillId
  ) {
    return `<button class="vote-above-head save-action" data-ww-witch-save="1">Save</button>`;
  }

  if (
    state.phase === "night-witch-poison" &&
    currentPlayer.role === "Witch" &&
    state.witchInfo?.canPoison &&
    player.canBePoisoned
  ) {
    return `<button class="vote-above-head poison-action" data-ww-poison="${player.id}">Poison</button>`;
  }

  if (state.phase === "hunter" && state.hunterPendingId === state.myId && player.id !== state.myId) {
    return `<button class="vote-above-head hunter-action" data-ww-shoot="${player.id}">Shoot</button>`;
  }

  if (canCurrentPlayerVote(state, currentPlayer, player, "ww")) {
    return `<button class="vote-above-head" data-ww-vote="${player.id}">Vote</button>`;
  }

  return "";
}


function renderSocialPlayerCard(player, state, type) {
  const isMe = player.id === state.myId;
  const isHost = state.hostId === state.myId;
  const currentPlayer = state.players.find(p => p.id === state.myId);
  const roleLine = player.role ? `<span class="role-pill ${player.roleAura === "wolf" ? "role-wolf" : player.roleAura === "good" ? "role-good" : ""}">${escapeHtml(player.role)}</span>` : "";
  const wordLine = player.word ? `<span>Word: ${escapeHtml(player.word)}</span>` : "";
  const voteCount = player.votes || 0;
  const canVote = canCurrentPlayerVote(state, currentPlayer, player, type);
  const wwAction = type === "ww" ? werewolfCardAction(player, state, currentPlayer) : "";
  const normalVote = type !== "ww" && canVote ? `<button class="vote-above-head" data-${type}-vote="${player.id}">Vote</button>` : "";
  const actionLabel = player.actionLabel ? `<div class="action-label-bubble">${escapeHtml(player.actionLabel)}</div>` : "";
  const auraClass = type === "ww" && player.roleAura === "wolf"
    ? "known-wolf-card"
    : type === "ww" && player.roleAura === "good"
      ? "known-good-card"
      : "";
  const pendingClass = type === "ww" && player.isPendingWitchSaveTarget
    ? "witch-save-target"
    : type === "ww" && player.isUnrescuedWolfTargetForWitch
      ? "unrescued-wolf-target"
      : "";

  return `
    <article class="social-player-card ${!player.alive ? "dead-player folded" : ""} ${auraClass} ${pendingClass} ${isMe ? "me" : ""}">
      ${chatBubbleHtml(player)}
      ${bankruptcyBadge(player)}
      ${wwAction || normalVote}
      ${actionLabel}
      <div class="avatar">${escapeHtml(player.name.slice(0, 1).toUpperCase())}</div>
      <h3>${escapeHtml(player.name)}${isMe ? "（you）" : ""}</h3>
      <div class="seat-meta">
        ${player.isHost ? `<span>Host</span>` : ""}
        ${roleLine}
        ${wordLine}
        <span>${player.alive ? "Alive" : "Dead"}</span>
        ${player.deathReason ? `<span>${escapeHtml(player.deathReason)}</span>` : ""}
        <span>Votes ${voteCount}</span>
      </div>
      ${type !== "ww" && isHost && state.phase !== "waiting" && state.phase !== "gameEnd" && player.alive
        ? `<button class="mini-kick-btn" data-${type}-eliminate="${player.id}">Eliminate</button>`
        : ""}
    </article>
  `;
}


function werewolfPhaseText(state, me) {
  if (state.phase === "waiting") return "Need at least 6 players to start.";
  if (state.phase === "night-wolves") {
    return me?.role === "Werewolf"
      ? "Werewolf phase: all wolves must choose the same kill target. You may target yourself or another wolf."
      : "Night: werewolves are choosing a target.";
  }
  if (state.phase === "night-seer") {
    const result = state.seerResult ? `Result: ${state.seerResult.targetName} is ${state.seerResult.role}.` : "";
    return me?.role === "Seer" ? `Seer phase: check one player's role. ${result}` : "Night: Seer is checking someone.";
  }
  if (state.phase === "night-witch-save") {
    if (me?.role !== "Witch") return "Night: Witch is deciding whether to save.";
    const killed = state.witchInfo?.pendingKillName ? `${state.witchInfo.pendingKillName} was attacked.` : "Nobody was attacked.";
    return `Witch save phase: ${killed} The attacked card is flashing red.`;
  }
  if (state.phase === "night-witch-poison") {
    if (me?.role !== "Witch") return "Night: Witch is deciding whether to poison.";
    return "Witch poison phase: choose one alive player to poison, or skip.";
  }
  if (state.phase === "night-transition") {
    return "Night continues...";
  }
  if (state.phase === "hunter") {
    return state.hunterPendingId === state.myId
      ? "You are the dying Hunter. Shoot someone or skip."
      : `${state.hunterPendingName || "Hunter"} may shoot someone.`;
  }
  if (state.phase === "day") {
    return me?.alive
      ? `Day voting is open. ${state.voteRound === 2 ? "Revote tied players only. " : ""}Vote buttons are above player cards, or abstain.`
      : "You are dead. Watch the vote.";
  }
  return state.result || "";
}


function renderWerewolfState(state) {
  latestWerewolfState = state;
  if (!state) {
    latestWerewolfState = null;
    setVoiceContext(null, null);
    showScreen("lobby");
    return;
  }
  setVoiceContext("werewolf", state);

  latestPokerState = null;
  latestBlackjackState = null;
  latestDiceState = null;
  latestUndercoverState = null;
  latestDrawingState = null;
  showScreen("werewolf");

  const host = state.players.find(p => p.id === state.hostId);
  const me = state.players.find(p => p.id === state.myId);
  const isHost = state.hostId === state.myId;

  wwRoomTitleEl.textContent = state.name;
  wwHostLineEl.textContent = `Werewolf host: ${host?.name || "none"} · Automatic night: wolves → seer → witch → day vote.`;
  wwPhaseEl.textContent = state.phase;
  wwRoundEl.textContent = state.roundNumber || 0;
  wwRoleEl.textContent = me?.role || "?";

  wwStartBtn.disabled = !isHost || (state.phase !== "waiting" && state.phase !== "gameEnd") || state.players.length < 6;
  wwNextPhaseBtn.disabled = true;
  wwNextPhaseBtn.textContent = "Auto Phases";

  wwPlayerGridEl.innerHTML = state.players.map(p => renderSocialPlayerCard(p, state, "ww")).join("");

  const witchControls = state.phase === "night-witch-save" && me?.role === "Witch"
    ? `<div class="inline-action-row"><button class="ghost" data-ww-witch-save-skip="1">Do Not Save</button></div>`
    : state.phase === "night-witch-poison" && me?.role === "Witch"
      ? `<div class="inline-action-row"><button class="ghost" data-ww-witch-poison-skip="1">Skip Poison</button></div>`
      : "";

  const hunterControls = state.phase === "hunter" && state.hunterPendingId === state.myId
    ? `<div class="inline-action-row"><button class="ghost" data-ww-hunter-skip="1">Skip Shot</button></div>`
    : "";

  const abstainControl = state.phase === "day" && me?.alive
    ? `<div class="inline-action-row"><button class="ghost" data-ww-abstain="1">Abstain</button></div>`
    : "";

  wwHintEl.innerHTML = `${escapeHtml(werewolfPhaseText(state, me))}${witchControls}${hunterControls}${abstainControl}`;

  if (state.result) {
    wwResultEl.classList.remove("hidden");
    wwResultEl.innerHTML = `<strong>${escapeHtml(state.result)}</strong><p>Winners +$${state.socialWinReward || 100}; losing camp -$${state.socialWinReward || 100}.</p>`;
  } else {
    wwResultEl.classList.add("hidden");
    wwResultEl.innerHTML = "";
  }

  wwWolfOnlyLabel.classList.toggle("hidden", !state.canWolfChat);
  wwWolfChatWrap.classList.toggle("hidden", !state.canWolfChat);
  renderChat(wwWolfChatEl, state.wolfChat || []);

  wwLogEl.innerHTML = state.log.map(item => `<p>${escapeHtml(item)}</p>`).join("");
  renderChat(wwChatEl, state.chat);
}

function renderUndercoverState(state) {
  latestUndercoverState = state;
  if (!state) {
    latestUndercoverState = null;
    setVoiceContext(null, null);
    showScreen("lobby");
    return;
  }
  setVoiceContext("undercover", state);

  latestPokerState = null;
  latestBlackjackState = null;
  latestDiceState = null;
  latestWerewolfState = null;
  showScreen("undercover");

  const host = state.players.find(p => p.id === state.hostId);
  const me = state.players.find(p => p.id === state.myId);
  const isHost = state.hostId === state.myId;

  ucRoomTitleEl.textContent = state.name;
  ucHostLineEl.textContent = `Who's Undercover host: ${host?.name || "none"} · Describe your word, then vote someone out.`;
  ucPhaseEl.textContent = state.phase;
  ucRoundEl.textContent = state.roundNumber || 0;
  ucWordEl.textContent = me?.word || "?";

  ucStartBtn.disabled = !isHost || (state.phase !== "waiting" && state.phase !== "gameEnd") || state.players.length < 3;

  ucPlayerGridEl.innerHTML = state.players.map(p => renderSocialPlayerCard(p, state, "uc")).join("");

  ucHintEl.innerHTML = (state.phase === "discussion" || state.phase === "voting") && me?.alive
    ? "Discuss, then vote using the buttons above player cards."
    : state.phase === "waiting"
      ? "Need at least 3 players to start."
      : state.result || "";

  if (state.result) {
    ucResultEl.classList.remove("hidden");
    const words = state.words ? `<p>Civilian word: ${escapeHtml(state.words.civilian)} · Undercover word: ${escapeHtml(state.words.undercover)}</p>` : "";
    ucResultEl.innerHTML = `<strong>${escapeHtml(state.result)}</strong>${words}`;
  } else {
    ucResultEl.classList.add("hidden");
    ucResultEl.innerHTML = "";
  }

  ucLogEl.innerHTML = state.log.map(item => `<p>${escapeHtml(item)}</p>`).join("");
  renderChat(ucChatEl, state.chat);
}


// ---------- Draw Guess ----------

function drawingPlayerCard(player, state) {
  const isMe = player.id === state.myId;
  return `
    <article class="social-player-card ${isMe ? "me" : ""}">
      ${chatBubbleHtml(player)}
      ${bankruptcyBadge(player)}
      <div class="avatar">${escapeHtml(player.name.slice(0, 1).toUpperCase())}</div>
      <h3>${escapeHtml(player.name)}${isMe ? "（you）" : ""}</h3>
      <div class="seat-meta">
        ${player.isHost ? `<span>Host</span>` : ""}
        <span>${player.submitted ? "Submitted" : "Waiting"}</span>
      </div>
    </article>
  `;
}

function drawingEntryHtml(entry) {
  if (!entry) return `<p class="muted">No previous entry.</p>`;

  if (entry.type === "drawing") {
    return `<img class="drawing-preview" src="${entry.image}" alt="drawing" />`;
  }

  const label = entry.type === "prompt" ? "Prompt" : "Guess";
  return `<div class="drawing-text-preview"><strong>${label}</strong><p>${escapeHtml(entry.text)}</p></div>`;
}

function drawingTaskKey(state) {
  return `${state.phase}:${state.stepIndex}:${state.task?.chainId || "none"}`;
}

function drawingTimerHtml(state) {
  if (!state?.deadlineAt || !["prompt", "draw", "guess"].includes(state.phase)) return "";
  return `<div class="dg-timer-pill">⏱ <span id="dg-timer-live">2:00</span></div>`;
}

function updateDrawingTimerDisplay() {
  const el = document.querySelector("#dg-timer-live");
  if (!el || !latestDrawingState?.deadlineAt) return;

  const remaining = Math.max(0, Number(latestDrawingState.deadlineAt) - Date.now());
  const seconds = Math.ceil(remaining / 1000);
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  el.textContent = `${minutes}:${String(rest).padStart(2, "0")}`;
  el.closest(".dg-timer-pill")?.classList.toggle("urgent", seconds <= 15);
}

function startDrawingTimerDisplay(state) {
  if (drawingTimerInterval) clearInterval(drawingTimerInterval);
  drawingTimerInterval = null;

  if (!state?.deadlineAt || !["prompt", "draw", "guess"].includes(state.phase)) {
    return;
  }

  updateDrawingTimerDisplay();
  drawingTimerInterval = setInterval(updateDrawingTimerDisplay, 250);
}

function hideDrawingAreas() {
  dgPromptArea.classList.add("hidden");
  dgDrawArea.classList.add("hidden");
  dgGuessArea.classList.add("hidden");
  dgGallery.classList.add("hidden");
}

function applyDrawingTool(ctx) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.globalCompositeOperation = "source-over";
  ctx.strokeStyle = drawingEraser ? "#ffffff" : drawingColor;
  ctx.lineWidth = drawingEraser ? 24 : 5;
}

function clearDrawingCanvas() {
  if (!dgCanvas) return;
  const ctx = dgCanvas.getContext("2d");
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, dgCanvas.width, dgCanvas.height);
  applyDrawingTool(ctx);
}

function updateDrawingToolButtons() {
  document.querySelectorAll("[data-dg-color]").forEach(btn => {
    btn.classList.toggle("active", !drawingEraser && btn.dataset.dgColor === drawingColor);
  });
  document.querySelector("#dg-eraser")?.classList.toggle("active", drawingEraser);
}

function initDrawingCanvas() {
  if (!dgCanvas || drawingCanvasReady) return;
  drawingCanvasReady = true;
  const ctx = dgCanvas.getContext("2d");
  clearDrawingCanvas();

  function point(event) {
    const rect = dgCanvas.getBoundingClientRect();
    const src = event.touches?.[0] || event;
    return {
      x: (src.clientX - rect.left) * (dgCanvas.width / rect.width),
      y: (src.clientY - rect.top) * (dgCanvas.height / rect.height)
    };
  }

  function start(event) {
    event.preventDefault();
    drawingActive = true;
    applyDrawingTool(ctx);
    const p = point(event);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  }

  function move(event) {
    if (!drawingActive) return;
    event.preventDefault();
    const p = point(event);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }

  function end(event) {
    if (!drawingActive) return;
    event.preventDefault();
    drawingActive = false;
  }

  dgCanvas.addEventListener("mousedown", start);
  dgCanvas.addEventListener("mousemove", move);
  window.addEventListener("mouseup", end);
  dgCanvas.addEventListener("touchstart", start, { passive: false });
  dgCanvas.addEventListener("touchmove", move, { passive: false });
  dgCanvas.addEventListener("touchend", end, { passive: false });
}

function drawingPerformanceControls(participant, state) {
  const myVote = state.ratingVotes?.[participant.targetKey] || "";
  const isSelf = participant.playerId === state.myId;
  const canVote = state.phase === "rating" && !isSelf;
  const stats = participant.rating || { good: 0, bad: 0 };

  return `
    <div class="chain-player-rating ${isSelf ? "self-rating-target" : ""}">
      <div>
        <strong>${escapeHtml(participant.playerName)}</strong>
        <span>Good ${stats.good || 0} · Bad ${stats.bad || 0}</span>
      </div>
      ${isSelf && state.phase === "rating" ? `<p class="muted">You cannot rate yourself.</p>` : ""}
      ${canVote ? `
        <div class="rating-buttons">
          <button class="good-rate ${myVote === "good" ? "active" : ""}" data-dg-rate-target="${participant.targetKey}" data-dg-rate="good">Good</button>
          <button class="bad-rate ${myVote === "bad" ? "active" : ""}" data-dg-rate-target="${participant.targetKey}" data-dg-rate="bad">Bad</button>
        </div>
      ` : ""}
    </div>
  `;
}

function drawingResultSummary(state) {
  const results = state.ratingResults || {};
  const rows = Object.entries(results);
  if (!rows.length) return "";

  return `
    <section class="drawing-results-summary">
      <h3>Final Performance</h3>
      ${rows.map(([playerId, stats]) => `
        <div class="drawing-result-row ${stats.result}">
          <strong>${escapeHtml(stats.name || "Player")}</strong>
          <span>Good ${stats.good || 0}</span>
          <span>Bad ${stats.bad || 0}</span>
          <span>${stats.result === "won" ? "+$100" : stats.result === "lost" ? "-$100" : "$0"}</span>
        </div>
      `).join("")}
    </section>
  `;
}

function renderCurrentDrawingRating(state) {
  const view = state.ratingView;
  if (!view) {
    return `<p class="muted">Preparing rating view...</p>`;
  }

  if (view.mode === "summary") {
    return `
      <section class="drawing-live-rating">
        <article class="drawing-chain-stage">
          <h3>Chain ${view.chainIndex + 1}/${view.chainCount}: ${escapeHtml(view.ownerName)}'s chain</h3>
          <p class="muted">Chain summary. Next chain will open soon.</p>
          <div class="drawing-chain-summary-box">
            <div>
              <h4>Original Prompt</h4>
              ${drawingEntryHtml(view.originalPrompt)}
            </div>
            <div>
              <h4>Final Guess</h4>
              ${drawingEntryHtml(view.finalGuess)}
            </div>
          </div>
        </article>
        <section class="drawing-revealed-grid">
          ${(view.entries || []).map(entry => `
            <div class="drawing-gallery-entry revealed">
              <span>${escapeHtml(entry.playerName)} · ${escapeHtml(entry.type)}</span>
              ${drawingEntryHtml(entry)}
            </div>
          `).join("")}
        </section>
      </section>
    `;
  }

  const current = view.currentEntry;
  const myVote = current?.myVote || "";
  const stats = current?.rating || { good: 0, bad: 0 };
  const votePanel = current ? `
    <aside class="drawing-live-vote-panel">
      <h3>Vote this ${escapeHtml(current.type)}</h3>
      <p><strong>${escapeHtml(current.playerName)}</strong>'s ${escapeHtml(current.type)}</p>
      <p class="muted">${view.submitted || 0}/${view.expected || 0} votes in · Good ${stats.good || 0} · Bad ${stats.bad || 0}</p>
      ${current.canVote ? `
        <div class="rating-buttons">
          <button class="good-rate ${myVote === "good" ? "active" : ""}" data-dg-rate-target="${current.targetKey}" data-dg-rate="good">Good</button>
          <button class="bad-rate ${myVote === "bad" ? "active" : ""}" data-dg-rate-target="${current.targetKey}" data-dg-rate="bad">Bad</button>
        </div>
      ` : `<p class="muted">You cannot vote on your own ${escapeHtml(current.type)}.</p>`}
    </aside>
  ` : "";

  return `
    <section class="drawing-live-rating">
      <article class="drawing-chain-stage">
        <h3>Chain ${view.chainIndex + 1}/${view.chainCount}: ${escapeHtml(view.ownerName)}'s chain</h3>
        <p class="muted">Cards reveal one by one. Vote on the current drawing or guess.</p>

        ${current?.type === "guess" && view.previousDrawing ? `
          <section class="drawing-guess-context">
            <h4>Previous drawing for this guess</h4>
            ${drawingEntryHtml(view.previousDrawing)}
          </section>
        ` : ""}

        <section class="drawing-revealed-grid">
          ${(view.entries || []).map((entry, index) => `
            <div class="drawing-gallery-entry revealed ${index === view.entryIndex ? "current-rating-entry" : ""}">
              <span>${escapeHtml(entry.playerName)} · ${escapeHtml(entry.type)}</span>
              ${drawingEntryHtml(entry)}
            </div>
          `).join("")}
        </section>
      </article>
      ${votePanel}
    </section>
  `;
}

function renderDrawingGallery(state) {
  if (state.phase === "rating") {
    dgGallery.innerHTML = `
      <section class="drawing-rating-status">
        <h3>Live Chain Reveal</h3>
        <p>${state.ratingsCount || 0}/${state.expectedRatings || 0} total ratings submitted.</p>
      </section>
      ${renderCurrentDrawingRating(state)}
    `;
    return;
  }

  dgGallery.innerHTML = `
    ${drawingResultSummary(state)}
    ${state.chains?.length
      ? state.chains.map(chain => `
        <article class="drawing-chain">
          <h3>${escapeHtml(chain.ownerName)}'s chain</h3>
          ${chain.entries.map(entry => `
            <div class="drawing-gallery-entry">
              <span>${escapeHtml(entry.playerName)} · ${escapeHtml(entry.type)}</span>
              ${drawingEntryHtml(entry)}
            </div>
          `).join("")}
        </article>
      `).join("")
      : `<p class="muted">Gallery is empty.</p>`
    }
  `;
}

function renderDrawingState(state) {
  latestDrawingState = state;
  if (!state) {
    latestDrawingState = null;
    setVoiceContext(null, null);
    showScreen("lobby");
    return;
  }
  setVoiceContext("drawing", state);

  latestPokerState = null;
  latestBlackjackState = null;
  latestDiceState = null;
  latestWerewolfState = null;
  latestUndercoverState = null;
  showScreen("drawing");
  initDrawingCanvas();

  const host = state.players.find(p => p.id === state.hostId);
  const isHost = state.hostId === state.myId;
  const me = state.players.find(p => p.id === state.myId);
  const alreadySubmitted = Boolean(me?.submitted);
  const key = drawingTaskKey(state);

  dgRoomTitleEl.textContent = state.name;
  dgHostLineEl.textContent = `Draw Guess host: ${host?.name || "none"} · Write → draw → guess → gallery.`;
  dgPhaseEl.textContent = state.phase;
  dgStepEl.textContent = state.stepIndex || 0;
  dgSubmittedEl.textContent = state.phase === "rating"
    ? `${state.ratingsCount || 0}/${state.expectedRatings || 0}`
    : `${state.submissionsCount || 0}/${state.expectedSubmissions || state.players.length}`;

  dgStartBtn.disabled = !isHost || (state.phase !== "waiting" && state.phase !== "gallery") || state.players.length < 4;
  dgPlayerGridEl.innerHTML = state.players.map(p => drawingPlayerCard(p, state)).join("");
  dgLogEl.innerHTML = state.log.map(item => `<p>${escapeHtml(item)}</p>`).join("");
  renderChat(dgChatEl, state.chat);

  hideDrawingAreas();
  dgSubmitPrompt.textContent = "Submit Prompt";
  dgSubmitDrawing.textContent = "Submit Drawing";
  dgSubmitGuess.textContent = "Submit Guess";

  if (state.phase === "waiting") {
    dgTaskBox.innerHTML = `<p class="muted">Need at least 4 players. Host starts the game.</p>`;
    dgHintEl.textContent = "Each player writes a prompt, then everyone alternates drawing and guessing.";
  } else if (state.phase === "prompt") {
    dgTaskBox.innerHTML = `${drawingTimerHtml(state)}<h2>Step 1: write a starting prompt</h2>`;
    dgPromptArea.classList.remove("hidden");
    dgSubmitPrompt.disabled = false;
    dgPromptInput.disabled = false;
    dgSubmitPrompt.textContent = alreadySubmitted ? "Update Prompt" : "Submit Prompt";
    dgHintEl.textContent = alreadySubmitted ? "Submitted. You can still edit and submit again while waiting." : "Write something fun for another player to draw.";
  } else if (state.phase === "draw") {
    dgTaskBox.innerHTML = `${drawingTimerHtml(state)}<h2>Draw this</h2>${drawingEntryHtml(state.task?.previous)}`;
    dgDrawArea.classList.remove("hidden");
    dgSubmitDrawing.disabled = false;
    dgClearCanvas.disabled = false;
    dgSubmitDrawing.textContent = alreadySubmitted ? "Update Drawing" : "Submit Drawing";
    if (key !== lastDrawingTaskKey && !alreadySubmitted) {
      clearDrawingCanvas();
      lastDrawingTaskKey = key;
    }
    dgHintEl.textContent = alreadySubmitted ? "Drawing submitted. You can clear/edit and submit again while waiting." : "Draw the prompt/guess shown above.";
  } else if (state.phase === "guess") {
    dgTaskBox.innerHTML = `${drawingTimerHtml(state)}<h2>Guess this drawing</h2>${drawingEntryHtml(state.task?.previous)}`;
    dgGuessArea.classList.remove("hidden");
    dgSubmitGuess.disabled = false;
    dgGuessInput.disabled = false;
    dgSubmitGuess.textContent = alreadySubmitted ? "Update Guess" : "Submit Guess";
    dgHintEl.textContent = alreadySubmitted ? "Guess submitted. You can edit and submit again while waiting." : "Type what you think the drawing shows.";
  } else if (state.phase === "rating") {
    dgTaskBox.innerHTML = `<h2>Rate Performance</h2><p class="muted">Each chain reveals one card at a time. Vote on the current drawing or guess.</p>`;
    dgGallery.classList.remove("hidden");
    renderDrawingGallery(state);
    dgHintEl.textContent = "After all ratings are submitted, Good > Bad wins +$100, Bad > Good loses -$100, tie is unchanged.";
  } else if (state.phase === "gallery") {
    dgTaskBox.innerHTML = `<h2>Gallery</h2><p class="muted">Final results are ready.</p>`;
    dgGallery.classList.remove("hidden");
    renderDrawingGallery(state);
    dgHintEl.textContent = "Host can start a new round.";
  }

  startDrawingTimerDisplay(state);
}


// ---------- 24 Points ----------

function tfExpressionString() {
  return tfExpressionTokens.map(token => String(token.value)).join(" ");
}

function resetTwentyFourBuilder(state) {
  tfExpressionTokens = [];
  tfBuilderRoundKey = `${state?.phase || ""}-${state?.roundNumber || 0}-${(state?.cards || []).join(",")}`;
}

function renderTwentyFourBuilder(state) {
  const used = Array(state.cards?.length || 0).fill(false);
  for (const token of tfExpressionTokens) {
    if (token.type === "card" && Number.isInteger(token.cardIndex) && used[token.cardIndex] === false) used[token.cardIndex] = true;
  }

  tfCardsEl.innerHTML = state.cards?.length
    ? state.cards.map((card, index) => `
      <button class="tf-card ${used[index] ? "used" : ""}" data-tf-card-index="${index}" ${used[index] || state.phase !== "playing" ? "disabled" : ""}>${card}</button>
    `).join("")
    : `<p class="muted">Start a round to get four numbers.</p>`;

  if (!tfExpressionTokens.length) {
    tfExpressionDisplayEl.innerHTML = `<span class="muted">Click cards and operators to build an expression.</span>`;
  } else {
    tfExpressionDisplayEl.innerHTML = tfExpressionTokens.map(token => `<span class="tf-token ${token.type === "card" ? "card-token" : "op-token"}">${escapeHtml(String(token.display || token.value))}</span>`).join("");
  }

  tfSubmitBtn.disabled = state.phase !== "playing" || !tfExpressionTokens.length;
  tfDeleteBtn.disabled = state.phase !== "playing" || !tfExpressionTokens.length;
  tfClearBtn.disabled = state.phase !== "playing" || !tfExpressionTokens.length;
}

function renderTwentyFourPlayer(player, state) {
  const isMe = player.id === state.myId;
  const delta = Number(player.profitLoss || 0);
  return `
    <article class="social-player-card ${player.isWinner ? "me" : ""} ${isMe ? "me" : ""}">
      ${chatBubbleHtml(player)}
      ${bankruptcyBadge(player)}
      <div class="avatar">${escapeHtml(player.name.slice(0, 1).toUpperCase())}</div>
      <h3>${escapeHtml(player.name)}${isMe ? "（you）" : ""}</h3>
      <div class="seat-meta">
        ${player.isHost ? `<span>Host</span>` : ""}
        ${player.isWinner ? `<span>Solver</span>` : ""}
        <span>${money(player.chips || 0)}</span>
      </div>
      <div class="tf-profit ${delta > 0 ? "gain" : delta < 0 ? "loss" : "flat"}">
        Total ${delta > 0 ? "+" : ""}${money(delta)}
      </div>
    </article>
  `;
}

function renderTwentyFourState(state) {
  latestTwentyFourState = state;
  if (!state) {
    latestTwentyFourState = null;
    setVoiceContext(null, null);
    showScreen("lobby");
    return;
  }
  setVoiceContext("twentyfour", state);

  latestPokerState = null;
  latestBlackjackState = null;
  latestDiceState = null;
  latestWerewolfState = null;
  latestUndercoverState = null;
  latestDrawingState = null;
  showScreen("twentyfour");
  updateChipLabels();

  const host = state.players.find(p => p.id === state.hostId);

  tfRoomTitleEl.textContent = state.name;
  tfHostLineEl.textContent = `24 Points host: ${host?.name || "none"} · First correct answer takes $20 from each other player. Solo play is allowed.`;
  tfPhaseEl.textContent = state.phase;
  tfRoundEl.textContent = state.roundNumber || 0;

  tfStartBtn.textContent = state.phase === "playing"
    ? state.hasSkipVoted
      ? `Skip Vote ${state.skipVotesCount || 0}/${state.expectedSkipVotes || state.players.length}`
      : `Vote Skip ${state.skipVotesCount || 0}/${state.expectedSkipVotes || state.players.length}`
    : "New 24 Round";
  tfStartBtn.disabled = state.phase === "playing" && state.hasSkipVoted;

  const roundKey = `${state.phase}-${state.roundNumber || 0}-${(state.cards || []).join(",")}`;
  if (roundKey !== tfBuilderRoundKey) resetTwentyFourBuilder(state);
  renderTwentyFourBuilder(state);

  if (state.solvedById) {
    const winner = state.players.find(p => p.id === state.solvedById);
    tfResultEl.classList.remove("hidden");
    tfResultEl.innerHTML = `
      <strong>${escapeHtml(winner?.name || "Someone")} solved it!</strong>
      <p>${escapeHtml(state.solvedExpression || "")}</p>
      ${state.lastResults?.length ? `<p>${state.lastResults.map(r => `${escapeHtml(r.name)} ${r.delta > 0 ? "+" : ""}${r.delta}`).join(" · ")}</p>` : ""}
    `;
  } else {
    tfResultEl.classList.add("hidden");
    tfResultEl.innerHTML = "";
  }

  tfPlayerGridEl.innerHTML = state.players.map(player => renderTwentyFourPlayer(player, state)).join("");
  tfHintEl.textContent = state.phase === "playing"
    ? `Tap cards and operators to build an expression. Skip requires everyone to vote yes: ${state.skipVotesCount || 0}/${state.expectedSkipVotes || state.players.length}.`
    : "Click New 24 Round to start.";
  tfLogEl.innerHTML = state.log.map(item => `<p>${escapeHtml(item)}</p>`).join("");
  renderChat(tfChatEl, state.chat);
}


// ---------- Regicide ----------

function regicideCardValue(card) {
  if (!card) return 0;
  if (card.rank === "A") return 1;
  if (card.rank === "J") return 10;
  if (card.rank === "Q") return 15;
  if (card.rank === "K") return 20;
  if (card.rank === "Joker") return 0;
  return Number(card.value || card.rank || 0);
}

function regicideSuitEffectText(suit, total, immuneSuit, damage) {
  const immune = suit === immuneSuit;
  if (suit === "♠") return immune ? "♠ blocked" : `♠ ATK -${total}`;
  if (suit === "♥") return immune ? "♥ blocked" : `♥ heal ${total}`;
  if (suit === "♣") return immune ? "♣ blocked" : `♣ dmg ${damage}`;
  if (suit === "♦") return immune ? "♦ blocked" : `♦ draw ${total}`;
  return "";
}

function regicidePetComboPreview(card, index, state) {
  if (card?.rank !== "A" || !regicideSelected.has(index)) return "";
  if (state.phase !== "playing") return "";

  const selectedIndices = [...regicideSelected].sort((a, b) => a - b);
  if (selectedIndices.length !== 2) return "";

  const cards = selectedIndices.map(i => state.myHand?.[i]).filter(Boolean);
  if (cards.length !== 2 || !cards.some(c => c.rank === "A")) return "";
  if (cards.some(c => c.rank === "Joker")) return "";

  const total = cards.reduce((sum, c) => sum + regicideCardValue(c), 0);
  const suits = [...new Set(cards.map(c => c.suit))];
  const immuneSuit = state.enemy?.immuneSuit || null;
  const clubActive = suits.includes("♣") && immuneSuit !== "♣";
  const damage = clubActive ? total * 2 : total;

  const effects = suits
    .map(suit => regicideSuitEffectText(suit, total, immuneSuit, damage))
    .filter(Boolean);

  return `
    <div class="pet-combo-preview">
      <strong>Pet combo</strong>
      <span>Total ${total} · Damage ${damage}</span>
      <span>${effects.map(escapeHtml).join(" · ")}</span>
    </div>
  `;
}

function isRecentRegicideEffect(effect, ms = 5000) {
  return Boolean(effect?.ts) && Date.now() - Number(effect.ts || 0) < ms;
}

function renderRegicidePlayer(player, state) {
  const phaseClass = player.phaseRole ? `reg-${player.phaseRole}-turn` : "";
  const phaseLabel = player.phaseRole === "attack"
    ? "⚔️ Attack"
    : player.phaseRole === "defense"
      ? "🛡 Defense"
      : player.phaseRole === "choose"
        ? "🃏 Choose"
        : "";
  const loseEffect = isRecentRegicideEffect(state.loseEffect, 5500) ? state.loseEffect : null;
  const failClass = state.phase === "lost" ? "reg-failed" : "";
  const slashClass = loseEffect ? "reg-slashed" : "";
  const slashLabel = loseEffect ? `<div class="reg-player-slash">🗡</div>` : "";

  return `
    <article class="social-player-card ${player.isTurn ? "me reg-current-turn" : ""} ${phaseClass} ${failClass} ${slashClass}">
      ${chatBubbleHtml(player)}
      ${bankruptcyBadge(player)}
      ${slashLabel}
      ${phaseLabel ? `<div class="reg-turn-ribbon">${phaseLabel}</div>` : ""}
      <div class="avatar">${escapeHtml(player.name.slice(0, 1).toUpperCase())}</div>
      <h3>${escapeHtml(player.name)}${player.id === state.myId ? "（you）" : ""}</h3>
      <div class="seat-meta">
        ${player.isHost ? `<span>Host</span>` : ""}
        ${player.isTurn ? `<span>Turn</span>` : ""}
        <span>Hand ${player.handCount}/${player.handLimit}</span>
        ${player.jokerTokens ? `<span>Solo Joker ${player.jokerTokens}</span>` : ""}
      </div>
      <div class="reg-chip-delta ${player.chipDelta > 0 ? "gain" : player.chipDelta < 0 ? "loss" : "flat"}">
        ${player.chipDelta > 0 ? "+" : ""}${money(player.chipDelta || 0)}
      </div>
    </article>
  `;
}

function updateRegicideActionButtons(state) {
  if (!state) return;
  const isMyTurn = state.turnPlayerId === state.myId;
  const me = state.players?.find(p => p.id === state.myId);

  regStartBtn.disabled = !(state.hostId === state.myId) || !["waiting", "won", "lost"].includes(state.phase);
  regPassBtn.disabled = !isMyTurn || state.phase !== "playing";
  regPlayBtn.disabled = !isMyTurn || state.phase !== "playing" || regicideSelected.size === 0;
  regDefendBtn.disabled = !isMyTurn || state.phase !== "defending" || regicideSelected.size === 0;
  regSoloRefreshBtn.disabled = !(state.players.length === 1 && me?.jokerTokens > 0 && ["playing", "defending"].includes(state.phase));
}

function regicideHandCardClass(card) {
  if (card?.rank === "Joker") return "joker-card";
  if (card?.rank === "A") return "pet-card";
  return "normal-card";
}

function renderRegicideHand(state) {
  regHandEl.innerHTML = state.myHand?.length
    ? state.myHand.map((card, index) => `
      <button class="regicide-hand-card ${regicideHandCardClass(card)} ${regicideSelected.has(index) ? "selected" : ""}" data-reg-card-index="${index}" type="button">
        ${regicidePetComboPreview(card, index, state)}
        ${cardHtml(card)}
        <span class="reg-card-value">${regicideCardValue(card)}</span>
        ${card.rank === "A" ? `<span class="reg-special-tag">Pet</span>` : ""}
        ${card.rank === "Joker" ? `<span class="reg-special-tag">Joker</span>` : ""}
      </button>
    `).join("")
    : `<p class="muted">No cards.</p>`;

  updateRegicideActionButtons(state);
}

function renderRegicideState(state) {
  latestRegicideState = state;
  if (!state) {
    latestRegicideState = null;
    setVoiceContext(null, null);
    showScreen("lobby");
    return;
  }
  setVoiceContext("regicide", state);

  latestPokerState = null;
  latestBlackjackState = null;
  latestDiceState = null;
  latestWerewolfState = null;
  latestUndercoverState = null;
  latestDrawingState = null;
  latestTwentyFourState = null;
  showScreen("regicide");
  updateChipLabels();

  const host = state.players.find(p => p.id === state.hostId);
  const me = state.players.find(p => p.id === state.myId);
  const isHost = state.hostId === state.myId;
  const isMyTurn = state.turnPlayerId === state.myId;

  regRoomTitleEl.textContent = state.name;
  regHostLineEl.textContent = `Regicide host: ${host?.name || "none"} · Cooperative boss fight for 1-4 players.`;
  regPhaseEl.textContent = state.phase;
  regEnemyDeckEl.textContent = state.enemyDeckCount || 0;
  regPlayerDeckEl.textContent = state.playerDeckCount || 0;
  regDiscardEl.textContent = state.discardCount || 0;

  updateRegicideActionButtons(state);

  const targetPlayer = state.players.find(p => p.id === state.turnPlayerId);
  const defeatEffect = isRecentRegicideEffect(state.defeatEffect, 5000) ? state.defeatEffect : null;
  const loseEffect = isRecentRegicideEffect(state.loseEffect, 5500) ? state.loseEffect : null;

  if (state.enemy) {
    const hpPct = Math.max(0, Math.min(100, Math.round((state.enemy.hp / state.enemy.maxHp) * 100)));
    const defeatedBossesHtml = (state.defeatedBosses || []).length
      ? `<div class="defeated-bosses-strip">${state.defeatedBosses.map((boss, index) => `
          <div class="defeated-boss-chip" title="${escapeHtml(boss.name)}">
            <span class="defeated-order">${index + 1}</span>
            <span>${escapeHtml(boss.rank + boss.suit)}</span>
            <div class="defeated-boss-hover-card">${cardHtml({ rank: boss.rank, suit: boss.suit })}</div>
          </div>`).join("")}</div>`
      : `<div class="defeated-bosses-strip empty"><span>No bosses defeated yet</span></div>`;

    regEnemyCardEl.innerHTML = `
      ${defeatedBossesHtml}
      ${defeatEffect ? `<div class="boss-defeat-effect">💥 ${escapeHtml(defeatEffect.name)} defeated! +${defeatEffect.reward}</div>` : ""}
      ${defeatEffect ? `<div class="boss-sword-slash boss-sword-slash-win">⚔️</div>` : ""}
      ${loseEffect ? `<div class="boss-sword-slash boss-sword-slash-lose">🗡</div>` : ""}
      <div class="boss-target-arrow">
        <span class="arrow-symbol">↓</span>
        <span>attacking ${escapeHtml(targetPlayer?.name || "current player")}</span>
      </div>
      <div class="boss-card boss-card-large">${cardHtml(state.enemy.card)}</div>
      <div class="boss-stats boss-stats-large">
        <strong>${escapeHtml(state.enemy.name)}</strong>
        <div class="boss-hp-row">
          <span>HP</span>
          <div class="boss-hp-bar"><div style="width:${hpPct}%"></div></div>
          <span>${state.enemy.hp}/${state.enemy.maxHp}</span>
        </div>
        <span class="boss-attack">🗡 ${state.enemy.attack} → ${state.enemy.effectiveAttack}</span>
        <span>Shield ${state.enemy.shield || 0}</span>
        <div class="boss-immune-badge ${state.enemy.immuneSuit ? "active" : "disabled"}">
          <span class="immune-icon">${state.enemy.immuneSuit ? "🛡" : "✅"}</span>
          <span>${state.enemy.immuneSuit ? `Immune to ${escapeHtml(state.enemy.immuneText || "None")}` : "No immunity"}</span>
        </div>
      </div>
    `;
  } else {
    const defeatedBossesHtml = (state.defeatedBosses || []).length
      ? `<div class="defeated-bosses-strip">${state.defeatedBosses.map((boss, index) => `
          <div class="defeated-boss-chip" title="${escapeHtml(boss.name)}">
            <span class="defeated-order">${index + 1}</span>
            <span>${escapeHtml(boss.rank + boss.suit)}</span>
            <div class="defeated-boss-hover-card">${cardHtml({ rank: boss.rank, suit: boss.suit })}</div>
          </div>`).join("")}</div>`
      : `<div class="defeated-bosses-strip empty"><span>No bosses defeated yet</span></div>`;

    regEnemyCardEl.innerHTML = `
      ${defeatedBossesHtml}
      ${defeatEffect ? `<div class="boss-defeat-effect">💥 ${escapeHtml(defeatEffect.name)} defeated! +${defeatEffect.reward}</div>` : ""}
      ${defeatEffect ? `<div class="boss-sword-slash boss-sword-slash-win">⚔️</div>` : ""}
      ${loseEffect ? `<div class="boss-sword-slash boss-sword-slash-lose">🗡</div>` : ""}
      <p class="muted">No enemy revealed.</p>
    `;
  }

  regStatusLinesEl.innerHTML = `
    <div class="player-deck-visual">
      <div class="player-deck-stack">
        <div class="player-deck-card back-card card-1"></div>
        <div class="player-deck-card back-card card-2"></div>
        <div class="player-deck-card back-card card-3"></div>
        <div class="player-deck-count-badge">${state.playerDeckCount || 0}</div>
      </div>
      <div class="player-deck-meta">
        <strong>Player deck</strong>
        <span>${state.playerDeckCount || 0} card${(state.playerDeckCount || 0) === 1 ? "" : "s"} left</span>
      </div>
    </div>
  `;

  regBattleZoneEl.innerHTML = state.battleZone?.length
    ? state.battleZone.map(card => cardHtml(card)).join("")
    : `<p class="muted">Cards played against current enemy stay here.</p>`;

  regChooseNextEl.classList.toggle("hidden", !(state.phase === "chooseNext" && state.turnPlayerId === state.myId));
  regChooseNextButtonsEl.innerHTML = state.players.map(player => `
    <button data-reg-choose-next="${player.id}">${escapeHtml(player.name)}</button>
  `).join("");

  regicideSelected = new Set([...regicideSelected].filter(index => index < (state.myHand?.length || 0)));
  renderRegicideHand(state);

  if (state.result) {
    regResultEl.classList.remove("hidden");
    regResultEl.innerHTML = `<strong>${state.phase === "lost" ? "💀 " : ""}${escapeHtml(state.result)}</strong>`;
  } else {
    regResultEl.classList.add("hidden");
    regResultEl.innerHTML = "";
  }

  regPlayerGridEl.innerHTML = state.players.map(player => renderRegicidePlayer(player, state)).join("");
  regHintEl.textContent = state.phase === "defending"
    ? `Discard selected cards totaling at least ${state.currentAttack}.`
    : state.phase === "chooseNext"
      ? "Joker played. Choose who acts next."
      : "Play a legal card/combo, play Joker, or Pass. If enemy survives, you must defend.";
  regLogEl.innerHTML = state.log.map(item => `<p>${escapeHtml(item)}</p>`).join("");
  renderChat(regChatEl, state.chat);
}

function renderRegicideQuickRules() {
  regRulesContent.innerHTML = `
    <section class="rule-card">
      <h3>🎯 Goal</h3>
      <p>Work together to defeat all 12 bosses: J first, then Q, then K. If someone cannot defend against a boss attack, everyone loses.</p>
    </section>
    <section class="rule-card">
      <h3>👑 Boss Stats</h3>
      <div class="rule-grid">
        <span>J</span><strong>20 HP / 🗡10</strong>
        <span>Q</span><strong>30 HP / 🗡15</strong>
        <span>K</span><strong>40 HP / 🗡20</strong>
      </div>
    </section>
    <section class="rule-card">
      <h3>🔁 Your Turn</h3>
      <ol>
        <li>Play a legal card/combo, Joker, or Pass.</li>
        <li>Suit powers trigger.</li>
        <li>Damage the boss.</li>
        <li>If the boss survives, discard enough hand value to defend.</li>
      </ol>
    </section>
    <section class="rule-card">
      <h3>♠ ♥ ♣ ♦ Suit Powers</h3>
      <div class="rule-grid">
        <span>♠ Spades</span><strong>Reduce boss attack</strong>
        <span>♥ Hearts</span><strong>Return discard cards to deck</strong>
        <span>♣ Clubs</span><strong>Double this attack</strong>
        <span>♦ Diamonds</span><strong>Draw cards round-robin</strong>
      </div>
      <p>The boss is immune to the power matching its own suit, unless Joker removed immunity.</p>
    </section>
    <section class="rule-card">
      <h3>🃏 Legal Plays</h3>
      <ul>
        <li>One card.</li>
        <li>A + one other card.</li>
        <li>Same rank combo with total value ≤ 10.</li>
        <li>Joker alone.</li>
      </ul>
    </section>
    <section class="rule-card">
      <h3>💥 Defeating Bosses</h3>
      <p>HP below 0: boss goes to discard. Exact 0: boss joins the player deck on top, which is powerful.</p>
    </section>
    <section class="rule-card">
      <h3>⚠️ Pass</h3>
      <p>Passing does not avoid damage. If you pass, the boss still attacks you.</p>
    </section>
  `;
}

async function loadRegicideRules() {
  if (regicideRulesLoaded) return;
  regicideRulesLoaded = true;
  renderRegicideQuickRules();
}

// ---------- Events ----------




// ---------- Gomoku + Connect Four ----------
function boardPlayerCard(player, state, labels = {}) {
  const isMe = player.id === state.myId;
  return `
    <article class="social-player-card board-player-card ${player.isTurn ? "me board-turn" : ""} ${isMe ? "me" : ""}">
      ${chatBubbleHtml(player)}
      ${bankruptcyBadge(player)}
      <div class="avatar ${player.mark === "black" ? "gomoku-black-avatar" : player.mark === "white" ? "gomoku-white-avatar" : player.mark === "red" ? "c4-red-avatar" : player.mark === "yellow" ? "c4-yellow-avatar" : ""}">
        ${player.mark === "black" ? "●" : player.mark === "white" ? "○" : player.mark === "red" ? "●" : player.mark === "yellow" ? "●" : player.name.slice(0, 1).toUpperCase()}
      </div>
      <h3>${escapeHtml(player.name)}${isMe ? "（you）" : ""}</h3>
      <div class="seat-meta">
        ${player.isHost ? `<span>Host</span>` : ""}
        ${player.isTurn ? `<span>Turn</span>` : ""}
        <span>${labels[player.mark] || player.mark}</span>
      </div>
    </article>
  `;
}

function boardLineKey(row, col) {
  return `${row}:${col}`;
}

function renderGomokuState(state) {
  latestGomokuState = state;
  if (!state) {
    latestGomokuState = null;
    setVoiceContext(null, null);
    showScreen("lobby");
    return;
  }

  latestPokerState = null;
  latestBlackjackState = null;
  latestDiceState = null;
  latestWerewolfState = null;
  latestUndercoverState = null;
  latestDrawingState = null;
  latestTwentyFourState = null;
  latestRegicideState = null;
  setVoiceContext("gomoku", state);
  showScreen("gomoku");
  updateChipLabels();

  const host = state.players.find(p => p.id === state.hostId);
  const turnPlayer = state.players.find(p => p.id === state.turnPlayerId);
  const isHost = state.hostId === state.myId;
  const isMyTurn = state.turnPlayerId === state.myId;
  const winning = new Set((state.winningLine || []).map(p => boardLineKey(p.row, p.col)));

  gomokuRoomTitleEl.textContent = state.name;
  gomokuHostLineEl.textContent = `Gomoku host: ${host?.name || "none"} · First to connect 5 wins.`;
  gomokuPhaseEl.textContent = state.phase;
  gomokuTurnEl.textContent = turnPlayer?.name || "none";
  gomokuResultLineEl.textContent = state.result || "none";
  gomokuStartBtn.disabled = !isHost || state.players.length < 2 || state.phase === "playing";
  gomokuHintEl.textContent = state.phase === "playing"
    ? (isMyTurn ? "Your turn: place one stone." : `Waiting for ${turnPlayer?.name || "another player"}...`)
    : (isHost ? "Start a new Gomoku game when 2 players are here." : "Waiting for Gomoku host.");

  gomokuBoardEl.innerHTML = (state.board || []).map((row, r) =>
    row.map((cell, c) => `
      <button
        type="button"
        class="gomoku-cell ${cell || ""} ${winning.has(boardLineKey(r, c)) ? "win-cell" : ""}"
        data-gomoku-row="${r}"
        data-gomoku-col="${c}"
        ${state.phase !== "playing" || !isMyTurn || cell ? "disabled" : ""}
        aria-label="row ${r + 1} col ${c + 1}"
      ></button>
    `).join("")
  ).join("");

  gomokuPlayerListEl.innerHTML = state.players.map(p => boardPlayerCard(p, state, { black: "Black", white: "White" })).join("");
  gomokuLogEl.innerHTML = state.log.map(item => `<p>${item}</p>`).join("");
  renderChat(gomokuChatEl, state.chat);
}

function renderConnectFourState(state) {
  latestConnectFourState = state;
  if (!state) {
    latestConnectFourState = null;
    setVoiceContext(null, null);
    showScreen("lobby");
    return;
  }

  latestPokerState = null;
  latestBlackjackState = null;
  latestDiceState = null;
  latestWerewolfState = null;
  latestUndercoverState = null;
  latestDrawingState = null;
  latestTwentyFourState = null;
  latestRegicideState = null;
  setVoiceContext("connectfour", state);
  showScreen("connectfour");
  updateChipLabels();

  const host = state.players.find(p => p.id === state.hostId);
  const turnPlayer = state.players.find(p => p.id === state.turnPlayerId);
  const isHost = state.hostId === state.myId;
  const isMyTurn = state.turnPlayerId === state.myId;
  const winning = new Set((state.winningLine || []).map(p => boardLineKey(p.row, p.col)));

  c4RoomTitleEl.textContent = state.name;
  c4HostLineEl.textContent = `Connect Four host: ${host?.name || "none"} · Drop pieces and connect 4.`;
  c4PhaseEl.textContent = state.phase;
  c4TurnEl.textContent = turnPlayer?.name || "none";
  c4ResultLineEl.textContent = state.result || "none";
  c4StartBtn.disabled = !isHost || state.players.length < 2 || state.phase === "playing";
  c4HintEl.textContent = state.phase === "playing"
    ? (isMyTurn ? "Your turn: choose a column." : `Waiting for ${turnPlayer?.name || "another player"}...`)
    : (isHost ? "Start a new Connect Four game when 2 players are here." : "Waiting for Connect Four host.");

  const board = state.board || [];
  c4BoardEl.innerHTML = `
    <div class="c4-drop-row">
      ${Array.from({ length: state.cols || 7 }, (_, c) => `
        <button
          type="button"
          class="c4-drop-btn"
          data-c4-col="${c}"
          ${state.phase !== "playing" || !isMyTurn || board[0]?.[c] ? "disabled" : ""}
        >▼</button>
      `).join("")}
    </div>
    <div class="c4-grid">
      ${board.map((row, r) => row.map((cell, c) => `
        <button
          type="button"
          class="c4-cell ${cell || ""} ${winning.has(boardLineKey(r, c)) ? "win-cell" : ""}"
          data-c4-col="${c}"
          ${state.phase !== "playing" || !isMyTurn || board[0]?.[c] ? "disabled" : ""}
          aria-label="column ${c + 1}"
        ></button>
      `).join("")).join("")}
    </div>
  `;

  c4PlayerListEl.innerHTML = state.players.map(p => boardPlayerCard(p, state, { black: "Red", white: "Yellow", red: "Red", yellow: "Yellow" })).join("");
  c4LogEl.innerHTML = state.log.map(item => `<p>${item}</p>`).join("");
  renderChat(c4ChatEl, state.chat);
}


// ---------- Voice chat: WebRTC mesh + Socket.IO signaling ----------
const voiceRtcConfig = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};

const voiceState = {
  context: null,
  active: false,
  muted: false,
  localStream: null,
  roomKey: null,
  peers: new Map(),
  remoteAudio: new Map(),
  peerMeta: new Map(),
  pendingIce: new Map(),
  reconnectTimers: new Map()
};

function setVoiceContext(type, state) {
  if (!type || !state?.id) {
    voiceState.context = null;
    if (voiceState.active) leaveVoice("left game room");
    renderVoicePanel();
    return;
  }

  const context = {
    type,
    id: state.id,
    name: state.name || "Game Room",
    key: `${state.bigRoomCode}:${type}:${state.id}`
  };

  const previousKey = voiceState.context?.key;
  voiceState.context = context;

  if (voiceState.active && previousKey && previousKey !== context.key) {
    leaveVoice("changed game room");
  }

  renderVoicePanel();
}

function renderVoicePanel() {
  if (!voicePanel) return;

  // Keep the voice panel attached to the viewport. This avoids rare browser
  // layout glitches where it appears only after zooming.
  if (voicePanel.parentElement !== document.body) document.body.appendChild(voicePanel);
  voicePanel.style.position = "fixed";
  voicePanel.style.zIndex = "999999";
  voicePanel.style.transform = "translateZ(0)";

  const hasContext = Boolean(voiceState.context);
  voicePanel.classList.toggle("hidden", !hasContext && !voiceState.active);

  const peers = [...voiceState.peerMeta.values()];
  const peerText = peers.length
    ? peers.map(peer => `${escapeHtml(peer.name)}${peer.muted ? " 🔇" : ""}`).join(" · ")
    : (voiceState.active ? "No one else in voice yet." : "Join the current game room voice.");

  voiceStatusText.textContent = voiceState.active
    ? `${voiceState.context?.name || "Voice"} · ${peers.length + 1} connected`
    : (hasContext ? `Ready for ${voiceState.context.name}` : "Join a game room first");

  voicePeerList.innerHTML = peerText;
  voiceJoinBtn.disabled = !hasContext || voiceState.active;
  voiceMuteBtn.disabled = !voiceState.active;
  voiceLeaveBtn.disabled = !voiceState.active;
  voiceMuteBtn.textContent = voiceState.muted ? "Unmute" : "Mute";
  requestAnimationFrame(() => {
    if (voicePanel) voicePanel.getBoundingClientRect();
  });
}

async function startVoice() {
  if (!voiceState.context || voiceState.active) return;

  try {
    voiceState.localStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      },
      video: false
    });

    voiceState.active = true;
    voiceState.muted = false;
    renderVoicePanel();
    socket.emit("voice:join");
  } catch (error) {
    voiceState.active = false;
    voiceState.localStream = null;
    voiceStatusText.textContent = "Mic permission denied or unavailable.";
    renderVoicePanel();
  }
}

function queueVoiceIce(peerId, candidate) {
  if (!voiceState.pendingIce.has(peerId)) voiceState.pendingIce.set(peerId, []);
  voiceState.pendingIce.get(peerId).push(candidate);
}

async function flushVoiceIce(peerId) {
  const pc = voiceState.peers.get(peerId);
  const queued = voiceState.pendingIce.get(peerId) || [];
  if (!pc || !pc.remoteDescription || !queued.length) return;

  voiceState.pendingIce.delete(peerId);

  for (const candidate of queued) {
    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      // Candidate may be stale after a reconnect; safe to skip.
    }
  }
}

function createVoicePeer(peerId, peerName = "Player") {
  if (voiceState.peers.has(peerId)) return voiceState.peers.get(peerId);

  const pc = new RTCPeerConnection(voiceRtcConfig);
  voiceState.peers.set(peerId, pc);
  voiceState.peerMeta.set(peerId, { id: peerId, name: peerName, muted: false });

  if (voiceState.localStream) {
    for (const track of voiceState.localStream.getTracks()) {
      pc.addTrack(track, voiceState.localStream);
    }
  }

  pc.onicecandidate = event => {
    if (event.candidate) {
      socket.emit("voice:ice", {
        targetId: peerId,
        candidate: event.candidate
      });
    }
  };

  pc.ontrack = event => {
    let audio = voiceState.remoteAudio.get(peerId);
    if (!audio) {
      audio = document.createElement("audio");
      audio.autoplay = true;
      audio.playsInline = true;
      audio.dataset.peerId = peerId;
      voiceAudioArea.appendChild(audio);
      voiceState.remoteAudio.set(peerId, audio);
    }
    audio.srcObject = event.streams[0];
  };

  pc.onconnectionstatechange = () => {
    const state = pc.connectionState;

    if (state === "connected") {
      const timer = voiceState.reconnectTimers.get(peerId);
      if (timer) clearTimeout(timer);
      voiceState.reconnectTimers.delete(peerId);
    }

    if (state === "failed" || state === "closed") {
      removeVoicePeer(peerId);
      return;
    }

    // "disconnected" is often a brief network hiccup during WebRTC setup.
    // Do not delete immediately, or a newly joined peer can become one-way audio.
    if (state === "disconnected" && !voiceState.reconnectTimers.has(peerId)) {
      const timer = setTimeout(() => {
        const latestPc = voiceState.peers.get(peerId);
        if (latestPc?.connectionState === "disconnected") {
          removeVoicePeer(peerId);
        }
        voiceState.reconnectTimers.delete(peerId);
      }, 10000);
      voiceState.reconnectTimers.set(peerId, timer);
    }
  };

  renderVoicePanel();
  return pc;
}

function removeVoicePeer(peerId) {
  const timer = voiceState.reconnectTimers.get(peerId);
  if (timer) clearTimeout(timer);
  voiceState.reconnectTimers.delete(peerId);
  voiceState.pendingIce.delete(peerId);

  const pc = voiceState.peers.get(peerId);
  if (pc) pc.close();
  voiceState.peers.delete(peerId);
  voiceState.peerMeta.delete(peerId);

  const audio = voiceState.remoteAudio.get(peerId);
  if (audio) {
    audio.srcObject = null;
    audio.remove();
  }
  voiceState.remoteAudio.delete(peerId);
  renderVoicePanel();
}

async function makeVoiceOffer(peerId, peerName) {
  const pc = createVoicePeer(peerId, peerName);
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  socket.emit("voice:offer", {
    targetId: peerId,
    offer
  });
}

async function handleVoiceOffer(from, offer) {
  if (!voiceState.active) return;
  const meta = voiceState.peerMeta.get(from) || { id: from, name: "Player" };
  const pc = createVoicePeer(from, meta.name);

  try {
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    await flushVoiceIce(from);

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit("voice:answer", {
      targetId: from,
      answer
    });
  } catch (error) {
    removeVoicePeer(from);
  }
}

async function handleVoiceAnswer(from, answer) {
  const pc = voiceState.peers.get(from);
  if (!pc) return;

  try {
    await pc.setRemoteDescription(new RTCSessionDescription(answer));
    await flushVoiceIce(from);
  } catch (error) {
    removeVoicePeer(from);
  }
}

async function handleVoiceIce(from, candidate) {
  if (!candidate) return;
  const pc = voiceState.peers.get(from);

  if (!pc || !pc.remoteDescription) {
    queueVoiceIce(from, candidate);
    return;
  }

  try {
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
  } catch (error) {
    queueVoiceIce(from, candidate);
  }
}

function toggleVoiceMute() {
  if (!voiceState.localStream) return;
  voiceState.muted = !voiceState.muted;
  for (const track of voiceState.localStream.getAudioTracks()) {
    track.enabled = !voiceState.muted;
  }
  socket.emit("voice:mute", { muted: voiceState.muted });
  renderVoicePanel();
}

function cleanupVoiceLocal() {
  for (const peerId of [...voiceState.peers.keys()]) {
    removeVoicePeer(peerId);
  }

  if (voiceState.localStream) {
    for (const track of voiceState.localStream.getTracks()) track.stop();
  }

  for (const timer of voiceState.reconnectTimers.values()) clearTimeout(timer);
  voiceState.reconnectTimers.clear();
  voiceState.pendingIce.clear();

  voiceState.localStream = null;
  voiceState.active = false;
  voiceState.muted = false;
  voiceState.roomKey = null;
  voiceState.peerMeta.clear();
  renderVoicePanel();
}

function leaveVoice(reason = "left voice") {
  if (voiceState.active) socket.emit("voice:leave", { reason });
  cleanupVoiceLocal();
}

voiceJoinBtn?.addEventListener("click", startVoice);
voiceMuteBtn?.addEventListener("click", toggleVoiceMute);
voiceLeaveBtn?.addEventListener("click", () => leaveVoice("left voice"));

socket.on("voice:joined", async payload => {
  voiceState.roomKey = payload.roomKey;
  for (const peer of payload.peers || []) {
    voiceState.peerMeta.set(peer.id, peer);
  }
  renderVoicePanel();

  for (const peer of payload.peers || []) {
    await makeVoiceOffer(peer.id, peer.name);
  }
});

socket.on("voice:peer-joined", peer => {
  voiceState.peerMeta.set(peer.id, peer);
  createVoicePeer(peer.id, peer.name);
  renderVoicePanel();
});

socket.on("voice:peer-left", ({ id }) => {
  removeVoicePeer(id);
});

socket.on("voice:peer-muted", ({ id, muted }) => {
  const peer = voiceState.peerMeta.get(id);
  if (peer) {
    peer.muted = Boolean(muted);
    voiceState.peerMeta.set(id, peer);
  }
  renderVoicePanel();
});

socket.on("voice:offer", ({ from, offer }) => {
  handleVoiceOffer(from, offer).catch(() => removeVoicePeer(from));
});

socket.on("voice:answer", ({ from, answer }) => {
  handleVoiceAnswer(from, answer).catch(() => removeVoicePeer(from));
});

socket.on("voice:ice", ({ from, candidate }) => {
  handleVoiceIce(from, candidate).catch(() => {});
});

socket.on("voice:left", () => {
  cleanupVoiceLocal();
});

socket.on("voice:error", ({ message }) => {
  if (voiceStatusText) voiceStatusText.textContent = message || "Voice error.";
  cleanupVoiceLocal();
});

renderVoicePanel();


joinBigBtn.addEventListener("click", () => {
  joinError.textContent = "";
  saveInputs();
  socket.emit("joinBigRoom", {
    name: nameInput.value,
    roomCode: bigRoomInput.value
  });
});


sellDieBtn?.addEventListener("click", () => socket.emit("sellExtraDie"));
buyDieBtn?.addEventListener("click", () => socket.emit("buyDie"));

bigChatSend?.addEventListener("click", () => sendChat(bigChatInput, "sendBigChat"));
bigChatInput?.addEventListener("keydown", event => {
  if (event.key === "Enter") sendChat(bigChatInput, "sendBigChat");
});

pokerChatSend?.addEventListener("click", () => sendChat(pokerChatInput, "sendGameChat"));
pokerChatInput?.addEventListener("keydown", event => {
  if (event.key === "Enter") sendChat(pokerChatInput, "sendGameChat");
});

bjChatSend?.addEventListener("click", () => sendChat(bjChatInput, "sendGameChat"));
bjChatInput?.addEventListener("keydown", event => {
  if (event.key === "Enter") sendChat(bjChatInput, "sendGameChat");
});

diceChatSend?.addEventListener("click", () => sendChat(diceChatInput, "sendGameChat"));
diceChatInput?.addEventListener("keydown", event => {
  if (event.key === "Enter") sendChat(diceChatInput, "sendGameChat");
});

function sendWerewolfChat() {
  if (wwWolfOnlyToggle?.checked) {
    sendChat(wwChatInput, "sendWerewolfWolfChat");
  } else {
    sendChat(wwChatInput, "sendGameChat");
  }
}

wwChatSend?.addEventListener("click", sendWerewolfChat);
wwChatInput?.addEventListener("keydown", event => {
  if (event.key === "Enter") sendWerewolfChat();
});

ucChatSend?.addEventListener("click", () => sendChat(ucChatInput, "sendGameChat"));
ucChatInput?.addEventListener("keydown", event => {
  if (event.key === "Enter") sendChat(ucChatInput, "sendGameChat");
});

dgChatSend?.addEventListener("click", () => sendChat(dgChatInput, "sendGameChat"));
dgChatInput?.addEventListener("keydown", event => {
  if (event.key === "Enter") sendChat(dgChatInput, "sendGameChat");
});

tfChatSend?.addEventListener("click", () => sendChat(tfChatInput, "sendGameChat"));
tfChatInput?.addEventListener("keydown", event => {
  if (event.key === "Enter") sendChat(tfChatInput, "sendGameChat");
});

regChatSend?.addEventListener("click", () => sendChat(regChatInput, "sendGameChat"));
gomokuChatSend?.addEventListener("click", () => sendChat(gomokuChatInput, "sendGameChat"));
c4ChatSend?.addEventListener("click", () => sendChat(c4ChatInput, "sendGameChat"));
regChatInput?.addEventListener("keydown", event => {
  if (event.key === "Enter") sendChat(regChatInput, "sendGameChat");
});

createGameBtn.addEventListener("click", () => {
  const type = gameTypeSelect.value;
  const name = gameRoomNameInput.value;

  if (type === "poker") socket.emit("createPokerRoom", { name });
  if (type === "blackjack") socket.emit("createBlackjackRoom", { name });
  if (type === "dice") socket.emit("createDiceRoom", { name });
  if (type === "werewolf") socket.emit("createWerewolfRoom", { name });
  if (type === "undercover") socket.emit("createUndercoverRoom", { name });
  if (type === "drawing") socket.emit("createDrawingRoom", { name });
  if (type === "twentyfour") socket.emit("createTwentyFourRoom", { name });
  if (type === "regicide") socket.emit("createRegicideRoom", { name });
  if (type === "gomoku") socket.emit("createGomokuRoom", { name });
  if (type === "connectfour") socket.emit("createConnectFourRoom", { name });

  gameRoomNameInput.value = "";
});

document.addEventListener("click", event => {
  const joinButton = event.target.closest("[data-join-type]");
  if (joinButton && !joinButton.disabled) {
    const type = joinButton.dataset.joinType;
    const id = joinButton.dataset.joinId;
    if (type === "poker") socket.emit("joinPokerRoom", { pokerRoomId: id });
    if (type === "blackjack") socket.emit("joinBlackjackRoom", { roomId: id });
    if (type === "dice") socket.emit("joinDiceRoom", { roomId: id });
    if (type === "werewolf") socket.emit("joinWerewolfRoom", { roomId: id });
    if (type === "undercover") socket.emit("joinUndercoverRoom", { roomId: id });
    if (type === "drawing") socket.emit("joinDrawingRoom", { roomId: id });
    if (type === "twentyfour") socket.emit("joinTwentyFourRoom", { roomId: id });
    if (type === "regicide") socket.emit("joinRegicideRoom", { roomId: id });
    if (type === "gomoku") socket.emit("joinGomokuRoom", { roomId: id });
    if (type === "connectfour") socket.emit("joinConnectFourRoom", { roomId: id });
    return;
  }

  const gomokuCell = event.target.closest("[data-gomoku-row]");
  if (gomokuCell) {
    socket.emit("gomokuAction", {
      action: "place",
      row: Number(gomokuCell.dataset.gomokuRow),
      col: Number(gomokuCell.dataset.gomokuCol)
    });
    return;
  }

  const c4Cell = event.target.closest("[data-c4-col]");
  if (c4Cell) {
    socket.emit("connectFourAction", {
      action: "drop",
      col: Number(c4Cell.dataset.c4Col)
    });
    return;
  }

  const wwKill = event.target.closest("[data-ww-kill]");
  if (wwKill) {
    socket.emit("werewolfAction", { action: "wolfKill", targetId: wwKill.dataset.wwKill });
    return;
  }

  const wwSeer = event.target.closest("[data-ww-seer]");
  if (wwSeer) {
    socket.emit("werewolfAction", { action: "seerCheck", targetId: wwSeer.dataset.wwSeer });
    return;
  }

  const wwPoison = event.target.closest("[data-ww-poison]");
  if (wwPoison) {
    socket.emit("werewolfAction", { action: "witchAction", poisonTargetId: wwPoison.dataset.wwPoison });
    return;
  }

  const wwVote = event.target.closest("[data-ww-vote]");
  if (wwVote) {
    socket.emit("werewolfAction", { action: "vote", targetId: wwVote.dataset.wwVote });
    return;
  }

  const wwAbstain = event.target.closest("[data-ww-abstain]");
  if (wwAbstain) {
    socket.emit("werewolfAction", { action: "vote", targetId: "__abstain__" });
    return;
  }

  const wwSave = event.target.closest("[data-ww-witch-save]");
  if (wwSave) {
    socket.emit("werewolfAction", { action: "witchAction", save: true });
    return;
  }

  const wwWitchSaveSkip = event.target.closest("[data-ww-witch-save-skip]");
  if (wwWitchSaveSkip) {
    socket.emit("werewolfAction", { action: "witchAction", save: false });
    return;
  }

  const wwWitchPoisonSkip = event.target.closest("[data-ww-witch-poison-skip]");
  if (wwWitchPoisonSkip) {
    socket.emit("werewolfAction", { action: "witchAction" });
    return;
  }

  const wwShoot = event.target.closest("[data-ww-shoot]");
  if (wwShoot) {
    socket.emit("werewolfAction", { action: "hunterShoot", targetId: wwShoot.dataset.wwShoot });
    return;
  }

  const wwHunterSkip = event.target.closest("[data-ww-hunter-skip]");
  if (wwHunterSkip) {
    socket.emit("werewolfAction", { action: "hunterShoot" });
    return;
  }

  const wwEliminate = event.target.closest("[data-ww-eliminate]");
  if (wwEliminate) {
    socket.emit("werewolfAction", { action: "eliminate", targetId: wwEliminate.dataset.wwEliminate });
    return;
  }

  const ucVote = event.target.closest("[data-uc-vote]");
  if (ucVote) {
    socket.emit("undercoverAction", { action: "vote", targetId: ucVote.dataset.ucVote });
    return;
  }

  const ucEliminate = event.target.closest("[data-uc-eliminate]");
  if (ucEliminate) {
    socket.emit("undercoverAction", { action: "eliminate", targetId: ucEliminate.dataset.ucEliminate });
    return;
  }

  const kickButton = event.target.closest("[data-kick-id]");
  if (kickButton) {
    socket.emit("kickPlayer", { playerId: kickButton.dataset.kickId });
  }
});

document.querySelectorAll(".back-game-btn").forEach(btn => {
  btn.addEventListener("click", () => socket.emit("leaveGameRoom"));
});

leaveBigBtn.addEventListener("click", () => {
  socket.emit("leaveBigRoom");
  location.reload();
});

// Poker controls
startBtn.addEventListener("click", () => socket.emit("startHand"));
foldBtn.addEventListener("click", () => socket.emit("playerAction", { action: "fold" }));
checkBtn.addEventListener("click", () => socket.emit("playerAction", { action: "check" }));
callBtn.addEventListener("click", () => socket.emit("playerAction", { action: "call" }));
raiseSlider.addEventListener("input", () => {
  raiseValue.textContent = raiseSlider.value;
});
raiseBtn.addEventListener("click", () => {
  socket.emit("playerAction", {
    action: "raise",
    amount: Number(raiseSlider.value || 0)
  });
});

showLeftCardBtn?.addEventListener("click", () => {
  socket.emit("showPokerCards", { indices: [0] });
});

showRightCardBtn?.addEventListener("click", () => {
  socket.emit("showPokerCards", { indices: [1] });
});

showBothCardsBtn?.addEventListener("click", () => {
  socket.emit("showPokerCards", { indices: [0, 1] });
});

// Blackjack controls
bjStartBtn.addEventListener("click", () => socket.emit("blackjackAction", { action: "start" }));
bjBetMinusBtn.addEventListener("click", () => {
  const step = latestBlackjackState?.betStep || 10;
  const minBet = latestBlackjackState?.minBet || 10;
  bjSelectedBet = Math.max(minBet, bjSelectedBet - step);
  if (latestBlackjackState) renderBlackjackState(latestBlackjackState);
});
bjBetPlusBtn.addEventListener("click", () => {
  const step = latestBlackjackState?.betStep || 10;
  bjSelectedBet += step;
  if (latestBlackjackState) renderBlackjackState(latestBlackjackState);
});
bjPlaceBetBtn.addEventListener("click", () => socket.emit("blackjackAction", { action: "placeBet", amount: bjSelectedBet }));

bjHitBtn.addEventListener("click", () => socket.emit("blackjackAction", { action: "hit" }));
bjStandBtn.addEventListener("click", () => socket.emit("blackjackAction", { action: "stand" }));
bjDoubleBtn.addEventListener("click", () => socket.emit("blackjackAction", { action: "doubleDown" }));
bjInsuranceBtn.addEventListener("click", () => socket.emit("blackjackAction", { action: "insurance" }));

// Dice controls
diceStartBtn.addEventListener("click", () => socket.emit("diceAction", { action: "start" }));
diceCountMinusBtn.addEventListener("click", () => {
  const next = Math.max(1, diceBidCount - 1);
  if (latestDiceState && isDiceBidLegal(latestDiceState, next, diceBidFace)) {
    diceBidCount = next;
    syncDiceControls(latestDiceState);
    updateDiceControlButtons(latestDiceState);
  }
});
diceCountPlusBtn.addEventListener("click", () => {
  diceBidCount += 1;
  if (latestDiceState) {
    syncDiceControls(latestDiceState);
    updateDiceControlButtons(latestDiceState);
  } else {
    diceCountValueEl.textContent = diceBidCount;
  }
});
diceFaceMinusBtn.addEventListener("click", () => {
  const next = Math.max(1, diceBidFace - 1);
  if (latestDiceState && isDiceBidLegal(latestDiceState, diceBidCount, next)) {
    diceBidFace = next;
    syncDiceControls(latestDiceState);
    updateDiceControlButtons(latestDiceState);
  }
});
diceFacePlusBtn.addEventListener("click", () => {
  diceBidFace = Math.min(6, diceBidFace + 1);
  if (latestDiceState) {
    syncDiceControls(latestDiceState);
    updateDiceControlButtons(latestDiceState);
  } else {
    diceFaceValueEl.innerHTML = diceFaceIcon(diceBidFace);
  }
});
diceBidBtn.addEventListener("click", () => {
  socket.emit("diceAction", {
    action: "bid",
    count: diceBidCount,
    face: diceBidFace
  });
});
diceSpotOnBtn.addEventListener("click", () => socket.emit("diceAction", { action: "spotOn" }));
diceChallengeBtn.addEventListener("click", () => socket.emit("diceAction", { action: "challenge" }));

wwStartBtn?.addEventListener("click", () => socket.emit("werewolfAction", { action: "start" }));
wwNextPhaseBtn?.addEventListener("click", () => socket.emit("werewolfAction", { action: "nextPhase" }));
ucStartBtn?.addEventListener("click", () => socket.emit("undercoverAction", { action: "start" }));

document.addEventListener("click", event => {
  const ratingButton = event.target.closest("[data-dg-rate-target]");
  if (!ratingButton) return;

  socket.emit("drawingAction", {
    action: "submitRating",
    targetKey: ratingButton.dataset.dgRateTarget,
    rating: ratingButton.dataset.dgRate
  });
});

dgStartBtn?.addEventListener("click", () => socket.emit("drawingAction", { action: "start" }));
dgSubmitPrompt?.addEventListener("click", () => {
  socket.emit("drawingAction", { action: "submitPrompt", text: dgPromptInput.value });
});
dgPromptInput?.addEventListener("keydown", event => {
  if (event.key === "Enter") dgSubmitPrompt.click();
});
document.addEventListener("click", event => {
  const colorButton = event.target.closest("[data-dg-color]");
  if (!colorButton) return;
  drawingColor = colorButton.dataset.dgColor;
  drawingEraser = false;
  updateDrawingToolButtons();
});

document.querySelector("#dg-eraser")?.addEventListener("click", () => {
  drawingEraser = !drawingEraser;
  updateDrawingToolButtons();
});

dgClearCanvas?.addEventListener("click", () => {
  const now = Date.now();
  if (now < dgClearConfirmUntil) {
    clearDrawingCanvas();
    dgClearConfirmUntil = 0;
    dgClearCanvas.textContent = "Clear";
    return;
  }

  dgClearConfirmUntil = now + 3000;
  dgClearCanvas.textContent = "Click again to clear";
  setTimeout(() => {
    if (Date.now() >= dgClearConfirmUntil) {
      dgClearCanvas.textContent = "Clear";
      dgClearConfirmUntil = 0;
    }
  }, 3100);
});
dgSubmitDrawing?.addEventListener("click", () => {
  socket.emit("drawingAction", { action: "submitDrawing", image: dgCanvas.toDataURL("image/png") });
});
dgSubmitGuess?.addEventListener("click", () => {
  socket.emit("drawingAction", { action: "submitGuess", text: dgGuessInput.value });
});
dgGuessInput?.addEventListener("keydown", event => {
  if (event.key === "Enter") dgSubmitGuess.click();
});


tfStartBtn?.addEventListener("click", () => {
  const action = latestTwentyFourState?.phase === "playing" ? "skipVote" : "start";
  socket.emit("twentyFourAction", { action });
});
tfSubmitBtn?.addEventListener("click", () => {
  socket.emit("twentyFourAction", { action: "submit", expression: tfExpressionString() });
});
tfClearBtn?.addEventListener("click", () => {
  tfExpressionTokens = [];
  if (latestTwentyFourState) renderTwentyFourBuilder(latestTwentyFourState);
});
tfDeleteBtn?.addEventListener("click", () => {
  tfExpressionTokens.pop();
  if (latestTwentyFourState) renderTwentyFourBuilder(latestTwentyFourState);
});
gomokuStartBtn?.addEventListener("click", () => socket.emit("gomokuAction", { action: "start" }));
c4StartBtn?.addEventListener("click", () => socket.emit("connectFourAction", { action: "start" }));

regStartBtn?.addEventListener("click", () => socket.emit("regicideAction", { action: "start" }));
regPassBtn?.addEventListener("click", () => socket.emit("regicideAction", { action: "pass" }));
regPlayBtn?.addEventListener("click", () => {
  socket.emit("regicideAction", { action: "play", indices: [...regicideSelected] });
  regicideSelected.clear();
});
regDefendBtn?.addEventListener("click", () => {
  socket.emit("regicideAction", { action: "defend", indices: [...regicideSelected] });
  regicideSelected.clear();
});
regSoloRefreshBtn?.addEventListener("click", () => socket.emit("regicideAction", { action: "soloRefresh" }));

regRulesToggle?.addEventListener("click", () => {
  regRulesDrawer.classList.toggle("hidden");
  loadRegicideRules();
});
regRulesClose?.addEventListener("click", () => regRulesDrawer.classList.add("hidden"));

document.addEventListener("click", event => {
  const regCard = event.target.closest("[data-reg-card-index]");
  if (regCard) {
    const index = Number(regCard.dataset.regCardIndex);
    if (regicideSelected.has(index)) regicideSelected.delete(index);
    else regicideSelected.add(index);
    if (latestRegicideState) renderRegicideHand(latestRegicideState);
    return;
  }

  const choose = event.target.closest("[data-reg-choose-next]");
  if (choose) {
    socket.emit("regicideAction", { action: "chooseNext", targetId: choose.dataset.regChooseNext });
  }
});

document.addEventListener("click", event => {
  const cardBtn = event.target.closest("[data-tf-card-index]");
  if (cardBtn && latestTwentyFourState?.phase === "playing") {
    const cardIndex = Number(cardBtn.dataset.tfCardIndex);
    const value = latestTwentyFourState.cards?.[cardIndex];
    if (Number.isFinite(value)) {
      tfExpressionTokens.push({ type: "card", value, display: value, cardIndex });
      renderTwentyFourBuilder(latestTwentyFourState);
    }
    return;
  }

  const opBtn = event.target.closest("[data-tf-op]");
  if (opBtn && latestTwentyFourState?.phase === "playing") {
    const op = opBtn.dataset.tfOp;
    const displayMap = { '*': '×', '/': '÷', '-': '−', '+': '+', '(': '(', ')': ')' };
    tfExpressionTokens.push({ type: "op", value: op, display: displayMap[op] || op });
    renderTwentyFourBuilder(latestTwentyFourState);
  }
});

socket.on("bigRoomState", renderBigState);
socket.on("pokerRoomState", renderPokerState);
socket.on("blackjackRoomState", renderBlackjackState);
socket.on("diceRoomState", renderDiceState);
socket.on("werewolfRoomState", renderWerewolfState);
socket.on("undercoverRoomState", renderUndercoverState);
socket.on("drawingRoomState", renderDrawingState);
socket.on("twentyFourRoomState", renderTwentyFourState);
socket.on("regicideRoomState", renderRegicideState);
socket.on("gomokuRoomState", renderGomokuState);
socket.on("connectFourRoomState", renderConnectFourState);

socket.on("errorMessage", message => {
  joinError.textContent = message;
  gameError.textContent = message;
  bjErrorEl.textContent = message;
  diceErrorEl.textContent = message;
  wwErrorEl.textContent = message;
  ucErrorEl.textContent = message;
  dgErrorEl.textContent = message;
  tfErrorEl.textContent = message;
  regErrorEl.textContent = message;
  if (gomokuErrorEl) gomokuErrorEl.textContent = message;
  if (c4ErrorEl) c4ErrorEl.textContent = message;
});

socket.on("kicked", message => {
  alert(message || "You were kicked by the big room host.");
  location.reload();
});

bigRoomInput.addEventListener("keydown", event => {
  if (event.key === "Enter") joinBigBtn.click();
});

nameInput.addEventListener("keydown", event => {
  if (event.key === "Enter") joinBigBtn.click();
});

gameRoomNameInput.addEventListener("keydown", event => {
  if (event.key === "Enter") createGameBtn.click();
});

loadInputs();
showScreen("join");
