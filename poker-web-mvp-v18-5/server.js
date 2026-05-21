const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

const STARTING_CHIPS = 1000;
const SMALL_BLIND = 5;
const BIG_BLIND = 10;
const POKER_ANTE = 10;
const MAX_POKER_PLAYERS = 10;
const MAX_BLACKJACK_PLAYERS = 7;
const MAX_DICE_PLAYERS = 10;
const MAX_WEREWOLF_PLAYERS = 12;
const MAX_UNDERCOVER_PLAYERS = 12;
const MAX_DRAWING_PLAYERS = 12;
const MAX_TWENTYFOUR_PLAYERS = 10;
const MAX_REGICIDE_PLAYERS = 4;
const MAX_GOMOKU_PLAYERS = 2;
const MAX_CONNECT_FOUR_PLAYERS = 2;
const GOMOKU_SIZE = 15;
const CONNECT_FOUR_ROWS = 6;
const CONNECT_FOUR_COLS = 7;
const REGICIDE_ENTRY_FEE = 200;
const REGICIDE_REWARDS = { J: 25, Q: 50, K: 100 };
const SOCIAL_WIN_REWARD = 100;
const DRAWING_TIME_LIMIT_MS = 120000;
const DRAWING_CHAIN_SUMMARY_MS = 5000;
const BLACKJACK_BET = 50;
const BLACKJACK_MIN_BET = 10;
const BLACKJACK_BET_STEP = 10;
const STARTING_DICE = 5;
const DICE_CASH_VALUE = 100;
const DICE_EXCHANGE_MINIMUM = 5;
const MAX_DICE_COUNT = 10;
const RUNNING_PHASES = new Set(["preflop", "flop", "turn", "river"]);

app.use(express.static("public"));

const bigRooms = new Map();
const voiceRooms = new Map();
const drawingPhaseTimers = new Map();
const drawingRatingTimers = new Map();

function cleanRoomCode(code) {
  return String(code || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10);
}

function cleanName(name, fallback = "Player") {
  return String(name || fallback).trim().slice(0, 18) || fallback;
}


function loadUndercoverWordPairs() {
  const defaults = [
    ["coffee", "tea"],
    ["cat", "dog"],
    ["beach", "pool"],
    ["teacher", "professor"],
    ["pizza", "burger"],
    ["moon", "star"],
    ["bus", "train"],
    ["doctor", "nurse"]
  ];

  const filePath = path.join(__dirname, "undercover_word_bank.txt");
  if (!fs.existsSync(filePath)) return defaults;

  const lines = fs.readFileSync(filePath, "utf-8")
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith("#"));

  const pairs = lines
    .map(line => line.split("|").map(part => part.trim()).filter(Boolean))
    .filter(parts => parts.length >= 2)
    .map(parts => [parts[0], parts[1]]);

  return pairs.length ? pairs : defaults;
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function createDeck() {
  const suits = ["♠", "♥", "♦", "♣"];
  const ranks = [
    { text: "2", value: 2 }, { text: "3", value: 3 }, { text: "4", value: 4 },
    { text: "5", value: 5 }, { text: "6", value: 6 }, { text: "7", value: 7 },
    { text: "8", value: 8 }, { text: "9", value: 9 }, { text: "10", value: 10 },
    { text: "J", value: 11 }, { text: "Q", value: 12 }, { text: "K", value: 13 },
    { text: "A", value: 14 }
  ];

  const deck = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank: rank.text, value: rank.value });
    }
  }
  return deck;
}

function shuffle(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function makeBigRoom(code) {
  return {
    code,
    hostId: null,
    players: [],
    pokerRooms: new Map(),
    blackjackRooms: new Map(),
    diceRooms: new Map(),
    werewolfRooms: new Map(),
    undercoverRooms: new Map(),
    drawingRooms: new Map(),
    twentyFourRooms: new Map(),
    regicideRooms: new Map(),
    gomokuRooms: new Map(),
    connectFourRooms: new Map(),
    nextPokerRoomNumber: 1,
    nextBlackjackRoomNumber: 1,
    nextDiceRoomNumber: 1,
    nextWerewolfRoomNumber: 1,
    nextUndercoverRoomNumber: 1,
    nextDrawingRoomNumber: 1,
    nextTwentyFourRoomNumber: 1,
    nextRegicideRoomNumber: 1,
    nextGomokuRoomNumber: 1,
    nextConnectFourRoomNumber: 1,
    log: [],
    chat: []
  };
}

function makePokerRoom(id, name) {
  return {
    id,
    name,
    hostId: null,
    players: [],
    seats: {},
    phase: "waiting",
    deck: [],
    community: [],
    pot: 0,
    currentBet: 0,
    dealerIndex: -1,
    turnIndex: -1,
    lastRaise: BIG_BLIND,
    lastWinnerId: null,
    log: [],
    winners: [],
    revealedHands: {},
    handNumber: 0,
    chat: []
  };
}

function makeBlackjackRoom(id, name) {
  return {
    id,
    name,
    hostId: null,
    players: [],
    seats: {},
    phase: "waiting",
    deck: [],
    dealerHand: [],
    dealerIndex: -1,
    turnIndex: -1,
    roundNumber: 0,
    log: [],
    results: [],
    chat: []
  };
}

function makeDiceRoom(id, name) {
  return {
    id,
    name,
    hostId: null,
    players: [],
    seats: {},
    phase: "waiting",
    turnIndex: -1,
    currentBid: null,
    roundNumber: 0,
    log: [],
    lastReveal: null,
    gameWinnerId: null,
    gameWinnerName: null,
    chat: []
  };
}

function makeWerewolfRoom(id, name) {
  return {
    id,
    name,
    hostId: null,
    players: [],
    seats: {},
    phase: "waiting",
    roundNumber: 0,
    votes: {},
    wolfVotes: {},
    voteRound: 1,
    voteCandidates: null,
    pendingWolfKillId: null,
    pendingDeathsQueue: [],
    witchSaved: false,
    witchPoisonTargetId: null,
    witchSaveUsed: false,
    witchPoisonUsed: false,
    seerCheck: null,
    seerResults: {},
    seerKnownRoles: {},
    witchSavedTargetId: null,
    hunterPendingId: null,
    hunterUsed: {},
    nextPhaseAfterHunter: null,
    log: [],
    chat: [],
    wolfChat: [],
    result: null,
    rewarded: false
  };
}

function makeUndercoverRoom(id, name) {
  return {
    id,
    name,
    hostId: null,
    players: [],
    seats: {},
    phase: "waiting",
    roundNumber: 0,
    votes: {},
    words: null,
    log: [],
    chat: [],
    result: null,
    rewarded: false
  };
}


function makeDrawingRoom(id, name) {
  return {
    id,
    name,
    hostId: null,
    players: [],
    phase: "waiting",
    stepIndex: 0,
    chains: [],
    submissions: {},
    ratingVotes: {},
    ratingResults: {},
    ratingCursor: null,
    deadlineAt: null,
    log: [],
    chat: [],
    result: null,
    rewarded: false
  };
}


function makeTwentyFourRoom(id, name) {
  return {
    id,
    name,
    hostId: null,
    players: [],
    phase: "waiting",
    roundNumber: 0,
    cards: [],
    solvedById: null,
    solvedExpression: null,
    lastResults: [],
    skipVotes: {},
    chipBaseline: {},
    log: [],
    chat: []
  };
}


function makeRegicideRoom(id, name) {
  return {
    id,
    name,
    hostId: null,
    players: [],
    phase: "waiting",
    turnIndex: -1,
    handNumber: 0,
    playerDeck: [],
    enemyDeck: [],
    discard: [],
    battleZone: [],
    enemy: null,
    handLimits: {},
    jokerTokens: {},
    currentAttack: 0,
    lastPlayed: [],
    lastEffect: null,
    pendingJokerPlayerId: null,
    result: null,
    defeatEffect: null,
    loseEffect: null,
    defeatedBosses: [],
    chipBaseline: {},
    log: [],
    chat: []
  };
}


function makeGomokuRoom(id, name) {
  return {
    id,
    name,
    hostId: null,
    players: [],
    phase: "waiting",
    board: Array.from({ length: GOMOKU_SIZE }, () => Array(GOMOKU_SIZE).fill(null)),
    turnIndex: 0,
    winnerId: null,
    winningLine: [],
    result: null,
    log: [],
    chat: []
  };
}

function makeConnectFourRoom(id, name) {
  return {
    id,
    name,
    hostId: null,
    players: [],
    phase: "waiting",
    board: Array.from({ length: CONNECT_FOUR_ROWS }, () => Array(CONNECT_FOUR_COLS).fill(null)),
    turnIndex: 0,
    winnerId: null,
    winningLine: [],
    result: null,
    log: [],
    chat: []
  };
}

function addBigLog(bigRoom, message) {
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  bigRoom.log.unshift(`[${time}] ${message}`);
  bigRoom.log = bigRoom.log.slice(0, 90);
}

function updateBankruptcyCounts(bigRoom) {
  for (const player of bigRoom.players) {
    const previous = Number.isFinite(player.lastChips) ? player.lastChips : player.chips;
    if (previous > 0 && player.chips <= 0) {
      player.brokeCount = (player.brokeCount || 0) + 1;
    }
    player.lastChips = player.chips;
  }
}

function addPokerLog(table, message) {
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  table.log.unshift(`[${time}] ${message}`);
  table.log = table.log.slice(0, 90);
}

function getBigPlayer(bigRoom, playerId) {
  return bigRoom.players.find(p => p.id === playerId) || null;
}

function getCurrentGameRoom(bigRoom, player) {
  if (!player?.currentGameType || !player?.currentRoomId) return null;
  if (player.currentGameType === "poker") return bigRoom.pokerRooms.get(player.currentRoomId) || null;
  if (player.currentGameType === "blackjack") return bigRoom.blackjackRooms.get(player.currentRoomId) || null;
  if (player.currentGameType === "dice") return bigRoom.diceRooms.get(player.currentRoomId) || null;
  if (player.currentGameType === "werewolf") return bigRoom.werewolfRooms.get(player.currentRoomId) || null;
  if (player.currentGameType === "undercover") return bigRoom.undercoverRooms.get(player.currentRoomId) || null;
  if (player.currentGameType === "drawing") return bigRoom.drawingRooms.get(player.currentRoomId) || null;
  if (player.currentGameType === "twentyfour") return bigRoom.twentyFourRooms.get(player.currentRoomId) || null;
  if (player.currentGameType === "regicide") return bigRoom.regicideRooms.get(player.currentRoomId) || null;
  if (player.currentGameType === "gomoku") return bigRoom.gomokuRooms.get(player.currentRoomId) || null;
  if (player.currentGameType === "connectfour") return bigRoom.connectFourRooms.get(player.currentRoomId) || null;
  return null;
}

function findBigRoomBySocketId(socketId) {
  return [...bigRooms.values()].find(room => room.players.some(p => p.id === socketId)) || null;
}

function findPokerRoomContaining(bigRoom, playerId) {
  for (const table of bigRoom.pokerRooms.values()) {
    if (table.players.includes(playerId)) return table;
  }
  return null;
}

function findBlackjackRoomContaining(bigRoom, playerId) {
  for (const table of bigRoom.blackjackRooms.values()) {
    if (table.players.includes(playerId)) return table;
  }
  return null;
}

function findDiceRoomContaining(bigRoom, playerId) {
  for (const table of bigRoom.diceRooms.values()) {
    if (table.players.includes(playerId)) return table;
  }
  return null;
}

function findWerewolfRoomContaining(bigRoom, playerId) {
  for (const room of bigRoom.werewolfRooms.values()) {
    if (room.players.includes(playerId)) return room;
  }
  return null;
}

function findUndercoverRoomContaining(bigRoom, playerId) {
  for (const room of bigRoom.undercoverRooms.values()) {
    if (room.players.includes(playerId)) return room;
  }
  return null;
}

function findDrawingRoomContaining(bigRoom, playerId) {
  for (const room of bigRoom.drawingRooms.values()) {
    if (room.players.includes(playerId)) return room;
  }
  return null;
}

function findTwentyFourRoomContaining(bigRoom, playerId) {
  for (const room of bigRoom.twentyFourRooms.values()) {
    if (room.players.includes(playerId)) return room;
  }
  return null;
}

function findRegicideRoomContaining(bigRoom, playerId) {
  for (const room of bigRoom.regicideRooms.values()) {
    if (room.players.includes(playerId)) return room;
  }
  return null;
}


function findGomokuRoomContaining(bigRoom, playerId) {
  for (const room of bigRoom.gomokuRooms.values()) {
    if (room.players.includes(playerId)) return room;
  }
  return null;
}

function findConnectFourRoomContaining(bigRoom, playerId) {
  for (const room of bigRoom.connectFourRooms.values()) {
    if (room.players.includes(playerId)) return room;
  }
  return null;
}

function findAnyGameRoomContaining(bigRoom, playerId) {
  return (
    findPokerRoomContaining(bigRoom, playerId) ||
    findBlackjackRoomContaining(bigRoom, playerId) ||
    findDiceRoomContaining(bigRoom, playerId) ||
    findWerewolfRoomContaining(bigRoom, playerId) ||
    findUndercoverRoomContaining(bigRoom, playerId) ||
    findDrawingRoomContaining(bigRoom, playerId) ||
    findTwentyFourRoomContaining(bigRoom, playerId) ||
    findRegicideRoomContaining(bigRoom, playerId) ||
    findGomokuRoomContaining(bigRoom, playerId) ||
    findConnectFourRoomContaining(bigRoom, playerId)
  );
}

function publicChatBubble(player) {
  if (!player?.chatBubble) return null;
  return player.chatBubble;
}

function publicBigPlayer(bigRoom, player) {
  const currentRoom = getCurrentGameRoom(bigRoom, player);
  return {
    id: player.id,
    name: player.name,
    chips: player.chips,
    brokeCount: player.brokeCount || 0,
    diceCount: player.diceCount ?? STARTING_DICE,
    connected: player.connected,
    isBigHost: bigRoom.hostId === player.id,
    currentGameType: player.currentGameType,
    currentRoomId: player.currentRoomId,
    currentRoomName: currentRoom?.name || null,
    chatBubble: publicChatBubble(player),
    currentPokerRoomId: player.currentGameType === "poker" ? player.currentRoomId : null,
    currentPokerRoomName: player.currentGameType === "poker" ? currentRoom?.name || null : null
  };
}

function publicPokerRoomSummary(bigRoom, table) {
  const host = getBigPlayer(bigRoom, table.hostId);
  return {
    id: table.id,
    type: "poker",
    name: table.name,
    phase: table.phase,
    playerCount: table.players.length,
    maxPlayers: MAX_POKER_PLAYERS,
    hostId: table.hostId,
    hostName: host?.name || null
  };
}

function publicBlackjackRoomSummary(bigRoom, table) {
  const host = getBigPlayer(bigRoom, table.hostId);
  return {
    id: table.id,
    type: "blackjack",
    name: table.name,
    phase: table.phase,
    playerCount: table.players.length,
    maxPlayers: MAX_BLACKJACK_PLAYERS,
    hostId: table.hostId,
    hostName: host?.name || null
  };
}

function publicDiceRoomSummary(bigRoom, table) {
  const host = getBigPlayer(bigRoom, table.hostId);
  return {
    id: table.id,
    type: "dice",
    name: table.name,
    phase: table.phase,
    playerCount: table.players.length,
    maxPlayers: MAX_DICE_PLAYERS,
    hostId: table.hostId,
    hostName: host?.name || null
  };
}

function publicWerewolfRoomSummary(bigRoom, room) {
  const host = getBigPlayer(bigRoom, room.hostId);
  return {
    id: room.id,
    type: "werewolf",
    name: room.name,
    phase: room.phase,
    playerCount: room.players.length,
    maxPlayers: MAX_WEREWOLF_PLAYERS,
    hostId: room.hostId,
    hostName: host?.name || null
  };
}

function publicUndercoverRoomSummary(bigRoom, room) {
  const host = getBigPlayer(bigRoom, room.hostId);
  return {
    id: room.id,
    type: "undercover",
    name: room.name,
    phase: room.phase,
    playerCount: room.players.length,
    maxPlayers: MAX_UNDERCOVER_PLAYERS,
    hostId: room.hostId,
    hostName: host?.name || null
  };
}


function publicDrawingRoomSummary(bigRoom, room) {
  const host = getBigPlayer(bigRoom, room.hostId);
  return {
    id: room.id,
    type: "drawing",
    name: room.name,
    phase: room.phase,
    playerCount: room.players.length,
    maxPlayers: MAX_DRAWING_PLAYERS,
    hostId: room.hostId,
    hostName: host?.name || null
  };
}


function publicTwentyFourRoomSummary(bigRoom, room) {
  const host = getBigPlayer(bigRoom, room.hostId);
  return {
    id: room.id,
    type: "twentyfour",
    name: room.name,
    phase: room.phase,
    playerCount: room.players.length,
    maxPlayers: MAX_TWENTYFOUR_PLAYERS,
    hostId: room.hostId,
    hostName: host?.name || null
  };
}


function publicRegicideRoomSummary(bigRoom, room) {
  const host = getBigPlayer(bigRoom, room.hostId);
  return {
    id: room.id,
    type: "regicide",
    name: room.name,
    phase: room.phase,
    playerCount: room.players.length,
    maxPlayers: MAX_REGICIDE_PLAYERS,
    hostId: room.hostId,
    hostName: host?.name || null
  };
}


function publicGomokuRoomSummary(bigRoom, room) {
  const host = getBigPlayer(bigRoom, room.hostId);
  return {
    id: room.id,
    type: "gomoku",
    name: room.name,
    phase: room.phase,
    playerCount: room.players.length,
    maxPlayers: MAX_GOMOKU_PLAYERS,
    hostId: room.hostId,
    hostName: host?.name || null
  };
}

function publicConnectFourRoomSummary(bigRoom, room) {
  const host = getBigPlayer(bigRoom, room.hostId);
  return {
    id: room.id,
    type: "connectfour",
    name: room.name,
    phase: room.phase,
    playerCount: room.players.length,
    maxPlayers: MAX_CONNECT_FOUR_PLAYERS,
    hostId: room.hostId,
    hostName: host?.name || null
  };
}


function emitBigRoom(bigRoom) {
  updateBankruptcyCounts(bigRoom);

  for (const player of bigRoom.players) {
    const socket = io.sockets.sockets.get(player.id);
    if (!socket) continue;

    socket.emit("bigRoomState", {
      code: bigRoom.code,
      myId: player.id,
      hostId: bigRoom.hostId,
      players: bigRoom.players.map(p => publicBigPlayer(bigRoom, p)),
      pokerRooms: [...bigRoom.pokerRooms.values()].map(table => publicPokerRoomSummary(bigRoom, table)),
      blackjackRooms: [...bigRoom.blackjackRooms.values()].map(table => publicBlackjackRoomSummary(bigRoom, table)),
      diceRooms: [...bigRoom.diceRooms.values()].map(table => publicDiceRoomSummary(bigRoom, table)),
      werewolfRooms: [...bigRoom.werewolfRooms.values()].map(room => publicWerewolfRoomSummary(bigRoom, room)),
      undercoverRooms: [...bigRoom.undercoverRooms.values()].map(room => publicUndercoverRoomSummary(bigRoom, room)),
      drawingRooms: [...bigRoom.drawingRooms.values()].map(room => publicDrawingRoomSummary(bigRoom, room)),
      twentyFourRooms: [...bigRoom.twentyFourRooms.values()].map(room => publicTwentyFourRoomSummary(bigRoom, room)),
      regicideRooms: [...bigRoom.regicideRooms.values()].map(room => publicRegicideRoomSummary(bigRoom, room)),
      gomokuRooms: [...bigRoom.gomokuRooms.values()].map(room => publicGomokuRoomSummary(bigRoom, room)),
      connectFourRooms: [...bigRoom.connectFourRooms.values()].map(room => publicConnectFourRoomSummary(bigRoom, room)),
      gameRooms: [
        ...[...bigRoom.pokerRooms.values()].map(table => publicPokerRoomSummary(bigRoom, table)),
        ...[...bigRoom.blackjackRooms.values()].map(table => publicBlackjackRoomSummary(bigRoom, table)),
        ...[...bigRoom.diceRooms.values()].map(table => publicDiceRoomSummary(bigRoom, table)),
        ...[...bigRoom.werewolfRooms.values()].map(room => publicWerewolfRoomSummary(bigRoom, room)),
        ...[...bigRoom.undercoverRooms.values()].map(room => publicUndercoverRoomSummary(bigRoom, room)),
        ...[...bigRoom.drawingRooms.values()].map(room => publicDrawingRoomSummary(bigRoom, room)),
        ...[...bigRoom.twentyFourRooms.values()].map(room => publicTwentyFourRoomSummary(bigRoom, room)),
        ...[...bigRoom.regicideRooms.values()].map(room => publicRegicideRoomSummary(bigRoom, room)),
        ...[...bigRoom.gomokuRooms.values()].map(room => publicGomokuRoomSummary(bigRoom, room)),
        ...[...bigRoom.connectFourRooms.values()].map(room => publicConnectFourRoomSummary(bigRoom, room))
      ],
      log: bigRoom.log,
      chat: bigRoom.chat,
      startingChips: STARTING_CHIPS,
      diceCashValue: DICE_CASH_VALUE,
      diceExchangeMinimum: DICE_EXCHANGE_MINIMUM,
      maxDiceCount: MAX_DICE_COUNT,
      maxPokerPlayers: MAX_POKER_PLAYERS,
      maxBlackjackPlayers: MAX_BLACKJACK_PLAYERS,
      maxDicePlayers: MAX_DICE_PLAYERS,
      maxWerewolfPlayers: MAX_WEREWOLF_PLAYERS,
      maxUndercoverPlayers: MAX_UNDERCOVER_PLAYERS,
      maxDrawingPlayers: MAX_DRAWING_PLAYERS,
      maxTwentyFourPlayers: MAX_TWENTYFOUR_PLAYERS,
      maxRegicidePlayers: MAX_REGICIDE_PLAYERS,
      maxGomokuPlayers: MAX_GOMOKU_PLAYERS,
      maxConnectFourPlayers: MAX_CONNECT_FOUR_PLAYERS
    });
  }
}

function publicPokerSeat(bigRoom, table, playerId) {
  const player = getBigPlayer(bigRoom, playerId);
  const seat = table.seats[playerId] || emptySeat();

  return {
    id: playerId,
    name: player?.name || "Unknown",
    chips: player?.chips || 0,
    brokeCount: player?.brokeCount || 0,
    connected: Boolean(player?.connected),
    bet: seat.bet,
    totalBet: seat.totalBet || 0,
    brokeCount: player?.brokeCount || 0,
    folded: seat.folded,
    allIn: seat.allIn,
    inHand: seat.inHand,
    isBigHost: bigRoom.hostId === playerId,
    isPokerHost: table.hostId === playerId,
    isDealer: table.players[table.dealerIndex] === playerId,
    isTurn: table.players[table.turnIndex] === playerId,
    isLastWinner: table.lastWinnerId === playerId,
    cardsCount: seat.hand.length,
    chatBubble: publicChatBubble(player)
  };
}

function emitPokerRoom(bigRoom, table) {
  for (const playerId of table.players) {
    const socket = io.sockets.sockets.get(playerId);
    if (!socket) continue;

    const seat = table.seats[playerId] || emptySeat();

    socket.emit("pokerRoomState", {
      bigRoomCode: bigRoom.code,
      id: table.id,
      name: table.name,
      phase: table.phase,
      players: table.players.map(id => publicPokerSeat(bigRoom, table, id)),
      community: table.community,
      pot: table.pot,
      currentBet: table.currentBet,
      myId: playerId,
      myHand: seat.hand,
      turnPlayerId: table.players[table.turnIndex] || null,
      pokerHostId: table.hostId,
      bigHostId: bigRoom.hostId,
      lastWinnerId: table.lastWinnerId,
      log: table.log,
      chat: table.chat,
      winners: table.winners,
      revealedHands: table.revealedHands,
      smallBlind: SMALL_BLIND,
      bigBlind: BIG_BLIND,
      pokerAnte: POKER_ANTE,
      maxPlayers: MAX_POKER_PLAYERS
    });
  }
}

function emitEverything(bigRoom) {
  emitBigRoom(bigRoom);
  for (const table of bigRoom.pokerRooms.values()) {
    emitPokerRoom(bigRoom, table);
  }
  for (const table of bigRoom.blackjackRooms.values()) {
    emitBlackjackRoom(bigRoom, table);
  }
  for (const table of bigRoom.diceRooms.values()) {
    emitDiceRoom(bigRoom, table);
  }
  for (const room of bigRoom.werewolfRooms.values()) {
    emitWerewolfRoom(bigRoom, room);
  }
  for (const room of bigRoom.undercoverRooms.values()) {
    emitUndercoverRoom(bigRoom, room);
  }
  for (const room of bigRoom.drawingRooms.values()) {
    emitDrawingRoom(bigRoom, room);
  }
  for (const room of bigRoom.twentyFourRooms.values()) {
    emitTwentyFourRoom(bigRoom, room);
  }
  for (const room of bigRoom.regicideRooms.values()) {
    emitRegicideRoom(bigRoom, room);
  }
  for (const room of bigRoom.gomokuRooms.values()) {
    emitGomokuRoom(bigRoom, room);
  }
  for (const room of bigRoom.connectFourRooms.values()) {
    emitConnectFourRoom(bigRoom, room);
  }
}

function emptySeat() {
  return {
    hand: [],
    bet: 0,
    totalBet: 0,
    folded: false,
    allIn: false,
    hasActed: false,
    inHand: false
  };
}

function resetSeatForLobby(table, playerId) {
  table.seats[playerId] = emptySeat();
}

function activePlayers(bigRoom, table) {
  return table.players.filter(id => {
    const player = getBigPlayer(bigRoom, id);
    return player && player.connected && player.chips >= POKER_ANTE;
  });
}

function playersInHand(table) {
  return table.players.filter(id => table.seats[id]?.inHand);
}

function playersNotFolded(table) {
  return table.players.filter(id => {
    const seat = table.seats[id];
    return seat?.inHand && !seat.folded;
  });
}

function payablePlayers(table) {
  return table.players.filter(id => {
    const seat = table.seats[id];
    return seat?.inHand && !seat.folded && !seat.allIn;
  });
}

function nextIndex(table, startIndex, predicate) {
  const n = table.players.length;
  if (n === 0) return -1;

  for (let step = 1; step <= n; step++) {
    const idx = (((startIndex + step) % n) + n) % n;
    if (predicate(table.players[idx])) return idx;
  }
  return -1;
}

function collectBet(bigRoom, table, playerId, amount) {
  const player = getBigPlayer(bigRoom, playerId);
  const seat = table.seats[playerId];
  if (!player || !seat) return 0;

  const paid = Math.min(Math.max(0, amount), player.chips);
  player.chips -= paid;
  seat.bet += paid;
  seat.totalBet = (seat.totalBet || 0) + paid;
  table.pot += paid;

  if (player.chips === 0) seat.allIn = true;
  return paid;
}

function resetBets(table) {
  for (const playerId of table.players) {
    const seat = table.seats[playerId];
    if (!seat) continue;
    seat.bet = 0;
    seat.hasActed = false;
  }
  table.currentBet = 0;
  table.lastRaise = BIG_BLIND;
}

function startHand(bigRoom, table) {
  const eligible = activePlayers(bigRoom, table);
  if (eligible.length < 2) {
    addPokerLog(table, `Need at least 2 players with ${POKER_ANTE} chips to start.`);
    return;
  }

  table.handNumber += 1;
  table.phase = "preflop";
  table.deck = shuffle(createDeck());
  table.community = [];
  table.pot = 0;
  table.currentBet = 0;
  table.lastRaise = BIG_BLIND;
  table.winners = [];
  table.revealedHands = {};
  table.lastActionIndex = -1;

  // Ante-only poker: every connected player with enough chips pays 10 to enter the hand.
  // There are no blinds, so the first player can check immediately.
  for (const playerId of table.players) {
    const player = getBigPlayer(bigRoom, playerId);
    const seat = table.seats[playerId] || emptySeat();

    seat.hand = [];
    seat.bet = 0;
    seat.totalBet = 0;
    seat.folded = false;
    seat.allIn = false;
    seat.hasActed = false;
    seat.inHand = Boolean(player && player.connected && player.chips >= POKER_ANTE);

    table.seats[playerId] = seat;
  }

  const inHandIds = playersInHand(table);
  for (const playerId of inHandIds) {
    collectBet(bigRoom, table, playerId, POKER_ANTE);
    table.seats[playerId].bet = 0;
    table.seats[playerId].hasActed = false;
  }

  // Keep dealer marker moving clockwise for the visible "D" chip, but action order
  // is host first on the first hand, then previous winner first after that.
  if (table.dealerIndex < 0 || !table.seats[table.players[table.dealerIndex]]?.inHand) {
    table.dealerIndex = table.players.findIndex(id => table.seats[id]?.inHand);
  } else {
    table.dealerIndex = nextIndex(table, table.dealerIndex, id => table.seats[id]?.inHand);
  }

  for (let i = 0; i < 2; i++) {
    for (const playerId of table.players) {
      const seat = table.seats[playerId];
      if (seat?.inHand) seat.hand.push(table.deck.pop());
    }
  }

  const previousWinnerIndex = table.players.findIndex(id => {
    const seat = table.seats[id];
    return id === table.lastWinnerId && seat?.inHand && !seat.folded && !seat.allIn;
  });

  const hostIndex = table.players.findIndex(id => {
    const seat = table.seats[id];
    return id === table.hostId && seat?.inHand && !seat.folded && !seat.allIn;
  });

  const fallbackIndex = table.players.findIndex(id => {
    const seat = table.seats[id];
    return seat?.inHand && !seat.folded && !seat.allIn;
  });

  table.turnIndex = previousWinnerIndex >= 0
    ? previousWinnerIndex
    : hostIndex >= 0
      ? hostIndex
      : fallbackIndex;

  addPokerLog(table, `Hand #${table.handNumber} started. ${inHandIds.length} players ante ${POKER_ANTE} each. No blinds — first player may check.`);

  if (previousWinnerIndex >= 0) {
    const winner = getBigPlayer(bigRoom, table.players[previousWinnerIndex]);
    addPokerLog(table, `${winner?.name || "Previous winner"} won the previous hand, so they act first this hand.`);
  } else if (hostIndex >= 0) {
    const host = getBigPlayer(bigRoom, table.hostId);
    addPokerLog(table, `${host?.name || "Poker host"} acts first this hand.`);
  }
}

function bettingRoundComplete(table) {
  const candidates = payablePlayers(table);
  if (candidates.length === 0) return true;

  return candidates.every(id => {
    const seat = table.seats[id];
    return seat.hasActed && seat.bet === table.currentBet;
  });
}

function startBettingRound(bigRoom, table, phase) {
  table.phase = phase;
  resetBets(table);

  // Continue clockwise from the player who ended the previous betting round.
  // This prevents the same player from checking, opening the next street,
  // and immediately acting again.
  const baseIndex = Number.isInteger(table.lastActionIndex) && table.lastActionIndex >= 0
    ? table.lastActionIndex
    : table.turnIndex;

  table.turnIndex = nextIndex(table, baseIndex, id => {
    const seat = table.seats[id];
    return seat?.inHand && !seat.folded && !seat.allIn;
  });

  addPokerLog(table, `${phase.toUpperCase()} betting round started.`);

  if (bettingRoundComplete(table)) {
    advancePhase(bigRoom, table);
  }
}

function advancePhase(bigRoom, table) {
  const alive = playersNotFolded(table);

  if (alive.length === 1) {
    finishByFold(bigRoom, table, alive[0]);
    return;
  }

  if (table.phase === "preflop") {
    table.community.push(table.deck.pop(), table.deck.pop(), table.deck.pop());
    startBettingRound(bigRoom, table, "flop");
  } else if (table.phase === "flop") {
    table.community.push(table.deck.pop());
    startBettingRound(bigRoom, table, "turn");
  } else if (table.phase === "turn") {
    table.community.push(table.deck.pop());
    startBettingRound(bigRoom, table, "river");
  } else if (table.phase === "river") {
    showdown(bigRoom, table);
  }
}

function moveTurn(bigRoom, table) {
  if (bettingRoundComplete(table)) {
    advancePhase(bigRoom, table);
    return;
  }

  table.turnIndex = nextIndex(table, table.turnIndex, id => {
    const seat = table.seats[id];
    return seat?.inHand && !seat.folded && !seat.allIn;
  });
}

function finishByFold(bigRoom, table, winnerId) {
  const winner = getBigPlayer(bigRoom, winnerId);
  if (winner) winner.chips += table.pot;

  table.lastWinnerId = winnerId;
  table.winners = [{
    id: winnerId,
    name: winner?.name || "Winner",
    amount: table.pot,
    handName: "Everyone else folded"
  }];

  addPokerLog(table, `${winner?.name || "Winner"} wins ${table.pot}; everyone else folded.`);
  table.phase = "showdown";
  table.turnIndex = -1;
  table.pot = 0;
}


function showPokerCards(bigRoom, table, playerId, indices) {
  const player = getBigPlayer(bigRoom, playerId);
  const seat = table.seats[playerId];

  if (!player || !seat || !seat.hand || seat.hand.length === 0) {
    return { ok: false, message: "You do not have cards to show." };
  }

  const cleanIndices = [...new Set((Array.isArray(indices) ? indices : [])
    .map(Number)
    .filter(index => Number.isInteger(index) && index >= 0 && index < seat.hand.length))];

  if (cleanIndices.length === 0) {
    return { ok: false, message: "Choose at least one card to show." };
  }

  const shownCards = cleanIndices.map(index => seat.hand[index]);
  const already = table.revealedHands[playerId] || {};
  const alreadyCards = Array.isArray(already.hand) ? already.hand : [];

  const merged = [...alreadyCards];
  for (const card of shownCards) {
    if (!merged.some(existing => existing.suit === card.suit && existing.rank === card.rank && existing.value === card.value)) {
      merged.push(card);
    }
  }

  table.revealedHands[playerId] = {
    hand: merged,
    handName: merged.length >= seat.hand.length ? "Shown hand" : "Shown card",
    voluntary: true
  };

  addPokerLog(table, `${player.name} shows ${shownCards.map(card => `${card.rank}${card.suit}`).join(" ")}.`);
  return { ok: true };
}

function compareScores(a, b) {
  if (a.category !== b.category) return a.category - b.category;
  for (let i = 0; i < Math.max(a.tiebreakers.length, b.tiebreakers.length); i++) {
    const av = a.tiebreakers[i] || 0;
    const bv = b.tiebreakers[i] || 0;
    if (av !== bv) return av - bv;
  }
  return 0;
}

function combinations(arr, k) {
  const result = [];
  function backtrack(start, combo) {
    if (combo.length === k) {
      result.push(combo.slice());
      return;
    }
    for (let i = start; i <= arr.length - (k - combo.length); i++) {
      combo.push(arr[i]);
      backtrack(i + 1, combo);
      combo.pop();
    }
  }
  backtrack(0, []);
  return result;
}

function handCategoryName(score) {
  const names = [
    "High Card",
    "One Pair",
    "Two Pair",
    "Three of a Kind",
    "Straight",
    "Flush",
    "Full House",
    "Four of a Kind",
    "Straight Flush"
  ];
  return names[score.category] || "Unknown";
}

function straightHigh(uniqueDesc) {
  const values = [...uniqueDesc];

  if (values.includes(14)) values.push(1);

  for (let i = 0; i <= values.length - 5; i++) {
    const slice = values.slice(i, i + 5);
    let ok = true;
    for (let j = 1; j < slice.length; j++) {
      if (slice[j] !== slice[j - 1] - 1) {
        ok = false;
        break;
      }
    }
    if (ok) return slice[0] === 1 ? 5 : slice[0];
  }
  return null;
}

function evaluate5(cards) {
  const values = cards.map(c => c.value).sort((a, b) => b - a);
  const uniqueDesc = [...new Set(values)].sort((a, b) => b - a);
  const isFlush = cards.every(c => c.suit === cards[0].suit);
  const sHigh = straightHigh(uniqueDesc);

  const counts = new Map();
  for (const v of values) counts.set(v, (counts.get(v) || 0) + 1);

  const groups = [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return b.value - a.value;
    });

  if (isFlush && sHigh) return { category: 8, tiebreakers: [sHigh] };

  if (groups[0].count === 4) {
    const quad = groups[0].value;
    const kicker = groups.find(g => g.value !== quad).value;
    return { category: 7, tiebreakers: [quad, kicker] };
  }

  if (groups[0].count === 3 && groups[1]?.count === 2) {
    return { category: 6, tiebreakers: [groups[0].value, groups[1].value] };
  }

  if (isFlush) return { category: 5, tiebreakers: values };
  if (sHigh) return { category: 4, tiebreakers: [sHigh] };

  if (groups[0].count === 3) {
    const trip = groups[0].value;
    const kickers = groups.filter(g => g.value !== trip).map(g => g.value).sort((a, b) => b - a);
    return { category: 3, tiebreakers: [trip, ...kickers] };
  }

  if (groups[0].count === 2 && groups[1]?.count === 2) {
    const pairs = groups.filter(g => g.count === 2).map(g => g.value).sort((a, b) => b - a);
    const kicker = groups.filter(g => g.count === 1).map(g => g.value).sort((a, b) => b - a)[0];
    return { category: 2, tiebreakers: [...pairs, kicker] };
  }

  if (groups[0].count === 2) {
    const pair = groups[0].value;
    const kickers = groups.filter(g => g.value !== pair).map(g => g.value).sort((a, b) => b - a);
    return { category: 1, tiebreakers: [pair, ...kickers] };
  }

  return { category: 0, tiebreakers: values };
}

function evaluate7(cards) {
  let best = null;
  for (const combo of combinations(cards, 5)) {
    const score = evaluate5(combo);
    if (!best || compareScores(score, best.score) > 0) {
      best = { score, cards: combo };
    }
  }

  return {
    score: best.score,
    name: handCategoryName(best.score),
    cards: best.cards
  };
}

function buildPokerSidePots(table) {
  const contributors = table.players
    .map(playerId => ({
      playerId,
      contribution: Math.max(0, table.seats[playerId]?.totalBet || 0),
      folded: Boolean(table.seats[playerId]?.folded)
    }))
    .filter(item => item.contribution > 0);

  const levels = [...new Set(contributors.map(item => item.contribution))].sort((a, b) => a - b);
  const pots = [];
  let previous = 0;

  for (const level of levels) {
    const eligibleContributors = contributors.filter(item => item.contribution >= level);
    const amount = (level - previous) * eligibleContributors.length;
    const contenders = eligibleContributors
      .filter(item => !item.folded && table.seats[item.playerId]?.inHand)
      .map(item => item.playerId);

    if (amount > 0 && contenders.length > 0) {
      pots.push({ amount, contenders });
    }

    previous = level;
  }

  return pots;
}

function showdown(bigRoom, table) {
  const alive = playersNotFolded(table);
  const evaluations = new Map();

  for (const playerId of alive) {
    evaluations.set(playerId, {
      playerId,
      player: getBigPlayer(bigRoom, playerId),
      evaluation: evaluate7([...(table.seats[playerId]?.hand || []), ...table.community])
    });
  }

  const pots = buildPokerSidePots(table);
  const orderedWinners = [];
  const winnings = new Map();
  const bestHandNames = new Map();

  for (const pot of pots) {
    const contenders = pot.contenders
      .map(id => evaluations.get(id))
      .filter(Boolean)
      .sort((a, b) => compareScores(b.evaluation.score, a.evaluation.score));

    if (!contenders.length) continue;

    const bestScore = contenders[0].evaluation.score;
    const potWinners = contenders.filter(item => compareScores(item.evaluation.score, bestScore) === 0);
    const tableOrderPotWinners = table.players
      .filter(id => potWinners.some(w => w.playerId === id));

    const splitAmount = Math.floor(pot.amount / tableOrderPotWinners.length);
    let remainder = pot.amount - splitAmount * tableOrderPotWinners.length;

    for (const winnerId of tableOrderPotWinners) {
      const amount = splitAmount + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder -= 1;

      const winner = getBigPlayer(bigRoom, winnerId);
      if (winner) winner.chips += amount;

      winnings.set(winnerId, (winnings.get(winnerId) || 0) + amount);
      const evaluation = evaluations.get(winnerId)?.evaluation;
      bestHandNames.set(winnerId, evaluation?.name || "Winning hand");

      if (!orderedWinners.includes(winnerId)) orderedWinners.push(winnerId);
    }
  }

  // Fallback for older rooms / corrupted state: split full pot among best hands.
  if (!winnings.size && alive.length) {
    const evaluated = alive.map(id => evaluations.get(id)).filter(Boolean)
      .sort((a, b) => compareScores(b.evaluation.score, a.evaluation.score));
    const bestScore = evaluated[0].evaluation.score;
    const winners = evaluated.filter(x => compareScores(x.evaluation.score, bestScore) === 0);
    const splitAmount = Math.floor(table.pot / winners.length);
    let remainder = table.pot - splitAmount * winners.length;

    for (const item of winners) {
      const amount = splitAmount + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder -= 1;
      if (item.player) item.player.chips += amount;
      winnings.set(item.playerId, amount);
      bestHandNames.set(item.playerId, item.evaluation.name);
      orderedWinners.push(item.playerId);
    }
  }

  table.lastWinnerId = orderedWinners[0] || alive[0] || null;
  table.winners = orderedWinners.map(id => {
    const player = getBigPlayer(bigRoom, id);
    return {
      id,
      name: player?.name || "Winner",
      amount: winnings.get(id) || 0,
      handName: bestHandNames.get(id) || "Winning hand"
    };
  });

  table.revealedHands = {};
  for (const [playerId, item] of evaluations.entries()) {
    table.revealedHands[playerId] = {
      hand: table.seats[playerId]?.hand || [],
      handName: item.evaluation.name,
      bestCards: item.evaluation.cards
    };
  }

  const winnerText = table.winners
    .map(w => `${w.name} +${w.amount}`)
    .join(", ");
  addPokerLog(table, `${winnerText} after side-pot split.`);

  table.phase = "showdown";
  table.turnIndex = -1;
  table.pot = 0;
}

function handlePokerAction(socket, payload) {
  const bigRoom = findBigRoomBySocketId(socket.id);
  if (!bigRoom) return;

  const table = findPokerRoomContaining(bigRoom, socket.id);
  if (!table) {
    socket.emit("errorMessage", "You are not inside a poker room.");
    return;
  }

  const currentPlayerId = table.players[table.turnIndex];
  if (currentPlayerId !== socket.id) {
    socket.emit("errorMessage", "It is not your turn.");
    return;
  }

  const player = getBigPlayer(bigRoom, socket.id);
  const seat = table.seats[socket.id];
  if (!player || !seat) return;

  const action = payload?.action;
  const raiseAmount = Math.max(0, Number(payload?.amount || 0));
  const toCall = Math.max(0, table.currentBet - seat.bet);

  if (action === "fold") {
    seat.folded = true;
    seat.hasActed = true;
    addPokerLog(table, `${player.name} folds.`);
  } else if (action === "check") {
    if (toCall !== 0) {
      socket.emit("errorMessage", `You cannot check. You need to call ${toCall}.`);
      return;
    }
    seat.hasActed = true;
    addPokerLog(table, `${player.name} checks.`);
  } else if (action === "call") {
    const paid = collectBet(bigRoom, table, socket.id, toCall);
    seat.hasActed = true;
    addPokerLog(table, `${player.name} calls ${paid}.`);
  } else if (action === "raise") {
    const totalNeeded = toCall + raiseAmount;

    if (raiseAmount < BIG_BLIND && player.chips > totalNeeded) {
      socket.emit("errorMessage", `Minimum raise is ${BIG_BLIND}.`);
      return;
    }

    const oldCurrentBet = table.currentBet;
    const paid = collectBet(bigRoom, table, socket.id, totalNeeded);
    const newBet = seat.bet;

    if (newBet > oldCurrentBet) {
      table.currentBet = newBet;
      table.lastRaise = newBet - oldCurrentBet;

      for (const playerId of table.players) {
        const otherSeat = table.seats[playerId];
        if (otherSeat?.inHand && !otherSeat.folded && !otherSeat.allIn && playerId !== socket.id) {
          otherSeat.hasActed = false;
        }
      }

      addPokerLog(table, `${player.name} raises by ${newBet - oldCurrentBet}.`);
    } else {
      addPokerLog(table, `${player.name} calls all-in with ${paid}.`);
    }

    seat.hasActed = true;
  } else {
    socket.emit("errorMessage", "Unknown action.");
    return;
  }

  table.lastActionIndex = table.players.indexOf(socket.id);

  if (playersNotFolded(table).length === 1) {
    finishByFold(bigRoom, table, playersNotFolded(table)[0]);
  } else {
    moveTurn(bigRoom, table);
  }

  emitEverything(bigRoom);
}

function ensureNotRunning(table) {
  return !RUNNING_PHASES.has(table.phase);
}

function isGameRoomRunning(room) {
  return (
    RUNNING_PHASES.has(room.phase) ||
    room.phase === "playerTurns" ||
    room.phase === "dealerTurn" ||
    room.phase === "betting" ||
    room.phase === "bidding" ||
    room.phase === "day" ||
    room.phase === "night" ||
    room.phase === "discussion" ||
    room.phase === "voting" ||
    room.phase === "prompt" ||
    room.phase === "draw" ||
    room.phase === "guess" ||
    room.phase === "rating" ||
    room.phase === "playing" ||
    room.phase === "defending" ||
    room.phase === "chooseNext" ||
    (room.phase === "playing" && (Array.isArray(room.board) || room.winningLine))
  );
}


function removeFromPokerRoom(bigRoom, table, playerId, reason = "left the poker room") {
  const index = table.players.indexOf(playerId);
  if (index === -1) return;

  const player = getBigPlayer(bigRoom, playerId);
  const wasTurn = table.players[table.turnIndex] === playerId;
  const currentTurnId = table.players[table.turnIndex] || null;
  const dealerId = table.players[table.dealerIndex] || null;
  const running = RUNNING_PHASES.has(table.phase);

  if (running) {
    const seat = table.seats[playerId];
    if (seat?.inHand) {
      seat.folded = true;
      seat.hasActed = true;
      addPokerLog(table, `${player?.name || "A player"} ${reason} and folded.`);
    }

    table.players.splice(index, 1);
    delete table.seats[playerId];

    const newDealerIndex = table.players.findIndex(id => id === dealerId);
    table.dealerIndex = newDealerIndex >= 0 ? newDealerIndex : Math.min(index, table.players.length - 1);

    if (table.players.length === 0) return;

    if (playersNotFolded(table).length === 1) {
      finishByFold(bigRoom, table, playersNotFolded(table)[0]);
    } else if (wasTurn) {
      table.turnIndex = index - 1;
      moveTurn(bigRoom, table);
    } else {
      const newTurnIndex = table.players.findIndex(id => id === currentTurnId);
      if (newTurnIndex >= 0) table.turnIndex = newTurnIndex;
      if (bettingRoundComplete(table)) advancePhase(bigRoom, table);
    }
  } else {
    table.players.splice(index, 1);
    delete table.seats[playerId];
    addPokerLog(table, `${player?.name || "A player"} ${reason}.`);
  }

  if (table.hostId === playerId) {
    table.hostId = table.players[0] || null;
    const newHost = getBigPlayer(bigRoom, table.hostId);
    if (newHost) addPokerLog(table, `${newHost.name} is now the poker room host.`);
  }

  if (player && player.currentGameType === "poker" && player.currentRoomId === table.id) {
    player.currentGameType = null;
    player.currentRoomId = null;
  }

  if (table.players.length === 0) {
    bigRoom.pokerRooms.delete(table.id);
    addBigLog(bigRoom, `${table.name} was removed because it became empty.`);
  }
}


function cardValueBlackjack(card) {
  return Math.min(card.value, 10);
}

function blackjackTotal(hand) {
  let total = 0;
  let aces = 0;
  for (const card of hand) {
    if (card.value === 14) {
      aces += 1;
      total += 11;
    } else {
      total += cardValueBlackjack(card);
    }
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }
  return total;
}

function isBlackjackTenValue(card) {
  return Boolean(card) && cardValueBlackjack(card) === 10;
}

function dealerShouldPeekForBlackjack(hand) {
  return hand.length >= 2 && (hand[0]?.value === 14 || isBlackjackTenValue(hand[0]));
}

function isDealerBlackjack(table) {
  return table.dealerHand.length === 2 && blackjackTotal(table.dealerHand) === 21;
}

function isDealerFiveCardWin(table) {
  return table.dealerHand.length >= 5 && blackjackTotal(table.dealerHand) <= 21;
}

function blackjackBettorIds(table) {
  const dealerId = table.players[table.dealerIndex];
  return table.players.filter(id => id !== dealerId && table.seats[id]?.bet > 0);
}

function allBlackjackBettorsBust(table) {
  const bettors = blackjackBettorIds(table);
  return bettors.length > 0 && bettors.every(id => {
    const seat = table.seats[id];
    return seat?.status === "bust" || blackjackTotal(seat?.hand || []) > 21;
  });
}

function addBlackjackLog(table, message) {
  addPokerLog(table, message);
}

function activeBlackjackPlayers(bigRoom, table) {
  return table.players.filter(id => {
    const player = getBigPlayer(bigRoom, id);
    return player && player.connected && player.chips >= BLACKJACK_MIN_BET;
  });
}

function publicBlackjackSeat(bigRoom, table, playerId, viewerId = null) {
  const player = getBigPlayer(bigRoom, playerId);
  const seat = table.seats[playerId] || {
    hand: [],
    bet: 0,
    insuranceBet: 0,
    status: "waiting",
    result: null,
    selectedBet: BLACKJACK_BET
  };

  const isDealer = table.players[table.dealerIndex] === playerId;
  const dealerHoleHidden = table.phase === "playerTurns" && table.dealerHand.length >= 2;
  const hand = isDealer
    ? dealerHoleHidden
      ? [table.dealerHand[0], null]
      : table.dealerHand || []
    : seat.hand || [];
  const total = isDealer && dealerHoleHidden
    ? blackjackTotal([table.dealerHand[0]])
    : blackjackTotal(hand);

  return {
    id: playerId,
    name: player?.name || "Unknown",
    chips: player?.chips || 0,
    brokeCount: player?.brokeCount || 0,
    connected: Boolean(player?.connected),
    bet: seat.bet || 0,
    selectedBet: seat.selectedBet || BLACKJACK_BET,
    insuranceBet: seat.insuranceBet || 0,
    hand,
    total,
    status: isDealer ? "dealer" : seat.status || "waiting",
    result: seat.result || null,
    payout: seat.payout || 0,
    canDouble: table.phase === "playerTurns" && seat.status === "playing" && !isDealer && (seat.hand || []).length === 2 && player && player.chips >= (seat.bet || 0),
    canInsurance: table.phase === "playerTurns" && table.dealerHand?.[0]?.value === 14 && seat.status === "playing" && !isDealer && !seat.insuranceTaken && player && player.chips >= Math.ceil((seat.bet || 0) / 2),
    isDealer,
    isBigHost: bigRoom.hostId === playerId,
    isBlackjackHost: table.hostId === playerId,
    isTurn: table.players[table.turnIndex] === playerId,
    chatBubble: publicChatBubble(player)
  };
}

function emitBlackjackRoom(bigRoom, table) {
  const hideHole = table.phase === "playerTurns" && table.dealerHand.length >= 2;
  const dealerHandForPlayers = hideHole ? [table.dealerHand[0], null] : table.dealerHand;

  for (const playerId of table.players) {
    const socket = io.sockets.sockets.get(playerId);
    if (!socket) continue;
    socket.emit("blackjackRoomState", {
      bigRoomCode: bigRoom.code,
      id: table.id,
      name: table.name,
      phase: table.phase,
      players: table.players.map(id => publicBlackjackSeat(bigRoom, table, id, playerId)),
      dealerHand: dealerHandForPlayers,
      dealerHoleHidden: hideHole,
      dealerTotal: hideHole ? blackjackTotal([table.dealerHand[0]]) : blackjackTotal(table.dealerHand),
      myId: playerId,
      hostId: table.hostId,
      bigHostId: bigRoom.hostId,
      bet: BLACKJACK_BET,
      minBet: BLACKJACK_MIN_BET,
      betStep: BLACKJACK_BET_STEP,
      log: table.log,
      chat: table.chat,
      results: table.results,
      maxPlayers: MAX_BLACKJACK_PLAYERS
    });
  }
}


function nextBlackjackDealerIndex(bigRoom, table) {
  const n = table.players.length;
  if (n === 0) return -1;

  for (let step = 1; step <= n; step++) {
    const idx = (((table.dealerIndex + step) % n) + n) % n;
    const player = getBigPlayer(bigRoom, table.players[idx]);
    if (player && player.connected) return idx;
  }

  return -1;
}

function startBlackjackBetting(bigRoom, table) {
  if (table.players.length < 2) {
    addBlackjackLog(table, "Need at least 2 players: 1 dealer and at least 1 betting player.");
    return;
  }

  table.dealerIndex = nextBlackjackDealerIndex(bigRoom, table);
  const dealerId = table.players[table.dealerIndex];
  const dealer = getBigPlayer(bigRoom, dealerId);

  if (!dealer) {
    addBlackjackLog(table, "No available dealer.");
    return;
  }

  const bettingPlayers = table.players.filter(id => {
    const player = getBigPlayer(bigRoom, id);
    return id !== dealerId && player && player.connected && player.chips >= BLACKJACK_MIN_BET;
  });

  if (bettingPlayers.length < 1) {
    addBlackjackLog(table, "Need at least 1 non-dealer player with enough chips to bet.");
    return;
  }

  table.roundNumber += 1;
  table.phase = "betting";
  table.deck = [];
  table.dealerHand = [];
  table.results = [];
  table.turnIndex = -1;

  for (const playerId of table.players) {
    const player = getBigPlayer(bigRoom, playerId);
    const isDealer = playerId === dealerId;
    const canBet = !isDealer && player && player.connected && player.chips >= BLACKJACK_MIN_BET;

    table.seats[playerId] = {
      hand: [],
      bet: 0,
      selectedBet: Math.min(BLACKJACK_BET, player?.chips || BLACKJACK_BET),
      insuranceBet: 0,
      insuranceTaken: false,
      status: isDealer ? "dealer" : canBet ? "betting" : "waiting",
      result: isDealer ? "dealer" : canBet ? null : "Not enough chips",
      payout: 0
    };
  }

  addBlackjackLog(table, `Blackjack round #${table.roundNumber}: ${dealer.name} is the dealer. Betting is open.`);
}

function dealBlackjackRound(bigRoom, table) {
  const dealerId = table.players[table.dealerIndex];
  const bettors = table.players.filter(id => id !== dealerId && table.seats[id]?.status === "betPlaced" && table.seats[id].bet > 0);
  if (bettors.length < 1) return false;

  table.phase = "playerTurns";
  table.deck = shuffle(createDeck());
  table.dealerHand = [];

  for (const id of bettors) {
    table.seats[id].hand = [];
    table.seats[id].status = "playing";
    table.seats[id].result = null;
    table.seats[id].payout = 0;
  }

  for (let i = 0; i < 2; i++) {
    for (const id of bettors) {
      table.seats[id].hand.push(table.deck.pop());
    }
    table.dealerHand.push(table.deck.pop());
  }

  const dealer = getBigPlayer(bigRoom, dealerId);
  addBlackjackLog(table, `Cards dealt. ${dealer?.name || "Dealer"} shows ${table.dealerHand[0].rank}${table.dealerHand[0].suit}.`);

  if (dealerShouldPeekForBlackjack(table.dealerHand)) {
    addBlackjackLog(table, `${dealer?.name || "Dealer"} checks the hole card for blackjack.`);
    if (isDealerBlackjack(table)) {
      addBlackjackLog(table, `${dealer?.name || "Dealer"} has blackjack. Revealing and settling immediately.`);
      finishBlackjackDealer(bigRoom, table);
      return true;
    }
  }

  advanceBlackjackTurn(bigRoom, table);
  return true;
}

function allRequiredBlackjackBetsPlaced(table) {
  const dealerId = table.players[table.dealerIndex];
  const required = table.players.filter(id => id !== dealerId && table.seats[id]?.status !== "waiting");
  return required.length > 0 && required.every(id => table.seats[id]?.status === "betPlaced" && table.seats[id]?.bet > 0);
}

function advanceBlackjackTurn(bigRoom, table) {
  if (allBlackjackBettorsBust(table)) {
    const dealerId = table.players[table.dealerIndex];
    const dealer = getBigPlayer(bigRoom, dealerId);
    addBlackjackLog(table, `All betting players busted. ${dealer?.name || "Dealer"} does not need to hit.`);
    finishBlackjackDealer(bigRoom, table);
    return;
  }

  const idx = table.players.findIndex(id => table.seats[id]?.status === "playing");
  if (idx === -1) {
    beginBlackjackDealerTurn(bigRoom, table);
    return;
  }
  table.turnIndex = idx;
}

function beginBlackjackDealerTurn(bigRoom, table) {
  table.phase = "dealerTurn";
  table.turnIndex = table.dealerIndex;
  const dealerId = table.players[table.dealerIndex];
  const dealer = getBigPlayer(bigRoom, dealerId);
  addBlackjackLog(table, `${dealer?.name || "Dealer"}'s turn. Dealer must hit below 17 and stand on 17 or higher.`);
}

function finishBlackjackDealer(bigRoom, table) {
  const dealerId = table.players[table.dealerIndex];
  const dealer = getBigPlayer(bigRoom, dealerId);
  const dealerBlackjack = isDealerBlackjack(table);
  const dealerFiveCardWin = isDealerFiveCardWin(table);
  const dealerTotal = blackjackTotal(table.dealerHand);
  table.results = [];

  for (const playerId of table.players) {
    if (playerId === dealerId) continue;

    const player = getBigPlayer(bigRoom, playerId);
    const seat = table.seats[playerId];
    if (!player || !seat || seat.bet <= 0) continue;

    const total = blackjackTotal(seat.hand);
    let result = "";
    let playerReturn = 0;
    let dealerDelta = 0;
    let insuranceReturn = 0;

    if (seat.insuranceBet > 0) {
      if (dealerBlackjack) {
        insuranceReturn = seat.insuranceBet * 3;
        player.chips += insuranceReturn;
        dealerDelta -= insuranceReturn;
      } else {
        dealerDelta += seat.insuranceBet;
      }
    }

    if (seat.status === "bust" || total > 21) {
      result = "lost";
      playerReturn = 0;
      dealerDelta += seat.bet;
    } else if (dealerFiveCardWin) {
      result = "lost";
      playerReturn = 0;
      dealerDelta += seat.bet;
    } else if (dealerBlackjack && total !== 21) {
      result = "lost";
      playerReturn = 0;
      dealerDelta += seat.bet;
    } else if (dealerTotal > 21 || total > dealerTotal) {
      result = "won";
      playerReturn = seat.bet * 2;
      player.chips += playerReturn;
      dealerDelta -= seat.bet;
    } else if (total === dealerTotal) {
      result = "push";
      playerReturn = seat.bet;
      player.chips += playerReturn;
    } else {
      result = "lost";
      playerReturn = 0;
      dealerDelta += seat.bet;
    }

    if (dealer) dealer.chips += dealerDelta;

    seat.status = "done";
    seat.result = result;
    seat.payout = playerReturn + insuranceReturn;
    table.results.push({
      id: playerId,
      name: player.name,
      result,
      total,
      bet: seat.bet,
      payout: playerReturn,
      insurancePayout: insuranceReturn,
      dealerDelta
    });
  }

  table.phase = "roundEnd";
  table.turnIndex = -1;
  const endReason = dealerFiveCardWin
    ? ` with five cards and no bust`
    : dealerBlackjack
      ? ` with blackjack`
      : "";
  addBlackjackLog(table, `${dealer?.name || "Dealer"} finishes on ${dealerTotal}${endReason}. Round ended.`);
}

function handleBlackjackAction(socket, payload) {
  const bigRoom = findBigRoomBySocketId(socket.id);
  if (!bigRoom) return;
  const table = findBlackjackRoomContaining(bigRoom, socket.id);
  if (!table) {
    socket.emit("errorMessage", "You are not inside a blackjack room.");
    return;
  }

  const action = payload?.action;

  if (action === "start") {
    if (table.hostId !== socket.id) {
      socket.emit("errorMessage", "Only the blackjack room host can open betting.");
      return;
    }
    if (table.phase !== "waiting" && table.phase !== "roundEnd") {
      socket.emit("errorMessage", "A blackjack round is already running.");
      return;
    }
    startBlackjackBetting(bigRoom, table);
    emitEverything(bigRoom);
    return;
  }

  if (action === "deal") {
    socket.emit("errorMessage", "Cards are dealt automatically after all non-dealer players place bets.");
    return;
  }

  const player = getBigPlayer(bigRoom, socket.id);
  const seat = table.seats[socket.id];
  if (!player || !seat) return;

  if (action === "placeBet") {
    const dealerId = table.players[table.dealerIndex];
    if (socket.id === dealerId) {
      socket.emit("errorMessage", "The dealer does not place a player bet this round.");
      return;
    }

    if (table.phase !== "betting" || seat.status !== "betting") {
      socket.emit("errorMessage", "You cannot place a bet right now.");
      return;
    }

    let amount = Math.floor(Number(payload?.amount || 0) / BLACKJACK_BET_STEP) * BLACKJACK_BET_STEP;
    amount = Math.max(BLACKJACK_MIN_BET, amount);

    if (amount > player.chips) {
      socket.emit("errorMessage", "You do not have enough chips for that bet.");
      return;
    }

    player.chips -= amount;
    seat.bet = amount;
    seat.selectedBet = amount;
    seat.status = "betPlaced";
    addBlackjackLog(table, `${player.name} bets ${amount} against the dealer.`);

    if (allRequiredBlackjackBetsPlaced(table)) {
      addBlackjackLog(table, "All required bets are in. Dealing cards automatically.");
      dealBlackjackRound(bigRoom, table);
    }

    emitEverything(bigRoom);
    return;
  }

  const dealerId = table.players[table.dealerIndex];

  if (table.phase === "dealerTurn") {
    if (socket.id !== dealerId || table.players[table.turnIndex] !== socket.id) {
      socket.emit("errorMessage", "It is not your dealer turn.");
      return;
    }

    const dealerTotal = blackjackTotal(table.dealerHand);

    if (action === "hit") {
      if (dealerTotal >= 17) {
        socket.emit("errorMessage", "Dealer cannot hit on 17 or higher.");
        return;
      }
      if (table.dealerHand.length >= 5) {
        socket.emit("errorMessage", "Dealer already has five cards.");
        return;
      }

      table.dealerHand.push(table.deck.pop());
      const newTotal = blackjackTotal(table.dealerHand);
      addBlackjackLog(table, `${player.name} hits as dealer and now has ${newTotal}.`);

      if (newTotal > 21) {
        addBlackjackLog(table, `${player.name} busts as dealer.`);
        finishBlackjackDealer(bigRoom, table);
      } else if (isDealerFiveCardWin(table)) {
        addBlackjackLog(table, `${player.name} has five cards without busting. Dealer wins against all remaining hands.`);
        finishBlackjackDealer(bigRoom, table);
      }

      emitEverything(bigRoom);
      return;
    }

    if (action === "stand") {
      if (dealerTotal < 17) {
        socket.emit("errorMessage", "Dealer must hit until reaching 17.");
        return;
      }

      addBlackjackLog(table, `${player.name} stands as dealer on ${dealerTotal}.`);
      finishBlackjackDealer(bigRoom, table);
      emitEverything(bigRoom);
      return;
    }

    socket.emit("errorMessage", "Dealer can only Hit or Stand right now.");
    return;
  }

  if (table.phase !== "playerTurns" || table.players[table.turnIndex] !== socket.id) {
    socket.emit("errorMessage", "It is not your blackjack turn.");
    return;
  }

  if (action === "hit") {
    seat.hand.push(table.deck.pop());
    const total = blackjackTotal(seat.hand);
    addBlackjackLog(table, `${player.name} hits and now has ${total}.`);
    if (total > 21) {
      seat.status = "bust";
      seat.result = "bust";
      addBlackjackLog(table, `${player.name} busts.`);
    }
  } else if (action === "stand") {
    seat.status = "stand";
    addBlackjackLog(table, `${player.name} stands on ${blackjackTotal(seat.hand)}.`);
  } else if (action === "doubleDown") {
    if (seat.hand.length !== 2) {
      socket.emit("errorMessage", "Double Down is only available on your first two cards.");
      return;
    }
    if (player.chips < seat.bet) {
      socket.emit("errorMessage", "You do not have enough chips to double down.");
      return;
    }
    player.chips -= seat.bet;
    seat.bet *= 2;
    seat.hand.push(table.deck.pop());
    const total = blackjackTotal(seat.hand);
    seat.status = total > 21 ? "bust" : "stand";
    addBlackjackLog(table, `${player.name} doubles down to ${seat.bet} and finishes on ${total}.`);
  } else if (action === "insurance") {
    if (table.dealerHand?.[0]?.value !== 14) {
      socket.emit("errorMessage", "Insurance is only available when dealer shows an Ace.");
      return;
    }
    if (seat.insuranceTaken) {
      socket.emit("errorMessage", "You already took insurance.");
      return;
    }
    const insurance = Math.ceil(seat.bet / 2);
    if (player.chips < insurance) {
      socket.emit("errorMessage", "You do not have enough chips for insurance.");
      return;
    }
    player.chips -= insurance;
    seat.insuranceBet = insurance;
    seat.insuranceTaken = true;
    addBlackjackLog(table, `${player.name} takes insurance for ${insurance}.`);
    emitEverything(bigRoom);
    return;
  } else {
    socket.emit("errorMessage", "Unknown blackjack action.");
    return;
  }

  advanceBlackjackTurn(bigRoom, table);
  emitEverything(bigRoom);
}


function diceRoll(n) {
  return Array.from({ length: n }, () => 1 + Math.floor(Math.random() * 6));
}

function addDiceLog(table, message) {
  addPokerLog(table, message);
}

function publicDiceSeat(bigRoom, table, playerId, viewerId) {
  const player = getBigPlayer(bigRoom, playerId);
  const seat = table.seats[playerId] || { diceCount: STARTING_DICE, dice: [], active: true };
  const showDice = viewerId === playerId || table.phase === "roundEnd" || Boolean(table.lastReveal);
  return {
    id: playerId,
    name: player?.name || "Unknown",
    chips: player?.chips || 0,
    brokeCount: player?.brokeCount || 0,
    connected: Boolean(player?.connected),
    diceCount: player?.diceCount ?? seat.diceCount ?? STARTING_DICE,
    dice: showDice ? seat.dice || [] : [],
    active: seat.active !== false,
    isBigHost: bigRoom.hostId === playerId,
    isDiceHost: table.hostId === playerId,
    isTurn: table.players[table.turnIndex] === playerId,
    chatBubble: publicChatBubble(player)
  };
}

function emitDiceRoom(bigRoom, table) {
  for (const playerId of table.players) {
    const socket = io.sockets.sockets.get(playerId);
    if (!socket) continue;
    socket.emit("diceRoomState", {
      bigRoomCode: bigRoom.code,
      id: table.id,
      name: table.name,
      phase: table.phase,
      players: table.players.map(id => publicDiceSeat(bigRoom, table, id, playerId)),
      myId: playerId,
      hostId: table.hostId,
      bigHostId: bigRoom.hostId,
      currentBid: table.currentBid,
      diceCashValue: DICE_CASH_VALUE,
      diceExchangeMinimum: DICE_EXCHANGE_MINIMUM,
      maxDiceCount: MAX_DICE_COUNT,
      gameWinnerId: table.gameWinnerId,
      gameWinnerName: table.gameWinnerName,
      turnPlayerId: table.players[table.turnIndex] || null,
      log: table.log,
      chat: table.chat,
      lastReveal: table.lastReveal,
      maxPlayers: MAX_DICE_PLAYERS
    });
  }
}

function activeDicePlayers(table) {
  return table.players.filter(id => table.seats[id]?.active !== false && (table.seats[id]?.diceCount || 0) > 0);
}

function nextDiceIndex(table, startIndex) {
  const n = table.players.length;
  for (let step = 1; step <= n; step++) {
    const idx = (startIndex + step) % n;
    const id = table.players[idx];
    if (table.seats[id]?.active !== false && (table.seats[id]?.diceCount || 0) > 0) return idx;
  }
  return -1;
}

function startDiceRound(bigRoom, table) {
  if (table.players.length < 2) {
    addDiceLog(table, "Need at least 2 players for Liar's Dice.");
    return;
  }

  for (const id of table.players) {
    const player = getBigPlayer(bigRoom, id);
    if (!table.seats[id]) {
      table.seats[id] = { diceCount: player?.diceCount ?? STARTING_DICE, dice: [], active: true };
    }
    table.seats[id].diceCount = player?.diceCount ?? table.seats[id].diceCount ?? STARTING_DICE;
    if (table.seats[id].diceCount <= 0) table.seats[id].active = false;
    else table.seats[id].active = true;
  }

  if (activeDicePlayers(table).length < 2) {
    addDiceLog(table, "Need at least 2 active players with dice.");
    return;
  }

  table.roundNumber += 1;
  table.phase = "bidding";
  table.currentBid = null;
  table.lastReveal = null;
  table.gameWinnerId = null;
  table.gameWinnerName = null;

  for (const id of activeDicePlayers(table)) {
    table.seats[id].dice = diceRoll(table.seats[id].diceCount);
  }

  if (table.turnIndex < 0 || !activeDicePlayers(table).includes(table.players[table.turnIndex])) {
    table.turnIndex = table.players.findIndex(id => activeDicePlayers(table).includes(id));
  }

  addDiceLog(table, `Liar's Dice round #${table.roundNumber} started.`);
}

function isValidBid(table, count, face) {
  count = Number(count);
  face = Number(face);
  if (!Number.isInteger(count) || !Number.isInteger(face)) return false;
  if (count < 1 || face < 1 || face > 6) return false;
  if (!table.currentBid) return true;
  if (count > table.currentBid.count) return true;
  if (count === table.currentBid.count && face > table.currentBid.face) return true;
  return false;
}


function diceActualCountForBid(table, bid) {
  if (!bid) return 0;
  return activeDicePlayers(table)
    .flatMap(id => table.seats[id].dice)
    .filter(value => value === bid.face || (bid.face !== 1 && value === 1))
    .length;
}

function diceRoundReveal(table) {
  return activeDicePlayers(table).map(id => ({
    id,
    name: null,
    dice: [...(table.seats[id]?.dice || [])]
  }));
}

function fillRevealNames(bigRoom, revealList) {
  return revealList.map(item => ({
    ...item,
    name: getBigPlayer(bigRoom, item.id)?.name || "Player"
  }));
}

function transferDie(bigRoom, table, fromId, toId) {
  if (!fromId || !toId || fromId === toId) return false;

  const fromPlayer = getBigPlayer(bigRoom, fromId);
  const toPlayer = getBigPlayer(bigRoom, toId);
  const fromSeat = table.seats[fromId];
  const toSeat = table.seats[toId];

  if (!fromPlayer || !toPlayer || !fromSeat || !toSeat) return false;
  if ((fromPlayer.diceCount ?? fromSeat.diceCount ?? 0) <= 0) return false;

  fromPlayer.diceCount -= 1;
  toPlayer.diceCount = (toPlayer.diceCount ?? toSeat.diceCount ?? 0) + 1;

  fromSeat.diceCount = fromPlayer.diceCount;
  toSeat.diceCount = toPlayer.diceCount;

  if (fromSeat.diceCount <= 0) fromSeat.active = false;
  if (toSeat.diceCount > 0) toSeat.active = true;

  return true;
}

function maybeEndDiceGame(bigRoom, table) {
  const remaining = activeDicePlayers(table);
  if (remaining.length === 1) {
    const winnerId = remaining[0];
    const winner = getBigPlayer(bigRoom, winnerId);
    table.phase = "gameEnd";
    table.gameWinnerId = winnerId;
    table.gameWinnerName = winner?.name || "Winner";
    addDiceLog(table, `${winner?.name || "Winner"} wins the Liar's Dice game.`);
    return true;
  }
  return false;
}

function handleDiceAction(socket, payload) {
  const bigRoom = findBigRoomBySocketId(socket.id);
  if (!bigRoom) return;
  const table = findDiceRoomContaining(bigRoom, socket.id);
  if (!table) {
    socket.emit("errorMessage", "You are not inside a Liar's Dice room.");
    return;
  }

  const action = payload?.action;

  if (action === "exchangeDie") {
    socket.emit("errorMessage", "Dice buying and selling is now done in the Big Room.");
    return;
  }

  if (action === "start") {
    if (table.hostId !== socket.id) {
      socket.emit("errorMessage", "Only the Liar's Dice room host can start.");
      return;
    }
    if (table.phase === "bidding") {
      socket.emit("errorMessage", "A Liar's Dice round is already running.");
      return;
    }
    if (table.phase === "gameEnd") {
      socket.emit("errorMessage", "This Liar's Dice game has ended. Create a new Liar's Dice room to play again.");
      return;
    }
    startDiceRound(bigRoom, table);
    emitEverything(bigRoom);
    return;
  }

  if (table.phase !== "bidding" || table.players[table.turnIndex] !== socket.id) {
    socket.emit("errorMessage", "It is not your Liar's Dice turn.");
    return;
  }

  const player = getBigPlayer(bigRoom, socket.id);

  if (action === "bid") {
    const count = Number(payload?.count);
    const face = Number(payload?.face);

    if (!isValidBid(table, count, face)) {
      socket.emit("errorMessage", "Bid must increase count, or increase face with the same count.");
      return;
    }

    table.currentBid = { count, face, bidderId: socket.id, bidderName: player?.name || "Player" };
    table.lastReveal = null;
    addDiceLog(table, `${player?.name || "Player"} bids ${count} × ${face}. Ones are wild.`);
    table.turnIndex = nextDiceIndex(table, table.turnIndex);
  } else if (action === "challenge") {
    if (!table.currentBid) {
      socket.emit("errorMessage", "There is no bid to challenge yet.");
      return;
    }

    const revealBeforeTransfer = fillRevealNames(bigRoom, diceRoundReveal(table));
    const actual = diceActualCountForBid(table, table.currentBid);
    const challengerId = socket.id;
    const bidderId = table.currentBid.bidderId;
    const liarCaught = actual < table.currentBid.count;

    const fromId = liarCaught ? bidderId : challengerId;
    const toId = liarCaught ? challengerId : bidderId;

    const fromPlayer = getBigPlayer(bigRoom, fromId);
    const toPlayer = getBigPlayer(bigRoom, toId);
    transferDie(bigRoom, table, fromId, toId);

    table.lastReveal = {
      mode: "challenge",
      bid: table.currentBid,
      actual,
      challengerId,
      challengerName: getBigPlayer(bigRoom, challengerId)?.name || "Challenger",
      bidderId,
      bidderName: getBigPlayer(bigRoom, bidderId)?.name || "Bidder",
      loserId: fromId,
      loserName: fromPlayer?.name || "Loser",
      winnerId: toId,
      winnerName: toPlayer?.name || "Winner",
      transferSummary: `${fromPlayer?.name || "Loser"} gives 1 die to ${toPlayer?.name || "Winner"}.`,
      allDice: revealBeforeTransfer
    };

    addDiceLog(
      table,
      `${getBigPlayer(bigRoom, challengerId)?.name || "Player"} challenges. Actual wild count for ${table.currentBid.face}: ${actual}. ${fromPlayer?.name || "Loser"} gives 1 die to ${toPlayer?.name || "Winner"}.`
    );

    table.phase = "roundEnd";
    table.currentBid = null;
    table.turnIndex = table.players.findIndex(id => id === fromId);
    maybeEndDiceGame(bigRoom, table);
  } else if (action === "spotOn") {
    if (!table.currentBid) {
      socket.emit("errorMessage", "There is no bid to call spot on.");
      return;
    }

    const revealBeforeTransfer = fillRevealNames(bigRoom, diceRoundReveal(table));
    const actual = diceActualCountForBid(table, table.currentBid);
    const spotterId = socket.id;
    const bidderId = table.currentBid.bidderId;
    const spotter = getBigPlayer(bigRoom, spotterId);
    const bidder = getBigPlayer(bigRoom, bidderId);
    const success = actual === table.currentBid.count;

    const transfers = [];
    if (success) {
      for (const fromId of activeDicePlayers(table)) {
        if (fromId === spotterId) continue;
        const fromPlayer = getBigPlayer(bigRoom, fromId);
        if (transferDie(bigRoom, table, fromId, spotterId)) {
          transfers.push(`${fromPlayer?.name || "Player"} → ${spotter?.name || "Spot on"}`);
        }
      }
    } else {
      if (transferDie(bigRoom, table, spotterId, bidderId)) {
        transfers.push(`${spotter?.name || "Spot on caller"} → ${bidder?.name || "Bidder"}`);
      }
    }

    table.lastReveal = {
      mode: "spotOn",
      spotOnSuccess: success,
      bid: table.currentBid,
      actual,
      challengerId: spotterId,
      challengerName: spotter?.name || "Spot on caller",
      bidderId,
      bidderName: bidder?.name || "Bidder",
      loserId: success ? null : spotterId,
      loserName: success ? null : spotter?.name || "Spot on caller",
      winnerId: success ? spotterId : bidderId,
      winnerName: success ? spotter?.name || "Spot on caller" : bidder?.name || "Bidder",
      transferSummary: success
        ? `${spotter?.name || "Spot on caller"} was exactly right. Everyone else gives them 1 die.`
        : `${spotter?.name || "Spot on caller"} was wrong and gives 1 die to ${bidder?.name || "Bidder"}.`,
      transfers,
      allDice: revealBeforeTransfer
    };

    addDiceLog(
      table,
      `${spotter?.name || "Player"} calls SPOT ON. Actual wild count for ${table.currentBid.face}: ${actual}. ${table.lastReveal.transferSummary}`
    );

    table.phase = "roundEnd";
    table.currentBid = null;
    table.turnIndex = table.players.findIndex(id => id === (success ? spotterId : bidderId));
    maybeEndDiceGame(bigRoom, table);
  } else {
    socket.emit("errorMessage", "Unknown Liar's Dice action.");
    return;
  }

  emitEverything(bigRoom);
}

function removeFromBlackjackRoom(bigRoom, table, playerId, reason = "left the blackjack room") {
  const idx = table.players.indexOf(playerId);
  if (idx === -1) return;
  const player = getBigPlayer(bigRoom, playerId);
  if (table.phase === "playerTurns" && table.seats[playerId]?.status === "playing") {
    table.seats[playerId].status = "stand";
  }
  table.players.splice(idx, 1);
  delete table.seats[playerId];
  addBlackjackLog(table, `${player?.name || "A player"} ${reason}.`);

  if (table.hostId === playerId) {
    table.hostId = table.players[0] || null;
    const newHost = getBigPlayer(bigRoom, table.hostId);
    if (newHost) addBlackjackLog(table, `${newHost.name} is now the blackjack room host.`);
  }
  if (player && player.currentGameType === "blackjack" && player.currentRoomId === table.id) {
    player.currentGameType = null;
    player.currentRoomId = null;
  }
  if (table.players.length === 0) {
    bigRoom.blackjackRooms.delete(table.id);
    addBigLog(bigRoom, `${table.name} was removed because it became empty.`);
  } else if (table.phase === "playerTurns") {
    advanceBlackjackTurn(bigRoom, table);
  }
}

function removeFromDiceRoom(bigRoom, table, playerId, reason = "left the Liar's Dice room") {
  const idx = table.players.indexOf(playerId);
  if (idx === -1) return;
  const player = getBigPlayer(bigRoom, playerId);
  table.players.splice(idx, 1);
  delete table.seats[playerId];
  addDiceLog(table, `${player?.name || "A player"} ${reason}.`);

  if (table.hostId === playerId) {
    table.hostId = table.players[0] || null;
    const newHost = getBigPlayer(bigRoom, table.hostId);
    if (newHost) addDiceLog(table, `${newHost.name} is now the Liar's Dice room host.`);
  }
  if (player && player.currentGameType === "dice" && player.currentRoomId === table.id) {
    player.currentGameType = null;
    player.currentRoomId = null;
  }
  if (table.players.length === 0) {
    bigRoom.diceRooms.delete(table.id);
    addBigLog(bigRoom, `${table.name} was removed because it became empty.`);
  } else if (table.phase === "bidding") {
    if (!table.players.includes(table.players[table.turnIndex])) table.turnIndex = 0;
    if (activeDicePlayers(table).length < 2) table.phase = "roundEnd";
  }
}


function gameRoomTypeFor(bigRoom, room) {
  if (!bigRoom || !room) return null;
  if (bigRoom.pokerRooms.has(room.id)) return "poker";
  if (bigRoom.blackjackRooms.has(room.id)) return "blackjack";
  if (bigRoom.diceRooms.has(room.id)) return "dice";
  if (bigRoom.werewolfRooms.has(room.id)) return "werewolf";
  if (bigRoom.undercoverRooms.has(room.id)) return "undercover";
  if (bigRoom.drawingRooms.has(room.id)) return "drawing";
  if (bigRoom.twentyFourRooms.has(room.id)) return "twentyfour";
  if (bigRoom.regicideRooms.has(room.id)) return "regicide";
  if (bigRoom.gomokuRooms.has(room.id)) return "gomoku";
  if (bigRoom.connectFourRooms.has(room.id)) return "connectfour";
  return null;
}

function voiceRoomKey(bigRoom, type, room) {
  return `voice:${bigRoom.code}:${type}:${room.id}`;
}

function currentVoiceRoomInfo(socketId) {
  const bigRoom = findBigRoomBySocketId(socketId);
  if (!bigRoom) return null;

  const player = getBigPlayer(bigRoom, socketId);
  const room = findAnyGameRoomContaining(bigRoom, socketId);
  const type = gameRoomTypeFor(bigRoom, room);
  if (!player || !room || !type) return null;

  return {
    bigRoom,
    player,
    room,
    type,
    key: voiceRoomKey(bigRoom, type, room)
  };
}

function publicVoicePeer(bigRoom, socketId) {
  const player = getBigPlayer(bigRoom, socketId);
  const peerSocket = io.sockets.sockets.get(socketId);
  return {
    id: socketId,
    name: player?.name || "Player",
    muted: Boolean(peerSocket?.data?.voiceMuted)
  };
}

function leaveVoiceRoom(socket, reason = "left voice") {
  if (!socket?.data?.voiceRoomKey) return;

  const key = socket.data.voiceRoomKey;
  const members = voiceRooms.get(key);
  if (members) {
    members.delete(socket.id);
    if (!members.size) voiceRooms.delete(key);
  }

  socket.leave(key);
  socket.to(key).emit("voice:peer-left", { id: socket.id, reason });
  socket.data.voiceRoomKey = null;
  socket.data.voiceMuted = false;
  socket.emit("voice:left", { reason });
}

function sameVoiceRoom(socket, targetId) {
  const key = socket?.data?.voiceRoomKey;
  if (!key) return false;
  const targetSocket = io.sockets.sockets.get(targetId);
  return Boolean(targetSocket && targetSocket.data?.voiceRoomKey === key);
}


function removeFromAnyGameRoom(bigRoom, room, playerId, reason = "left the game room") {
  if (!room) return;
  const voiceSocket = io.sockets.sockets.get(playerId);
  if (voiceSocket) leaveVoiceRoom(voiceSocket, reason);
  if (bigRoom.pokerRooms.has(room.id)) return removeFromPokerRoom(bigRoom, room, playerId, reason);
  if (bigRoom.blackjackRooms.has(room.id)) return removeFromBlackjackRoom(bigRoom, room, playerId, reason);
  if (bigRoom.diceRooms.has(room.id)) return removeFromDiceRoom(bigRoom, room, playerId, reason);
  if (bigRoom.werewolfRooms.has(room.id)) return removeFromWerewolfRoom(bigRoom, room, playerId, reason);
  if (bigRoom.undercoverRooms.has(room.id)) return removeFromUndercoverRoom(bigRoom, room, playerId, reason);
  if (bigRoom.drawingRooms.has(room.id)) return removeFromDrawingRoom(bigRoom, room, playerId, reason);
  if (bigRoom.twentyFourRooms.has(room.id)) return removeFromTwentyFourRoom(bigRoom, room, playerId, reason);
  if (bigRoom.regicideRooms.has(room.id)) return removeFromRegicideRoom(bigRoom, room, playerId, reason);
  if (bigRoom.gomokuRooms.has(room.id)) return removeFromGomokuRoom(bigRoom, room, playerId, reason);
  if (bigRoom.connectFourRooms.has(room.id)) return removeFromConnectFourRoom(bigRoom, room, playerId, reason);
}

function joinBlackjackRoomInternal(bigRoom, table, playerId) {
  const player = getBigPlayer(bigRoom, playerId);
  if (!player) return;
  table.players.push(playerId);
  table.seats[playerId] = { hand: [], bet: 0, status: "waiting", result: null };
  player.currentGameType = "blackjack";
  player.currentRoomId = table.id;
  if (!table.hostId) {
    table.hostId = playerId;
    addBlackjackLog(table, `${player.name} entered first and became the blackjack room host.`);
  } else {
    addBlackjackLog(table, `${player.name} joined the blackjack room.`);
  }
}

function joinDiceRoomInternal(bigRoom, table, playerId) {
  const player = getBigPlayer(bigRoom, playerId);
  if (!player) return;
  table.players.push(playerId);
  table.seats[playerId] = {
    diceCount: player.diceCount ?? STARTING_DICE,
    dice: [],
    active: (player.diceCount ?? STARTING_DICE) > 0
  };
  player.currentGameType = "dice";
  player.currentRoomId = table.id;
  if (!table.hostId) {
    table.hostId = playerId;
    addDiceLog(table, `${player.name} entered first and became the Liar's Dice room host.`);
  } else {
    addDiceLog(table, `${player.name} joined the Liar's Dice room.`);
  }
}



function removeFromWerewolfRoom(bigRoom, room, playerId, reason = "left the Werewolf room") {
  const idx = room.players.indexOf(playerId);
  if (idx === -1) return;
  const player = getBigPlayer(bigRoom, playerId);
  room.players.splice(idx, 1);
  delete room.seats[playerId];
  delete room.votes[playerId];
  for (const voterId of Object.keys(room.votes || {})) {
    if (room.votes[voterId] === playerId) delete room.votes[voterId];
  }
  room.log.unshift(`${player?.name || "A player"} ${reason}.`);
  room.log = room.log.slice(0, 80);

  if (room.hostId === playerId) room.hostId = room.players[0] || null;
  if (player && player.currentGameType === "werewolf" && player.currentRoomId === room.id) {
    player.currentGameType = null;
    player.currentRoomId = null;
  }
  if (room.players.length === 0) {
    bigRoom.werewolfRooms.delete(room.id);
    addBigLog(bigRoom, `${room.name} was removed because it became empty.`);
  }
}

function removeFromUndercoverRoom(bigRoom, room, playerId, reason = "left the Undercover room") {
  const idx = room.players.indexOf(playerId);
  if (idx === -1) return;
  const player = getBigPlayer(bigRoom, playerId);
  room.players.splice(idx, 1);
  delete room.seats[playerId];
  delete room.votes[playerId];
  for (const voterId of Object.keys(room.votes || {})) {
    if (room.votes[voterId] === playerId) delete room.votes[voterId];
  }
  room.log.unshift(`${player?.name || "A player"} ${reason}.`);
  room.log = room.log.slice(0, 80);

  if (room.hostId === playerId) room.hostId = room.players[0] || null;
  if (player && player.currentGameType === "undercover" && player.currentRoomId === room.id) {
    player.currentGameType = null;
    player.currentRoomId = null;
  }
  if (room.players.length === 0) {
    bigRoom.undercoverRooms.delete(room.id);
    addBigLog(bigRoom, `${room.name} was removed because it became empty.`);
  }
}

function joinWerewolfRoomInternal(bigRoom, room, playerId) {
  const player = getBigPlayer(bigRoom, playerId);
  if (!player) return;
  room.players.push(playerId);
  room.seats[playerId] = { role: null, alive: true };
  player.currentGameType = "werewolf";
  player.currentRoomId = room.id;
  room.log.unshift(`${player.name} joined the Werewolf room.`);
  room.log = room.log.slice(0, 80);
  if (!room.hostId) room.hostId = playerId;
}

function joinUndercoverRoomInternal(bigRoom, room, playerId) {
  const player = getBigPlayer(bigRoom, playerId);
  if (!player) return;
  room.players.push(playerId);
  room.seats[playerId] = { role: null, word: null, alive: true };
  player.currentGameType = "undercover";
  player.currentRoomId = room.id;
  room.log.unshift(`${player.name} joined the Undercover room.`);
  room.log = room.log.slice(0, 80);
  if (!room.hostId) room.hostId = playerId;
}


function removeFromDrawingRoom(bigRoom, room, playerId, reason = "left the Draw Guess room") {
  const idx = room.players.indexOf(playerId);
  if (idx === -1) return;
  const player = getBigPlayer(bigRoom, playerId);
  room.players.splice(idx, 1);
  delete room.submissions[playerId];

  room.log.unshift(`${player?.name || "A player"} ${reason}.`);
  room.log = room.log.slice(0, 80);

  if (room.hostId === playerId) room.hostId = room.players[0] || null;
  if (player && player.currentGameType === "drawing" && player.currentRoomId === room.id) {
    player.currentGameType = null;
    player.currentRoomId = null;
  }

  if (room.players.length === 0) {
    clearDrawingPhaseTimer(bigRoom, room);
    clearDrawingRatingTimer(bigRoom, room);
    bigRoom.drawingRooms.delete(room.id);
    addBigLog(bigRoom, `${room.name} was removed because it became empty.`);
  }
}

function joinDrawingRoomInternal(bigRoom, room, playerId) {
  const player = getBigPlayer(bigRoom, playerId);
  if (!player) return;
  room.players.push(playerId);
  player.currentGameType = "drawing";
  player.currentRoomId = room.id;
  if (!room.hostId) room.hostId = playerId;
  room.log.unshift(`${player.name} joined the Draw Guess room.`);
  room.log = room.log.slice(0, 80);
}


function removeFromRegicideRoom(bigRoom, room, playerId, reason = "left the Regicide room") {
  const idx = room.players.indexOf(playerId);
  if (idx === -1) return;

  const player = getBigPlayer(bigRoom, playerId);
  room.players.splice(idx, 1);
  room.log.unshift(`${player?.name || "A player"} ${reason}.`);
  room.log = room.log.slice(0, 80);

  if (room.hostId === playerId) room.hostId = room.players[0] || null;
  if (player && player.currentGameType === "regicide" && player.currentRoomId === room.id) {
    player.currentGameType = null;
    player.currentRoomId = null;
  }

  if (room.players.length === 0) {
    bigRoom.regicideRooms.delete(room.id);
    addBigLog(bigRoom, `${room.name} was removed because it became empty.`);
  } else if (room.phase === "playing" || room.phase === "defending" || room.phase === "chooseNext") {
    room.phase = "lost";
    room.result = "A player left during Regicide. The cooperative run ended.";
  }
}

function joinRegicideRoomInternal(bigRoom, room, playerId) {
  const player = getBigPlayer(bigRoom, playerId);
  if (!player) return;

  room.players.push(playerId);
  player.currentGameType = "regicide";
  player.currentRoomId = room.id;
  if (!room.hostId) room.hostId = playerId;

  room.log.unshift(`${player.name} joined the Regicide room.`);
  room.log = room.log.slice(0, 80);
}

function removeFromBigRoom(bigRoom, playerId, reason = "left the big room") {
  const player = getBigPlayer(bigRoom, playerId);
  if (!player) return;

  const table = findAnyGameRoomContaining(bigRoom, playerId);
  if (table) {
    removeFromAnyGameRoom(bigRoom, table, playerId, reason);
  }

  const idx = bigRoom.players.findIndex(p => p.id === playerId);
  if (idx >= 0) bigRoom.players.splice(idx, 1);

  addBigLog(bigRoom, `${player.name} ${reason}.`);

  if (bigRoom.hostId === playerId) {
    bigRoom.hostId = bigRoom.players[0]?.id || null;
    const newHost = getBigPlayer(bigRoom, bigRoom.hostId);
    if (newHost) addBigLog(bigRoom, `${newHost.name} is now the big room host.`);
  }

  const socket = io.sockets.sockets.get(playerId);
  if (socket) {
    socket.leave(bigRoom.code);
    socket.emit("pokerRoomState", null);
    socket.emit("blackjackRoomState", null);
    socket.emit("diceRoomState", null);
    socket.emit("werewolfRoomState", null);
    socket.emit("undercoverRoomState", null);
    socket.emit("drawingRoomState", null);
    socket.emit("twentyFourRoomState", null);
    socket.emit("regicideRoomState", null);
    socket.emit("gomokuRoomState", null);
    socket.emit("connectFourRoomState", null);
  }

  if (bigRoom.players.length === 0) {
    bigRooms.delete(bigRoom.code);
  } else {
    emitEverything(bigRoom);
  }
}



function publicWerewolfPlayer(bigRoom, room, playerId, viewerId) {
  const player = getBigPlayer(bigRoom, playerId);
  const seat = room.seats[playerId] || {};
  const viewerSeat = room.seats[viewerId] || {};
  const revealAll = room.phase === "gameEnd";
  const isViewerWolf = viewerSeat.role === "Werewolf";
  const seerKnownRole = room.seerKnownRoles?.[viewerId]?.[playerId] || null;
  const voteTargetId = room.votes?.[playerId];
  const wolfVoteTargetId = room.wolfVotes?.[playerId];

  const roleVisible = (
    playerId === viewerId ||
    revealAll ||
    (isViewerWolf && seat.role === "Werewolf") ||
    Boolean(seerKnownRole)
  );

  const visibleRole = seerKnownRole || (roleVisible ? seat.role || null : null);
  let roleAura = null;

  if (revealAll && seat.role) {
    roleAura = seat.role === "Werewolf" ? "wolf" : "good";
  } else if (isViewerWolf && seat.role === "Werewolf") {
    roleAura = "wolf";
  } else if (seerKnownRole) {
    roleAura = seerKnownRole === "Werewolf" ? "wolf" : "good";
  } else if (playerId === viewerId && seat.role === "Werewolf") {
    roleAura = "wolf";
  }

  let actionLabel = "";
  if (voteTargetId) {
    actionLabel = voteTargetId === "__abstain__"
      ? "Voted: abstain"
      : `Voted: ${getBigPlayer(bigRoom, voteTargetId)?.name || "Player"}`;
  }

  if (room.phase === "night-wolves" && wolfVoteTargetId && (isViewerWolf || revealAll)) {
    actionLabel = `Kill: ${getBigPlayer(bigRoom, wolfVoteTargetId)?.name || "Player"}`;
  }

  const isPendingWitchSaveTarget = (
    viewerSeat.role === "Witch" &&
    room.phase === "night-witch-save" &&
    room.pendingWolfKillId === playerId &&
    !room.witchSaved
  );

  const isUnrescuedWolfTargetForWitch = (
    viewerSeat.role === "Witch" &&
    room.phase === "night-witch-poison" &&
    room.pendingWolfKillId === playerId &&
    !room.witchSaved
  );

  const canBePoisoned = (
    viewerSeat.role === "Witch" &&
    room.phase === "night-witch-poison" &&
    seat.alive !== false &&
    !isUnrescuedWolfTargetForWitch
  );

  return {
    id: playerId,
    name: player?.name || "Unknown",
    brokeCount: player?.brokeCount || 0,
    connected: Boolean(player?.connected),
    alive: seat.alive !== false,
    role: visibleRole,
    roleAura,
    team: revealAll ? werewolfTeam(seat.role) : null,
    deathReason: seat.deathReason || null,
    isPendingWitchSaveTarget,
    isUnrescuedWolfTargetForWitch,
    canBePoisoned,
    isHost: room.hostId === playerId,
    votes: Object.values(room.votes || {}).filter(id => id === playerId).length,
    actionLabel,
    chatBubble: publicChatBubble(player)
  };
}


function emitWerewolfRoom(bigRoom, room) {
  for (const viewerId of room.players) {
    const socket = io.sockets.sockets.get(viewerId);
    if (!socket) continue;

    const viewerSeat = room.seats[viewerId] || {};
    const pendingKillName = room.pendingWolfKillId ? getBigPlayer(bigRoom, room.pendingWolfKillId)?.name || "Unknown" : null;
    const hunterName = room.hunterPendingId ? getBigPlayer(bigRoom, room.hunterPendingId)?.name || "Hunter" : null;
    const seerResult = room.seerResults?.[viewerId] || null;
    const witchInfo = viewerSeat.role === "Witch"
      ? {
          pendingKillId: room.pendingWolfKillId,
          pendingKillName,
          savedTargetId: room.witchSavedTargetId,
          saved: Boolean(room.witchSaved),
          saveUsed: Boolean(room.witchSaveUsed),
          poisonUsed: Boolean(room.witchPoisonUsed),
          canSave: room.phase === "night-witch-save" && Boolean(room.pendingWolfKillId) && !room.witchSaveUsed,
          canPoison: room.phase === "night-witch-poison" && !room.witchPoisonUsed
        }
      : null;

    socket.emit("werewolfRoomState", {
      bigRoomCode: bigRoom.code,
      id: room.id,
      name: room.name,
      phase: room.phase,
      players: room.players.map(id => publicWerewolfPlayer(bigRoom, room, id, viewerId)),
      myId: viewerId,
      hostId: room.hostId,
      bigHostId: bigRoom.hostId,
      roundNumber: room.roundNumber,
      votes: room.votes,
      wolfVotes: viewerSeat.role === "Werewolf" || room.phase === "gameEnd" ? room.wolfVotes : {},
      voteRound: room.voteRound,
      voteCandidates: room.voteCandidates,
      pendingWolfKillId: viewerSeat.role === "Witch" || room.phase === "gameEnd" ? room.pendingWolfKillId : null,
      pendingWolfKillName: viewerSeat.role === "Witch" || room.phase === "gameEnd" ? pendingKillName : null,
      seerResult,
      witchInfo,
      hunterPendingId: room.hunterPendingId,
      hunterPendingName: hunterName,
      result: room.result,
      log: room.log,
      chat: room.chat,
      wolfChat: viewerSeat.role === "Werewolf" ? room.wolfChat : [],
      canWolfChat: viewerSeat.role === "Werewolf",
      maxPlayers: MAX_WEREWOLF_PLAYERS,
      socialWinReward: SOCIAL_WIN_REWARD
    });
  }
}


function publicUndercoverPlayer(bigRoom, room, playerId, viewerId) {
  const player = getBigPlayer(bigRoom, playerId);
  const seat = room.seats[playerId] || {};
  const revealAll = room.phase === "gameEnd";
  return {
    id: playerId,
    name: player?.name || "Unknown",
    brokeCount: player?.brokeCount || 0,
    connected: Boolean(player?.connected),
    alive: seat.alive !== false,
    role: revealAll ? seat.role || null : null,
    word: playerId === viewerId ? seat.word || null : null,
    isHost: room.hostId === playerId,
    votes: Object.values(room.votes || {}).filter(id => id === playerId).length,
    chatBubble: publicChatBubble(player)
  };
}

function emitUndercoverRoom(bigRoom, room) {
  for (const viewerId of room.players) {
    const socket = io.sockets.sockets.get(viewerId);
    if (!socket) continue;
    socket.emit("undercoverRoomState", {
      bigRoomCode: bigRoom.code,
      id: room.id,
      name: room.name,
      phase: room.phase,
      players: room.players.map(id => publicUndercoverPlayer(bigRoom, room, id, viewerId)),
      myId: viewerId,
      hostId: room.hostId,
      bigHostId: bigRoom.hostId,
      roundNumber: room.roundNumber,
      votes: room.votes,
      words: room.phase === "gameEnd" ? room.words : null,
      result: room.result,
      log: room.log,
      chat: room.chat,
      maxPlayers: MAX_UNDERCOVER_PLAYERS
    });
  }
}



function awardWinners(bigRoom, room, winnerIds, label) {
  if (room.rewarded) return;
  const uniqueIds = [...new Set(winnerIds)].filter(Boolean);
  for (const id of uniqueIds) {
    const player = getBigPlayer(bigRoom, id);
    if (player) player.chips += SOCIAL_WIN_REWARD;
  }
  room.rewarded = true;
  const names = uniqueIds.map(id => getBigPlayer(bigRoom, id)?.name).filter(Boolean).join(", ");
  room.log.unshift(`${label} reward: ${names || "winner"} receive ${SOCIAL_WIN_REWARD} chips each.`);
  room.log = room.log.slice(0, 80);
}

function aliveIds(room) {
  return room.players.filter(id => room.seats[id]?.alive !== false);
}

function highestVotedTarget(room) {
  const counts = {};
  for (const targetId of Object.values(room.votes || {})) {
    counts[targetId] = (counts[targetId] || 0) + 1;
  }

  let max = -1;
  let tied = [];
  for (const [targetId, count] of Object.entries(counts)) {
    if (count > max) {
      max = count;
      tied = [targetId];
    } else if (count === max) {
      tied.push(targetId);
    }
  }

  return tied.length ? pickRandom(tied) : null;
}

function werewolfRoleConfig(count) {
  if (count <= 6) return { wolves: 2, seer: 1, witch: 1, hunter: 0 };
  if (count === 7) return { wolves: 2, seer: 1, witch: 1, hunter: 0 };
  if (count === 8) return { wolves: 3, seer: 1, witch: 1, hunter: 0 };
  return { wolves: 3, seer: 1, witch: 1, hunter: 1 };
}

function werewolfTeam(role) {
  return role === "Werewolf" ? "wolves" : "village";
}

function aliveWerewolfRoleIds(room, role) {
  return room.players.filter(id => room.seats[id]?.alive !== false && room.seats[id]?.role === role);
}

function aliveWerewolfCampIds(room, camp) {
  return room.players.filter(id => {
    const seat = room.seats[id];
    return seat?.alive !== false && werewolfTeam(seat?.role) === camp;
  });
}

function settleWerewolfGame(bigRoom, room, winningCamp, resultText) {
  if (room.phase === "gameEnd" && room.rewarded) return true;

  room.phase = "gameEnd";
  room.result = resultText;

  if (!room.rewarded) {
    for (const id of room.players) {
      const player = getBigPlayer(bigRoom, id);
      if (!player) continue;

      if (werewolfTeam(room.seats[id]?.role) === winningCamp) {
        player.chips += SOCIAL_WIN_REWARD;
      } else {
        player.chips = Math.max(0, player.chips - SOCIAL_WIN_REWARD);
      }
    }

    room.rewarded = true;
    room.log.unshift(`${resultText} Winners gain ${SOCIAL_WIN_REWARD} chips; losing camp loses ${SOCIAL_WIN_REWARD} chips.`);
  }

  room.log = room.log.slice(0, 80);
  return true;
}

function checkWerewolfWin(bigRoom, room) {
  const wolves = aliveWerewolfCampIds(room, "wolves");
  const village = aliveWerewolfCampIds(room, "village");

  if (wolves.length === 0) {
    return settleWerewolfGame(bigRoom, room, "village", "Village camp wins.");
  }

  if (wolves.length >= village.length) {
    return settleWerewolfGame(bigRoom, room, "wolves", "Werewolves win.");
  }

  return false;
}

function beginWerewolfNight(bigRoom, room) {
  if (checkWerewolfWin(bigRoom, room)) return;

  room.phase = "night-wolves";
  room.roundNumber += 1;
  room.votes = {};
  room.wolfVotes = {};
  room.voteRound = 1;
  room.voteCandidates = null;
  room.pendingWolfKillId = null;
  room.pendingDeathsQueue = [];
  room.witchSaved = false;
  room.witchPoisonTargetId = null;
  room.seerCheck = null;

  room.log.unshift(`Night ${room.roundNumber}: werewolves choose a target.`);
  room.log = room.log.slice(0, 80);
}

function beginWerewolfDay(bigRoom, room) {
  if (checkWerewolfWin(bigRoom, room)) return;

  room.phase = "day";
  room.votes = {};
  room.voteRound = 1;
  room.voteCandidates = null;
  room.log.unshift(`Day ${room.roundNumber}: discuss and vote. Abstain is allowed.`);
  room.log = room.log.slice(0, 80);
}

function continueAfterWerewolfHunter(bigRoom, room) {
  const next = room.nextPhaseAfterHunter || "day";
  room.hunterPendingId = null;
  room.nextPhaseAfterHunter = null;

  if (checkWerewolfWin(bigRoom, room)) return;

  if (room.pendingDeathsQueue?.length) {
    applyNextWerewolfDeath(bigRoom, room, next);
    return;
  }

  if (next === "night") beginWerewolfNight(bigRoom, room);
  else beginWerewolfDay(bigRoom, room);
}

function eliminateWerewolfPlayer(bigRoom, room, targetId, reason = "death", nextPhase = "day") {
  if (!room.players.includes(targetId) || !room.seats[targetId]) return false;
  const seat = room.seats[targetId];
  if (seat.alive === false) return false;

  seat.alive = false;
  seat.deathReason = reason;
  const target = getBigPlayer(bigRoom, targetId);
  room.log.unshift(`${target?.name || "A player"} died by ${reason}. Role: ${seat.role}.`);

  if (seat.role === "Hunter" && !room.hunterUsed[targetId]) {
    room.phase = "hunter";
    room.hunterPendingId = targetId;
    room.nextPhaseAfterHunter = nextPhase;
    room.log.unshift(`${target?.name || "Hunter"} may shoot one player before dying.`);
    room.log = room.log.slice(0, 80);
    return "hunter";
  }

  room.log = room.log.slice(0, 80);
  return "dead";
}

function applyNextWerewolfDeath(bigRoom, room, nextPhase = "day") {
  while (room.pendingDeathsQueue?.length) {
    const targetId = room.pendingDeathsQueue.shift();
    if (room.seats[targetId]?.alive === false) continue;
    const result = eliminateWerewolfPlayer(bigRoom, room, targetId, "night action", nextPhase);
    if (result === "hunter") return;
  }

  if (checkWerewolfWin(bigRoom, room)) return;

  if (nextPhase === "night") beginWerewolfNight(bigRoom, room);
  else beginWerewolfDay(bigRoom, room);
}

function finishWerewolfNight(bigRoom, room) {
  const deaths = [];

  if (room.pendingWolfKillId && !room.witchSaved) deaths.push(room.pendingWolfKillId);
  if (room.witchPoisonTargetId) deaths.push(room.witchPoisonTargetId);

  room.pendingDeathsQueue = [...new Set(deaths)];

  if (room.pendingDeathsQueue.length === 0) {
    room.log.unshift("Night ended. Nobody died.");
    beginWerewolfDay(bigRoom, room);
    return;
  }

  applyNextWerewolfDeath(bigRoom, room, "day");
}


function delayedWerewolfTransition(bigRoom, room, message, callback) {
  room.phase = "night-transition";
  room.log.unshift(message);
  room.log = room.log.slice(0, 80);
  emitEverything(bigRoom);

  setTimeout(() => {
    if (!bigRoom.werewolfRooms?.has(room.id)) return;
    if (room.phase !== "night-transition") return;
    callback();
    emitEverything(bigRoom);
  }, 2500);
}

function moveWerewolfToWitchPoisonOrFinish(bigRoom, room) {
  const witches = aliveWerewolfRoleIds(room, "Witch");
  const witchId = witches[0];

  if (witchId && room.pendingWolfKillId === witchId) {
    delayedWerewolfTransition(
      bigRoom,
      room,
      "Night continues...",
      () => finishWerewolfNight(bigRoom, room)
    );
    return;
  }

  const canPoison = Boolean(witchId) && !room.witchPoisonUsed;

  if (canPoison) {
    room.phase = "night-witch-poison";
    room.log.unshift("Witch poison phase: poison one alive player or skip.");
    room.log = room.log.slice(0, 80);
    return;
  }

  finishWerewolfNight(bigRoom, room);
}

function moveWerewolfToWitchOrFinish(bigRoom, room) {
  const witches = aliveWerewolfRoleIds(room, "Witch");
  const witchId = witches[0];

  if (witchId && room.pendingWolfKillId === witchId) {
    delayedWerewolfTransition(
      bigRoom,
      room,
      "Night continues...",
      () => finishWerewolfNight(bigRoom, room)
    );
    return;
  }

  const canSave = Boolean(witchId) && !room.witchSaveUsed && Boolean(room.pendingWolfKillId);

  if (canSave) {
    room.phase = "night-witch-save";
    room.log.unshift("Witch save phase: decide whether to save the attacked player.");
    room.log = room.log.slice(0, 80);
    return;
  }

  moveWerewolfToWitchPoisonOrFinish(bigRoom, room);
}

function moveWerewolfToSeerOrWitch(bigRoom, room) {
  const seers = aliveWerewolfRoleIds(room, "Seer");
  const seerId = seers[0];

  if (seerId && room.pendingWolfKillId === seerId) {
    delayedWerewolfTransition(
      bigRoom,
      room,
      "Night continues...",
      () => moveWerewolfToWitchOrFinish(bigRoom, room)
    );
    return;
  }

  if (seerId) {
    room.phase = "night-seer";
    room.log.unshift("Seer phase: check one player's role.");
    room.log = room.log.slice(0, 80);
    return;
  }

  moveWerewolfToWitchOrFinish(bigRoom, room);
}


function highestWerewolfVoteResult(room) {
  const counts = {};
  for (const targetId of Object.values(room.votes || {})) {
    if (targetId === "__abstain__") continue;
    counts[targetId] = (counts[targetId] || 0) + 1;
  }

  let max = 0;
  let tied = [];
  for (const [targetId, count] of Object.entries(counts)) {
    if (count > max) {
      max = count;
      tied = [targetId];
    } else if (count === max) {
      tied.push(targetId);
    }
  }

  return { max, tied };
}

function maybeAutoResolveWerewolfVote(bigRoom, room) {
  if (room.phase !== "day") return false;
  const voters = aliveIds(room);
  if (!voters.length) return false;
  const allVoted = voters.every(id => Object.prototype.hasOwnProperty.call(room.votes, id));
  if (!allVoted) return false;

  const { max, tied } = highestWerewolfVoteResult(room);

  if (max === 0) {
    room.log.unshift("Everyone abstained. Vote skipped.");
    beginWerewolfNight(bigRoom, room);
    return true;
  }

  if (tied.length > 1) {
    if (room.voteRound === 1) {
      room.voteRound = 2;
      room.voteCandidates = tied;
      room.votes = {};
      room.log.unshift(`Vote tied. Revote only between: ${tied.map(id => getBigPlayer(bigRoom, id)?.name || "Player").join(", ")}.`);
      room.log = room.log.slice(0, 80);
      return true;
    }

    room.log.unshift("Revote tied again. Voting phase skipped.");
    beginWerewolfNight(bigRoom, room);
    return true;
  }

  const targetId = tied[0];
  const result = eliminateWerewolfPlayer(bigRoom, room, targetId, "day vote", "night");
  room.votes = {};
  room.voteCandidates = null;
  room.voteRound = 1;

  if (result !== "hunter" && !checkWerewolfWin(bigRoom, room)) {
    beginWerewolfNight(bigRoom, room);
  }

  return true;
}

function checkUndercoverWin(bigRoom, room) {
  const alive = aliveIds(room);
  const undercovers = alive.filter(id => room.seats[id]?.role === "Undercover");
  const civilians = alive.filter(id => room.seats[id]?.role === "Civilian");

  if (undercovers.length === 0) {
    room.phase = "gameEnd";
    room.result = "Civilians win.";
    const winners = room.players.filter(id => room.seats[id]?.role === "Civilian");
    awardWinners(bigRoom, room, winners, "Who's Undercover");
    return true;
  }

  if (undercovers.length >= civilians.length) {
    room.phase = "gameEnd";
    room.result = "Undercover wins.";
    const winners = room.players.filter(id => room.seats[id]?.role === "Undercover");
    awardWinners(bigRoom, room, winners, "Who's Undercover");
    return true;
  }

  return false;
}

function eliminateUndercoverPlayer(bigRoom, room, targetId, reason = "vote") {
  if (!room.players.includes(targetId) || !room.seats[targetId]) return;
  room.seats[targetId].alive = false;
  const target = getBigPlayer(bigRoom, targetId);
  room.log.unshift(`${target?.name || "A player"} was eliminated by ${reason}. Role: ${room.seats[targetId].role}.`);

  if (!checkUndercoverWin(bigRoom, room)) {
    room.phase = "discussion";
    room.roundNumber += 1;
  }

  room.votes = {};
  room.log = room.log.slice(0, 80);
}

function maybeAutoResolveUndercoverVote(bigRoom, room) {
  if (room.phase !== "discussion" && room.phase !== "voting") return false;
  const voters = aliveIds(room);
  if (!voters.length) return false;
  const allVoted = voters.every(id => room.votes[id]);
  if (!allVoted) return false;

  const targetId = highestVotedTarget(room);
  if (!targetId) return false;

  eliminateUndercoverPlayer(bigRoom, room, targetId, "vote");
  return true;
}


function drawingRoomTimerKey(bigRoom, room) {
  return `${bigRoom.code}:${room.id}`;
}

function clearDrawingPhaseTimer(bigRoom, room) {
  const key = drawingRoomTimerKey(bigRoom, room);
  const timer = drawingPhaseTimers.get(key);
  if (timer) clearTimeout(timer);
  drawingPhaseTimers.delete(key);
}

function clearDrawingRatingTimer(bigRoom, room) {
  const key = drawingRoomTimerKey(bigRoom, room);
  const timer = drawingRatingTimers.get(key);
  if (timer) clearTimeout(timer);
  drawingRatingTimers.delete(key);
}

function defaultDrawingImage(label = "Time ran out") {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="100%" height="100%" fill="#f8fafc"/><text x="50%" y="48%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="46" fill="#334155">${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function autoFillMissingDrawingSubmissions(room) {
  for (const playerId of room.players) {
    if (room.submissions?.[playerId]) continue;

    if (room.phase === "prompt") {
      room.submissions[playerId] = { text: "Time ran out prompt" };
    } else if (room.phase === "draw") {
      room.submissions[playerId] = { image: defaultDrawingImage("Time ran out") };
    } else if (room.phase === "guess") {
      room.submissions[playerId] = { text: "No guess — time ran out" };
    }
  }
}

function scheduleDrawingPhaseTimer(bigRoom, room) {
  clearDrawingPhaseTimer(bigRoom, room);

  if (!["prompt", "draw", "guess"].includes(room.phase)) {
    room.deadlineAt = null;
    return;
  }

  room.deadlineAt = Date.now() + DRAWING_TIME_LIMIT_MS;
  const key = drawingRoomTimerKey(bigRoom, room);

  const timer = setTimeout(() => {
    if (!["prompt", "draw", "guess"].includes(room.phase)) return;
    autoFillMissingDrawingSubmissions(room);
    room.log.unshift("Time limit reached. Missing submissions were auto-filled.");
    room.log = room.log.slice(0, 80);
    advanceDrawingRoom(bigRoom, room);
    emitEverything(bigRoom);
  }, DRAWING_TIME_LIMIT_MS + 250);

  drawingPhaseTimers.set(key, timer);
}

function drawingPlayerIndex(room, playerId) {
  return room.players.indexOf(playerId);
}

function drawingMaxSteps(room) {
  const nonOwnerCount = Math.max(0, room.players.length - 1);
  // Keep the chain ending on a guess. With 4 players this adds one final guess
  // instead of ending immediately after the last drawing.
  return nonOwnerCount % 2 === 1 ? nonOwnerCount + 1 : nonOwnerCount;
}

function drawingNonOwnerOrder(room, ownerId) {
  const ownerIndex = room.players.indexOf(ownerId);
  if (ownerIndex < 0) return [];
  const result = [];
  for (let offset = 1; offset < room.players.length; offset++) {
    result.push(room.players[(ownerIndex + offset) % room.players.length]);
  }
  return result;
}

function drawingAssignedPlayerForChain(room, chain) {
  if (!chain) return null;

  if (room.phase === "prompt") {
    return chain.ownerId;
  }

  const order = drawingNonOwnerOrder(room, chain.ownerId);
  if (!order.length || room.stepIndex < 1) return null;

  // Step 1 goes to the next player, step 2 to the following player, etc.
  // If an extra final guess is needed to avoid ending on a drawing, wrap once
  // to a non-owner rather than giving the chain back to the original prompt owner.
  return order[(room.stepIndex - 1) % order.length] || null;
}


function drawingAssignedChain(room, playerId) {
  if (room.phase === "prompt") {
    const idx = drawingPlayerIndex(room, playerId);
    return idx >= 0 ? room.chains[idx] || null : null;
  }

  return room.chains.find(chain => drawingAssignedPlayerForChain(room, chain) === playerId) || null;
}

function drawingCurrentTask(room, playerId) {
  const chain = drawingAssignedChain(room, playerId);
  if (!chain) return null;

  if (room.phase === "prompt") {
    return { type: "prompt", chainId: chain.id, prompt: "" };
  }

  const previous = chain.entries[chain.entries.length - 1] || null;
  if (room.phase === "draw") {
    return { type: "draw", chainId: chain.id, previous, originalOwnerId: chain.ownerId };
  }

  if (room.phase === "guess") {
    return { type: "guess", chainId: chain.id, previous, originalOwnerId: chain.ownerId };
  }

  return null;
}

function publicDrawingPlayer(bigRoom, room, playerId) {
  const player = getBigPlayer(bigRoom, playerId);
  return {
    id: playerId,
    name: player?.name || "Unknown",
    brokeCount: player?.brokeCount || 0,
    connected: Boolean(player?.connected),
    isHost: room.hostId === playerId,
    submitted: Boolean(room.submissions?.[playerId]),
    chatBubble: publicChatBubble(player)
  };
}

function drawingChainParticipants(chain) {
  const seen = new Set();
  const participants = [];

  for (const entry of chain.entries || []) {
    if (!entry.playerId || seen.has(entry.playerId)) continue;
    seen.add(entry.playerId);
    participants.push(entry.playerId);
  }

  return participants;
}

function drawingRatingTargetKey(chainId, entryId) {
  return `${chainId}::entry::${entryId}`;
}

function drawingEntryId(chain, entry, index) {
  if (entry.id) return entry.id;
  entry.id = `${chain.id}-${entry.type}-${index}-${entry.playerId || "unknown"}`;
  return entry.id;
}

function drawingPerformanceTargets(room) {
  return room.chains.flatMap(chain =>
    (chain.entries || [])
      .map((entry, index) => ({ entry, index }))
      .filter(item => item.entry.type === "drawing" || item.entry.type === "guess")
      .map(({ entry, index }) => ({
        chainId: chain.id,
        playerId: entry.playerId,
        entryIndex: index,
        entryType: entry.type,
        targetKey: drawingRatingTargetKey(chain.id, drawingEntryId(chain, entry, index))
      }))
  );
}

function drawingTargetRatingStats(room, targetKey) {
  let good = 0;
  let bad = 0;

  for (const votes of Object.values(room.ratingVotes || {})) {
    const vote = votes?.[targetKey];
    if (vote === "good") good += 1;
    if (vote === "bad") bad += 1;
  }

  return { good, bad };
}


function firstRateableEntryIndex(chain, startIndex = 1) {
  for (let i = startIndex; i < (chain.entries || []).length; i++) {
    const entry = chain.entries[i];
    if (entry?.type === "drawing" || entry?.type === "guess") return i;
  }
  return -1;
}

function normalizeDrawingRatingCursor(room) {
  if (!room.ratingCursor) {
    room.ratingCursor = { chainIndex: 0, entryIndex: 1, summary: false };
  }

  const chain = room.chains?.[room.ratingCursor.chainIndex];
  if (!chain) return null;

  if (!room.ratingCursor.summary) {
    const idx = firstRateableEntryIndex(chain, room.ratingCursor.entryIndex || 1);
    if (idx < 0) {
      room.ratingCursor.summary = true;
    } else {
      room.ratingCursor.entryIndex = idx;
    }
  }

  return room.ratingCursor;
}

function currentDrawingRatingTarget(room) {
  const cursor = normalizeDrawingRatingCursor(room);
  if (!cursor || cursor.summary) return null;

  const chain = room.chains[cursor.chainIndex];
  const entry = chain?.entries?.[cursor.entryIndex];
  if (!chain || !entry) return null;

  return {
    chain,
    entry,
    entryIndex: cursor.entryIndex,
    targetKey: drawingRatingTargetKey(chain.id, drawingEntryId(chain, entry, cursor.entryIndex))
  };
}

function publicDrawingRatingView(bigRoom, room, viewerId) {
  if (room.phase !== "rating") return null;

  const cursor = normalizeDrawingRatingCursor(room);
  const chain = room.chains?.[cursor?.chainIndex || 0];
  if (!cursor || !chain) return null;

  const originalPrompt = chain.entries?.[0] || null;
  const finalGuess = [...(chain.entries || [])].reverse().find(entry => entry.type === "guess") || null;

  if (cursor.summary) {
    return {
      mode: "summary",
      chainId: chain.id,
      chainIndex: cursor.chainIndex,
      chainCount: room.chains.length,
      ownerName: getBigPlayer(bigRoom, chain.ownerId)?.name || "Player",
      originalPrompt,
      finalGuess,
      entries: chain.entries.map(entry => ({
        ...entry,
        playerName: getBigPlayer(bigRoom, entry.playerId)?.name || "Player"
      }))
    };
  }

  const target = currentDrawingRatingTarget(room);
  if (!target) return null;

  const previousDrawing = target.entry.type === "guess"
    ? [...chain.entries.slice(0, target.entryIndex)].reverse().find(entry => entry.type === "drawing") || null
    : null;

  const stats = drawingTargetRatingStats(room, target.targetKey);
  const expected = drawingExpectedRatingPairs(room).filter(pair => pair.targetKey === target.targetKey);
  const submitted = expected.filter(pair => room.ratingVotes?.[pair.voterId]?.[target.targetKey]).length;

  return {
    mode: "entry",
    chainId: chain.id,
    chainIndex: cursor.chainIndex,
    chainCount: room.chains.length,
    ownerName: getBigPlayer(bigRoom, chain.ownerId)?.name || "Player",
    entryIndex: target.entryIndex,
    entries: chain.entries.slice(0, target.entryIndex + 1).map(entry => ({
      ...entry,
      playerName: getBigPlayer(bigRoom, entry.playerId)?.name || "Player"
    })),
    currentEntry: {
      ...target.entry,
      playerName: getBigPlayer(bigRoom, target.entry.playerId)?.name || "Player",
      targetKey: target.targetKey,
      rating: stats,
      myVote: room.ratingVotes?.[viewerId]?.[target.targetKey] || "",
      canVote: target.entry.playerId !== viewerId
    },
    previousDrawing: previousDrawing ? {
      ...previousDrawing,
      playerName: getBigPlayer(bigRoom, previousDrawing.playerId)?.name || "Player"
    } : null,
    originalPrompt,
    finalGuess,
    submitted,
    expected: expected.length
  };
}

function advanceDrawingRatingCursor(bigRoom, room) {
  const cursor = normalizeDrawingRatingCursor(room);
  if (!cursor) return false;
  clearDrawingRatingTimer(bigRoom, room);

  if (cursor.summary) {
    if (cursor.chainIndex + 1 < room.chains.length) {
      room.ratingCursor = { chainIndex: cursor.chainIndex + 1, entryIndex: 1, summary: false };
      normalizeDrawingRatingCursor(room);
      return true;
    }

    maybeSettleDrawingRatings(bigRoom, room, { force: true });
    return true;
  }

  const chain = room.chains[cursor.chainIndex];
  const nextIndex = firstRateableEntryIndex(chain, cursor.entryIndex + 1);
  if (nextIndex >= 0) {
    room.ratingCursor.entryIndex = nextIndex;
    return true;
  }

  room.ratingCursor.summary = true;
  const key = drawingRoomTimerKey(bigRoom, room);
  const timer = setTimeout(() => {
    if (room.phase !== "rating" || !room.ratingCursor?.summary) return;
    advanceDrawingRatingCursor(bigRoom, room);
    emitEverything(bigRoom);
  }, DRAWING_CHAIN_SUMMARY_MS);
  drawingRatingTimers.set(key, timer);
  return true;
}

function maybeAdvanceDrawingRatingCursor(bigRoom, room) {
  const target = currentDrawingRatingTarget(room);
  if (!target) return false;

  const expected = drawingExpectedRatingPairs(room).filter(pair => pair.targetKey === target.targetKey);
  if (!expected.length) return advanceDrawingRatingCursor(bigRoom, room);

  const complete = expected.every(({ voterId, targetKey }) => room.ratingVotes?.[voterId]?.[targetKey]);
  if (!complete) return false;

  return advanceDrawingRatingCursor(bigRoom, room);
}

function publicDrawingChains(bigRoom, room) {
  if (room.phase !== "rating" && room.phase !== "gallery") return [];
  return room.chains.map(chain => {
    const participants = drawingPerformanceTargets(room)
      .filter(target => target.chainId === chain.id)
      .map(target => ({
        playerId: target.playerId,
        playerName: getBigPlayer(bigRoom, target.playerId)?.name || "Player",
        targetKey: target.targetKey,
        entryIndex: target.entryIndex,
        entryType: target.entryType,
        rating: drawingTargetRatingStats(room, target.targetKey)
      }));

    return {
      id: chain.id,
      ownerId: chain.ownerId,
      ownerName: getBigPlayer(bigRoom, chain.ownerId)?.name || "Player",
      participants,
      entries: chain.entries.map((entry, index) => ({
        ...entry,
        id: drawingEntryId(chain, entry, index),
        playerName: getBigPlayer(bigRoom, entry.playerId)?.name || "Player"
      }))
    };
  });
}

function drawingExpectedRatingPairs(room) {
  const targets = drawingPerformanceTargets(room);
  const pairs = [];

  for (const voterId of room.players) {
    for (const target of targets) {
      if (target.playerId === voterId) continue;
      pairs.push({
        voterId,
        targetKey: target.targetKey,
        targetPlayerId: target.playerId,
        chainId: target.chainId,
        entryIndex: target.entryIndex,
        entryType: target.entryType
      });
    }
  }

  return pairs;
}

function drawingExpectedRatingCount(room) {
  return drawingExpectedRatingPairs(room).length;
}

function drawingSubmittedRatingCount(room) {
  let count = 0;
  for (const { voterId, targetKey } of drawingExpectedRatingPairs(room)) {
    if (room.ratingVotes?.[voterId]?.[targetKey]) count += 1;
  }
  return count;
}

function maybeSettleDrawingRatings(bigRoom, room, options = {}) {
  if (room.phase !== "rating") return false;

  const expected = drawingExpectedRatingPairs(room);
  if (!expected.length) return false;

  const complete = expected.every(({ voterId, targetKey }) => room.ratingVotes?.[voterId]?.[targetKey]);
  if (!complete && !options.force) return false;

  const perPlayer = {};
  for (const playerId of room.players) {
    perPlayer[playerId] = { good: 0, bad: 0, result: "tie", delta: 0 };
  }

  for (const { voterId, targetKey, targetPlayerId } of expected) {
    const vote = room.ratingVotes?.[voterId]?.[targetKey];
    if (vote === "good") perPlayer[targetPlayerId].good += 1;
    if (vote === "bad") perPlayer[targetPlayerId].bad += 1;
  }

  for (const [playerId, stats] of Object.entries(perPlayer)) {
    const player = getBigPlayer(bigRoom, playerId);
    if (!player) continue;

    if (stats.good > stats.bad) {
      stats.result = "won";
      stats.delta = SOCIAL_WIN_REWARD;
      player.chips += SOCIAL_WIN_REWARD;
    } else if (stats.bad > stats.good) {
      stats.result = "lost";
      stats.delta = -SOCIAL_WIN_REWARD;
      player.chips = Math.max(0, player.chips - SOCIAL_WIN_REWARD);
    } else {
      stats.result = "tie";
      stats.delta = 0;
    }

    stats.name = player.name;
  }

  room.ratingResults = perPlayer;
  room.rewarded = true;
  room.phase = "gallery";
  room.result = "Rating finished.";
  room.log.unshift("Rating finished. Good > Bad wins +100; Bad > Good loses -100; tied players stay unchanged.");
  room.log = room.log.slice(0, 80);
  return true;
}

function emitDrawingRoom(bigRoom, room) {
  for (const viewerId of room.players) {
    const socket = io.sockets.sockets.get(viewerId);
    if (!socket) continue;

    socket.emit("drawingRoomState", {
      bigRoomCode: bigRoom.code,
      id: room.id,
      name: room.name,
      phase: room.phase,
      players: room.players.map(id => publicDrawingPlayer(bigRoom, room, id)),
      myId: viewerId,
      hostId: room.hostId,
      bigHostId: bigRoom.hostId,
      stepIndex: room.stepIndex,
      task: drawingCurrentTask(room, viewerId),
      chains: publicDrawingChains(bigRoom, room),
      ratingVotes: room.ratingVotes?.[viewerId] || {},
      ratingResults: room.ratingResults || {},
      ratingView: publicDrawingRatingView(bigRoom, room, viewerId),
      deadlineAt: room.deadlineAt || null,
      timeLimitMs: DRAWING_TIME_LIMIT_MS,
      ratingsCount: drawingSubmittedRatingCount(room),
      expectedRatings: drawingExpectedRatingCount(room),
      submissionsCount: Object.keys(room.submissions || {}).length,
      expectedSubmissions: room.players.length,
      log: room.log,
      chat: room.chat,
      maxPlayers: MAX_DRAWING_PLAYERS
    });
  }
}

function advanceDrawingRoom(bigRoom, room) {
  clearDrawingPhaseTimer(bigRoom, room);
  const submissions = room.submissions || {};

  if (room.phase === "prompt") {
    for (const playerId of room.players) {
      const chain = drawingAssignedChain(room, playerId);
      const text = String(submissions[playerId]?.text || "").trim().slice(0, 200);
      chain.entries.push({ id: `${chain.id}-prompt-${playerId}`, type: "prompt", playerId, text: text || "Untitled prompt" });
    }
    room.phase = "draw";
    room.stepIndex = 1;
    room.submissions = {};
    room.log.unshift("Prompts are in. Time to draw.");
    room.log = room.log.slice(0, 80);
    scheduleDrawingPhaseTimer(bigRoom, room);
    return;
  }

  for (const playerId of room.players) {
    const chain = drawingAssignedChain(room, playerId);
    const sub = submissions[playerId];
    if (!chain || !sub) continue;

    if (room.phase === "draw") {
      chain.entries.push({ id: `${chain.id}-drawing-${chain.entries.length}-${playerId}`, type: "drawing", playerId, image: sub.image });
    } else if (room.phase === "guess") {
      chain.entries.push({
        id: `${chain.id}-guess-${chain.entries.length}-${playerId}`,
        type: "guess",
        playerId,
        text: String(sub.text || "").trim().slice(0, 200) || "No guess"
      });
    }
  }

  const maxSteps = drawingMaxSteps(room);
  room.submissions = {};

  if (room.stepIndex >= maxSteps) {
    room.phase = "rating";
    room.result = "Rating time.";
    room.ratingVotes = {};
    room.ratingResults = {};
    room.ratingCursor = { chainIndex: 0, entryIndex: 1, summary: false };
    room.deadlineAt = null;
    normalizeDrawingRatingCursor(room);
    clearDrawingPhaseTimer(bigRoom, room);
    room.log.unshift("The gallery is ready. Each chain will reveal one card at a time for voting.");
  } else {
    room.stepIndex += 1;
    room.phase = room.stepIndex % 2 === 1 ? "draw" : "guess";
    room.log.unshift(room.phase === "draw" ? "Next: draw the latest prompt/guess." : "Next: guess the latest drawing.");
    scheduleDrawingPhaseTimer(bigRoom, room);
  }

  room.log = room.log.slice(0, 80);
}


function submitDrawingRoomEntry(bigRoom, room, playerId, submission) {
  if (!room.players.includes(playerId) || room.phase === "waiting" || room.phase === "gallery" || room.phase === "rating") return false;

  room.submissions[playerId] = submission;

  if (Object.keys(room.submissions).length >= room.players.length) {
    advanceDrawingRoom(bigRoom, room);
  }

  return true;
}


function twentyFourCardValues() {
  return Array.from({ length: 13 }, (_, i) => i + 1);
}

function generateTwentyFourCards() {
  const values = twentyFourCardValues();
  for (let tries = 0; tries < 5000; tries++) {
    const cards = Array.from({ length: 4 }, () => values[Math.floor(Math.random() * values.length)]);
    if (hasTwentyFourSolution(cards)) return cards;
  }
  return [1, 3, 4, 6];
}

function hasTwentyFourSolution(cards) {
  const nums = cards.map(Number);
  const eps = 1e-9;

  function search(values) {
    if (values.length === 1) return Math.abs(values[0] - 24) < eps;

    for (let i = 0; i < values.length; i++) {
      for (let j = i + 1; j < values.length; j++) {
        const a = values[i];
        const b = values[j];
        const rest = values.filter((_, index) => index !== i && index !== j);
        const candidates = [a + b, a - b, b - a, a * b];

        if (Math.abs(b) > eps) candidates.push(a / b);
        if (Math.abs(a) > eps) candidates.push(b / a);

        for (const candidate of candidates) {
          if (search([...rest, candidate])) return true;
        }
      }
    }

    return false;
  }

  return search(nums);
}

function tokenizeTwentyFourExpression(expression) {
  return String(expression || "").match(/\d+(?:\.\d+)?|[+\-*/()]|\S/g) || [];
}

function validateTwentyFourExpression(expression, cards) {
  const tokens = tokenizeTwentyFourExpression(expression);
  if (!tokens.length) return { ok: false, message: "Enter an expression." };

  const usedNumbers = [];
  for (const token of tokens) {
    if (/^\d+(?:\.\d+)?$/.test(token)) {
      const number = Number(token);
      if (!Number.isInteger(number) || number < 1 || number > 13) {
        return { ok: false, message: "Use only whole numbers from the displayed cards." };
      }
      usedNumbers.push(number);
    } else if (!/^[+\-*/()]$/.test(token)) {
      return { ok: false, message: "Only numbers, +, -, *, /, and parentheses are allowed." };
    }
  }

  const sortedUsed = [...usedNumbers].sort((a, b) => a - b);
  const sortedCards = [...cards].sort((a, b) => a - b);
  if (sortedUsed.length !== sortedCards.length || sortedUsed.some((value, index) => value !== sortedCards[index])) {
    return { ok: false, message: `Use each card exactly once: ${cards.join(", ")}.` };
  }

  let index = 0;

  function parseExpression() {
    let value = parseTerm();
    while (tokens[index] === "+" || tokens[index] === "-") {
      const op = tokens[index++];
      const right = parseTerm();
      value = op === "+" ? value + right : value - right;
    }
    return value;
  }

  function parseTerm() {
    let value = parseFactor();
    while (tokens[index] === "*" || tokens[index] === "/") {
      const op = tokens[index++];
      const right = parseFactor();
      if (op === "/" && Math.abs(right) < 1e-12) throw new Error("Cannot divide by zero.");
      value = op === "*" ? value * right : value / right;
    }
    return value;
  }

  function parseFactor() {
    const token = tokens[index++];

    if (token === "(") {
      const value = parseExpression();
      if (tokens[index] !== ")") throw new Error("Missing closing parenthesis.");
      index++;
      return value;
    }

    if (token === "-") {
      return -parseFactor();
    }

    if (/^\d+(?:\.\d+)?$/.test(token || "")) {
      return Number(token);
    }

    throw new Error("Invalid expression.");
  }

  let value;
  try {
    value = parseExpression();
    if (index !== tokens.length) return { ok: false, message: "Invalid expression." };
  } catch (error) {
    return { ok: false, message: error.message || "Invalid expression." };
  }

  if (Math.abs(value - 24) > 1e-8) {
    return { ok: false, message: `That equals ${Number(value.toFixed(4))}, not 24.` };
  }

  return { ok: true, value };
}

function publicTwentyFourPlayer(bigRoom, room, playerId) {
  const player = getBigPlayer(bigRoom, playerId);
  const baseline = room.chipBaseline?.[playerId];
  const profitLoss = player && Number.isFinite(baseline) ? player.chips - baseline : 0;

  return {
    id: playerId,
    name: player?.name || "Unknown",
    chips: player?.chips || 0,
    brokeCount: player?.brokeCount || 0,
    profitLoss,
    connected: Boolean(player?.connected),
    isHost: room.hostId === playerId,
    isWinner: room.solvedById === playerId,
    chatBubble: publicChatBubble(player)
  };
}

function emitTwentyFourRoom(bigRoom, room) {
  for (const viewerId of room.players) {
    const socket = io.sockets.sockets.get(viewerId);
    if (!socket) continue;

    socket.emit("twentyFourRoomState", {
      bigRoomCode: bigRoom.code,
      id: room.id,
      name: room.name,
      phase: room.phase,
      roundNumber: room.roundNumber,
      cards: room.cards,
      players: room.players.map(id => publicTwentyFourPlayer(bigRoom, room, id)),
      myId: viewerId,
      hostId: room.hostId,
      bigHostId: bigRoom.hostId,
      solvedById: room.solvedById,
      solvedExpression: room.solvedExpression,
      lastResults: room.lastResults,
      skipVotesCount: Object.keys(room.skipVotes || {}).filter(id => room.players.includes(id)).length,
      expectedSkipVotes: room.players.length,
      hasSkipVoted: Boolean(room.skipVotes?.[viewerId]),
      log: room.log,
      chat: room.chat,
      maxPlayers: MAX_TWENTYFOUR_PLAYERS
    });
  }
}

function removeFromTwentyFourRoom(bigRoom, room, playerId, reason = "left the 24 Points room") {
  const idx = room.players.indexOf(playerId);
  if (idx === -1) return;

  const player = getBigPlayer(bigRoom, playerId);
  room.players.splice(idx, 1);
  if (room.skipVotes) delete room.skipVotes[playerId];
  if (room.chipBaseline) delete room.chipBaseline[playerId];
  room.log.unshift(`${player?.name || "A player"} ${reason}.`);
  room.log = room.log.slice(0, 80);

  if (room.hostId === playerId) room.hostId = room.players[0] || null;
  if (player && player.currentGameType === "twentyfour" && player.currentRoomId === room.id) {
    player.currentGameType = null;
    player.currentRoomId = null;
  }

  if (room.players.length === 0) {
    bigRoom.twentyFourRooms.delete(room.id);
    addBigLog(bigRoom, `${room.name} was removed because it became empty.`);
  }
}

function joinTwentyFourRoomInternal(bigRoom, room, playerId) {
  const player = getBigPlayer(bigRoom, playerId);
  if (!player) return;
  room.players.push(playerId);
  room.chipBaseline = room.chipBaseline || {};
  room.chipBaseline[playerId] = player.chips;
  player.currentGameType = "twentyfour";
  player.currentRoomId = room.id;
  if (!room.hostId) room.hostId = playerId;
  room.log.unshift(`${player.name} joined the 24 Points room.`);
  room.log = room.log.slice(0, 80);
}

function maybeSkipTwentyFourRound(bigRoom, room) {
  if (room.phase !== "playing") return false;
  if (room.players.length < 1) return false;

  const allAgreed = room.players.every(playerId => room.skipVotes?.[playerId]);
  if (!allAgreed) return false;

  room.log.unshift(`All players voted to skip round #${room.roundNumber}.`);
  startTwentyFourRound(bigRoom, room);
  return true;
}

function startTwentyFourRound(bigRoom, room, options = {}) {
  if (room.players.length < 1) {
    room.log.unshift("Need at least 1 player.");
    room.log = room.log.slice(0, 80);
    return;
  }

  room.phase = "playing";
  room.roundNumber += 1;
  room.cards = generateTwentyFourCards();
  room.skipVotes = {};

  // Normally, starting a new round clears the old result.
  // Auto-start after a multiplayer solve preserves the previous result for exactly one round.
  if (!options.preservePreviousResult) {
    room.solvedById = null;
    room.solvedExpression = null;
    room.lastResults = [];
  }

  room.log.unshift(`Round #${room.roundNumber}: make 24 using ${room.cards.join(", ")}.`);
  room.log = room.log.slice(0, 80);
}

function settleTwentyFourWinner(bigRoom, room, winnerId, expression) {
  if (room.phase !== "playing") return;

  const winner = getBigPlayer(bigRoom, winnerId);
  const results = [];
  let winnerGain = 0;

  if (room.players.length > 1) {
    for (const playerId of room.players) {
      if (playerId === winnerId) continue;

      const player = getBigPlayer(bigRoom, playerId);
      if (!player) continue;

      const transfer = Math.min(20, player.chips);
      player.chips = Math.max(0, player.chips - transfer);
      winnerGain += transfer;
      results.push({ id: playerId, name: player.name, delta: -transfer, result: "lost" });
    }

    if (winner) {
      winner.chips += winnerGain;
      results.unshift({ id: winnerId, name: winner.name, delta: winnerGain, result: "won" });
    }
  } else {
    if (winner) results.push({ id: winnerId, name: winner.name, delta: 0, result: "solo" });
  }

  room.solvedById = winnerId;
  room.solvedExpression = String(expression || "").slice(0, 120);
  room.lastResults = results;
  room.log.unshift(`${winner?.name || "A player"} solved it first: ${room.solvedExpression}. Winner takes ${winnerGain} chips total.`);
  room.log = room.log.slice(0, 80);

  if (room.players.length > 1) {
    startTwentyFourRound(bigRoom, room, { preservePreviousResult: true });
  } else {
    room.phase = "roundEnd";
  }
}


function regicideCardValue(card) {
  if (!card) return 0;
  if (card.rank === "A") return 1;
  if (card.rank === "J") return 10;
  if (card.rank === "Q") return 15;
  if (card.rank === "K") return 20;
  if (card.rank === "Joker") return 0;
  return Number(card.value || card.rank || 0);
}

function regicideEnemyStats(rank) {
  if (rank === "J") return { hp: 20, attack: 10 };
  if (rank === "Q") return { hp: 30, attack: 15 };
  if (rank === "K") return { hp: 40, attack: 20 };
  return { hp: 20, attack: 10 };
}

function regicideEnemyName(card) {
  return `${card.suit}${card.rank}`;
}

function makeRegicideCard(suit, rank) {
  const faceValue = rank === "A" ? 1 : rank === "J" ? 10 : rank === "Q" ? 15 : rank === "K" ? 20 : Number(rank);
  return { suit, rank, value: faceValue };
}

function makeRegicideJoker(index) {
  return { suit: "🃏", rank: "Joker", value: 0, jokerId: index };
}

function regicideHandLimit(count) {
  if (count <= 1) return 8;
  if (count === 2) return 7;
  if (count === 3) return 6;
  return 5;
}

function buildRegicideDecks(playerCount) {
  const suits = ["♠", "♥", "♦", "♣"];
  const all = [];
  for (const suit of suits) {
    for (const rank of ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]) {
      all.push(makeRegicideCard(suit, rank));
    }
  }

  const jacks = shuffle(all.filter(card => card.rank === "J"));
  const queens = shuffle(all.filter(card => card.rank === "Q"));
  const kings = shuffle(all.filter(card => card.rank === "K"));
  const enemies = [...kings, ...queens, ...jacks]; // pop() reveals J first, then Q, then K.

  let playerDeck = all.filter(card => !["J", "Q", "K"].includes(card.rank));
  if (playerCount === 3) playerDeck.push(makeRegicideJoker(1));
  if (playerCount >= 4) {
    playerDeck.push(makeRegicideJoker(1));
    playerDeck.push(makeRegicideJoker(2));
  }

  return { playerDeck: shuffle(playerDeck), enemyDeck: enemies };
}

function currentRegicidePlayerId(room) {
  return room.players[room.turnIndex] || null;
}

function publicRegicidePlayer(bigRoom, room, playerId) {
  const player = getBigPlayer(bigRoom, playerId);
  const hand = room.hands?.[playerId] || [];
  const isTurn = currentRegicidePlayerId(room) === playerId;
  const phaseRole = isTurn
    ? room.phase === "defending"
      ? "defense"
      : room.phase === "chooseNext"
        ? "choose"
        : room.phase === "playing"
          ? "attack"
          : null
    : null;

  const chipBaseline = room.chipBaseline?.[playerId];
  const chipDelta = player && Number.isFinite(chipBaseline) ? player.chips - chipBaseline : 0;

  return {
    id: playerId,
    name: player?.name || "Unknown",
    connected: Boolean(player?.connected),
    brokeCount: player?.brokeCount || 0,
    handCount: hand.length,
    handLimit: room.handLimits?.[playerId] || 0,
    isHost: room.hostId === playerId,
    isTurn,
    phaseRole,
    jokerTokens: room.jokerTokens?.[playerId] || 0,
    chipDelta,
    chatBubble: publicChatBubble(player)
  };
}

function publicRegicideEnemy(room) {
  if (!room.enemy) return null;
  const effectiveAttack = Math.max(0, (room.enemy.attack || 0) - (room.enemy.shield || 0));
  return {
    ...room.enemy,
    effectiveAttack,
    name: regicideEnemyName(room.enemy.card),
    immuneSuit: room.enemy.immunityDisabled ? null : room.enemy.card.suit,
    immuneText: room.enemy.immunityDisabled ? "None" : `${room.enemy.card.suit} ability`
  };
}

function emitRegicideRoom(bigRoom, room) {
  for (const viewerId of room.players) {
    const socket = io.sockets.sockets.get(viewerId);
    if (!socket) continue;

    socket.emit("regicideRoomState", {
      bigRoomCode: bigRoom.code,
      id: room.id,
      name: room.name,
      phase: room.phase,
      players: room.players.map(id => publicRegicidePlayer(bigRoom, room, id)),
      myId: viewerId,
      hostId: room.hostId,
      bigHostId: bigRoom.hostId,
      turnPlayerId: currentRegicidePlayerId(room),
      enemy: publicRegicideEnemy(room),
      playerDeckCount: room.playerDeck.length,
      enemyDeckCount: room.enemyDeck.length,
      discardCount: room.discard.length,
      battleZone: room.battleZone,
      lastPlayed: room.lastPlayed,
      lastEffect: room.lastEffect,
      defeatEffect: room.defeatEffect,
      loseEffect: room.loseEffect,
      defeatedBosses: room.defeatedBosses || [],
      currentAttack: room.currentAttack,
      myHand: room.hands?.[viewerId] || [],
      result: room.result,
      log: room.log,
      chat: room.chat,
      maxPlayers: MAX_REGICIDE_PLAYERS
    });
  }
}

function drawRegicideCard(room, playerId) {
  const hand = room.hands[playerId] || [];
  const limit = room.handLimits[playerId] || 0;
  if (hand.length >= limit) return false;
  if (!room.playerDeck.length) return false;
  hand.push(room.playerDeck.pop());
  room.hands[playerId] = hand;
  return true;
}

function drawRegicideRoundRobin(room, startPlayerId, count) {
  let drawn = 0;
  let safety = 0;
  let index = Math.max(0, room.players.indexOf(startPlayerId));

  while (drawn < count && room.playerDeck.length && safety < count * room.players.length * 4 + 30) {
    const playerId = room.players[index % room.players.length];
    if (drawRegicideCard(room, playerId)) drawn++;
    index++;
    safety++;

    const anyoneCanDraw = room.players.some(id => (room.hands[id]?.length || 0) < (room.handLimits[id] || 0));
    if (!anyoneCanDraw) break;
  }

  return drawn;
}

function revealNextRegicideEnemy(room) {
  const card = room.enemyDeck.pop();
  if (!card) {
    room.phase = "won";
    room.result = "Victory! All 12 enemies were defeated.";
    room.enemy = null;
    return false;
  }

  const stats = regicideEnemyStats(card.rank);
  room.enemy = {
    card,
    hp: stats.hp,
    maxHp: stats.hp,
    attack: stats.attack,
    shield: 0,
    immunityDisabled: false
  };
  room.battleZone = [];
  room.lastEffect = `New enemy: ${regicideEnemyName(card)}. HP ${stats.hp}, ATK ${stats.attack}, immune to ${card.suit} ability.`;
  return true;
}

function startRegicideGame(bigRoom, room) {
  const activePlayers = room.players.filter(id => getBigPlayer(bigRoom, id)?.connected);
  if (activePlayers.length < 1 || activePlayers.length > MAX_REGICIDE_PLAYERS) {
    room.log.unshift("Regicide needs 1-4 players.");
    room.log = room.log.slice(0, 80);
    return;
  }

  const brokePlayer = activePlayers
    .map(id => getBigPlayer(bigRoom, id))
    .find(player => !player || player.chips < REGICIDE_ENTRY_FEE);
  if (brokePlayer) {
    room.log.unshift(`${brokePlayer.name} needs ${REGICIDE_ENTRY_FEE} chips to enter Regicide.`);
    room.log = room.log.slice(0, 80);
    return;
  }

  room.chipBaseline = {};
  for (const playerId of activePlayers) {
    const player = getBigPlayer(bigRoom, playerId);
    room.chipBaseline[playerId] = player.chips;
    player.chips -= REGICIDE_ENTRY_FEE;
  }

  const { playerDeck, enemyDeck } = buildRegicideDecks(activePlayers.length);
  room.phase = "playing";
  room.handNumber += 1;
  room.players = [...activePlayers];
  room.playerDeck = playerDeck;
  room.enemyDeck = enemyDeck;
  room.discard = [];
  room.battleZone = [];
  room.hands = {};
  room.handLimits = {};
  room.jokerTokens = {};
  room.lastPlayed = [];
  room.lastEffect = null;
  room.currentAttack = 0;
  room.pendingJokerPlayerId = null;
  room.defeatEffect = null;
  room.loseEffect = null;
  room.defeatedBosses = [];
  room.result = null;
  room.turnIndex = 0;

  const limit = regicideHandLimit(activePlayers.length);
  for (const playerId of activePlayers) {
    room.hands[playerId] = [];
    room.handLimits[playerId] = limit;
    room.jokerTokens[playerId] = activePlayers.length === 1 ? 2 : 0;
  }

  for (const playerId of activePlayers) {
    for (let i = 0; i < limit; i++) drawRegicideCard(room, playerId);
  }

  revealNextRegicideEnemy(room);
  room.log.unshift(`Regicide started with ${activePlayers.length} player(s). Each player paid ${REGICIDE_ENTRY_FEE} chips. Hand limit: ${limit}. Defeat all J/Q/K enemies.`);
  room.log = room.log.slice(0, 80);
}

function removeRegicideCardsFromHand(room, playerId, indices) {
  const hand = room.hands[playerId] || [];
  const clean = [...new Set((Array.isArray(indices) ? indices : []).map(Number))]
    .filter(index => Number.isInteger(index) && index >= 0 && index < hand.length)
    .sort((a, b) => b - a);

  const cards = [];
  for (const index of clean) {
    cards.unshift(hand.splice(index, 1)[0]);
  }
  room.hands[playerId] = hand;
  return cards;
}

function validateRegicidePlay(cards) {
  if (!cards.length) return { ok: false, message: "Choose at least one card." };
  if (cards.length === 1) return { ok: true };
  if (cards.some(card => card.rank === "Joker")) return { ok: false, message: "Joker must be played alone." };

  const aces = cards.filter(card => card.rank === "A");
  if (cards.length === 2 && aces.length === 1) return { ok: true };

  if (aces.length) return { ok: false, message: "A can only be paired with exactly one other card." };

  const rank = cards[0].rank;
  const total = cards.reduce((sum, card) => sum + regicideCardValue(card), 0);
  if (cards.every(card => card.rank === rank) && total <= 10) return { ok: true };

  return { ok: false, message: "Play one card, A + one card, or same-rank combo totaling 10 or less." };
}

function regicideAdvanceTurn(room, nextPlayerId = null) {
  if (nextPlayerId && room.players.includes(nextPlayerId)) {
    room.turnIndex = room.players.indexOf(nextPlayerId);
    return;
  }
  room.turnIndex = (room.turnIndex + 1) % room.players.length;
}

function regicideCanDefend(room, playerId, amount) {
  if (amount <= 0) return true;
  const total = (room.hands[playerId] || []).reduce((sum, card) => sum + regicideCardValue(card), 0);
  return total >= amount;
}

function enterRegicideDefense(bigRoom, room, playerId) {
  const attack = Math.max(0, (room.enemy?.attack || 0) - (room.enemy?.shield || 0));
  room.currentAttack = attack;

  if (attack <= 0) {
    room.lastEffect = "Enemy attack is 0 after spade defense. No discard needed.";
    room.loseEffect = null;
    regicideAdvanceTurn(room);
    room.phase = "playing";
    return;
  }

  if (!regicideCanDefend(room, playerId, attack)) {
    const player = getBigPlayer(bigRoom, playerId);
    room.phase = "lost";
    room.loseEffect = {
      targetId: playerId,
      attack,
      ts: Date.now()
    };
    room.result = `${player?.name || "A player"} cannot defend ${attack} damage. Regicide lost.`;
    room.log.unshift(room.result);
    room.log = room.log.slice(0, 80);
    return;
  }

  room.phase = "defending";
  room.loseEffect = null;
  room.lastEffect = `Enemy strikes back for ${attack}. Current player must discard cards totaling at least ${attack}.`;
}

function awardRegicideBossReward(bigRoom, room, defeatedCard) {
  const reward = REGICIDE_REWARDS[defeatedCard.rank] || 0;
  if (!reward) return 0;

  for (const playerId of room.players) {
    const player = getBigPlayer(bigRoom, playerId);
    if (player) player.chips += reward;
  }

  return reward;
}

function defeatRegicideEnemy(bigRoom, room, exact) {
  const defeated = room.enemy.card;
  const reward = awardRegicideBossReward(bigRoom, room, defeated);
  room.discard.push(...room.battleZone);
  room.battleZone = [];

  if (exact) {
    room.playerDeck.push(defeated);
    room.lastEffect = `${regicideEnemyName(defeated)} was converted exactly and placed on top of the player deck. Each player gained ${reward} chips.`;
  } else {
    room.discard.push(defeated);
    room.lastEffect = `${regicideEnemyName(defeated)} was killed and moved to discard. Each player gained ${reward} chips.`;
  }

  room.defeatEffect = {
    name: regicideEnemyName(defeated),
    rank: defeated.rank,
    suit: defeated.suit,
    reward,
    exact,
    ts: Date.now()
  };
  room.defeatedBosses = [...(room.defeatedBosses || []), {
    rank: defeated.rank,
    suit: defeated.suit,
    name: regicideEnemyName(defeated),
    exact,
    reward
  }];

  room.enemy = null;
  return revealNextRegicideEnemy(room);
}

function applyRegicidePlay(bigRoom, room, playerId, cards) {
  const player = getBigPlayer(bigRoom, playerId);
  const total = cards.reduce((sum, card) => sum + regicideCardValue(card), 0);
  const suits = [...new Set(cards.map(card => card.suit))];
  const enemy = room.enemy;
  const immuneSuit = enemy.immunityDisabled ? null : enemy.card.suit;
  const active = suit => suits.includes(suit) && suit !== immuneSuit;

  let effectLines = [];
  let damage = total;

  room.battleZone.push(...cards);
  room.lastPlayed = cards;

  if (active("♠")) {
    enemy.shield += total;
    effectLines.push(`♠ defense: enemy attack -${total}.`);
  }

  if (active("♥")) {
    const healCount = Math.min(total, room.discard.length);
    const healed = room.discard.splice(Math.max(0, room.discard.length - healCount), healCount);
    room.playerDeck.unshift(...healed);
    effectLines.push(`♥ healing: ${healCount} card(s) returned to the bottom of player deck.`);
  }

  if (active("♣")) {
    damage = total * 2;
    effectLines.push(`♣ attack: damage doubled to ${damage}.`);
  }

  if (active("♦")) {
    const drawn = drawRegicideRoundRobin(room, playerId, total);
    effectLines.push(`♦ draw: players drew ${drawn} card(s) round-robin.`);
  }

  enemy.hp -= damage;
  effectLines.push(`${player?.name || "Player"} dealt ${damage} damage with ${cards.map(card => `${card.suit}${card.rank}`).join(" ")}.`);
  room.log.unshift(effectLines.join(" "));
  room.log = room.log.slice(0, 80);

  if (enemy.hp <= 0) {
    const exact = enemy.hp === 0;
    defeatRegicideEnemy(bigRoom, room, exact);
    if (room.phase !== "won") {
      regicideAdvanceTurn(room);
      room.phase = "playing";
    }
    return;
  }

  enterRegicideDefense(bigRoom, room, playerId);
}

function publicRegicideCard(card) {
  return `${card.suit}${card.rank}`;
}

function cleanChatMessage(message) {
  return String(message || "").trim().slice(0, 240);
}

function addChatMessage(target, player, message) {
  const clean = cleanChatMessage(message);
  if (!clean || !player) return false;

  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  target.chat = target.chat || [];
  target.chat.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    time,
    playerId: player.id,
    name: player.name,
    message: clean
  });
  target.chat = target.chat.slice(-80);
  player.chatBubble = {
    message: clean,
    ts: Date.now()
  };
  return true;
}

function syncDiceSeatWithPlayer(bigRoom, playerId) {
  const player = getBigPlayer(bigRoom, playerId);
  const table = findDiceRoomContaining(bigRoom, playerId);
  if (!player || !table || !table.seats[playerId]) return;
  table.seats[playerId].diceCount = player.diceCount ?? STARTING_DICE;
  table.seats[playerId].active = table.seats[playerId].diceCount > 0;
}


function addBoardLog(room, message) {
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  room.log.unshift(`[${time}] ${message}`);
  room.log = room.log.slice(0, 90);
}

function resetGomokuBoard(room) {
  room.board = Array.from({ length: GOMOKU_SIZE }, () => Array(GOMOKU_SIZE).fill(null));
  room.turnIndex = 0;
  room.winnerId = null;
  room.winningLine = [];
  room.result = null;
}

function resetConnectFourBoard(room) {
  room.board = Array.from({ length: CONNECT_FOUR_ROWS }, () => Array(CONNECT_FOUR_COLS).fill(null));
  room.turnIndex = 0;
  room.winnerId = null;
  room.winningLine = [];
  room.result = null;
}

function publicBoardPlayer(bigRoom, room, playerId) {
  const player = getBigPlayer(bigRoom, playerId);
  const index = room.players.indexOf(playerId);
  const isConnectFour = room.board?.length === CONNECT_FOUR_ROWS && room.board?.[0]?.length === CONNECT_FOUR_COLS;
  const mark = index === 0
    ? (isConnectFour ? "red" : "black")
    : index === 1
      ? (isConnectFour ? "yellow" : "white")
      : "spectator";

  return {
    id: playerId,
    name: player?.name || "Unknown",
    chips: player?.chips || 0,
    brokeCount: player?.brokeCount || 0,
    connected: Boolean(player?.connected),
    isHost: room.hostId === playerId,
    isTurn: room.players[room.turnIndex] === playerId,
    mark,
    chatBubble: publicChatBubble(player)
  };
}

function emitGomokuRoom(bigRoom, room) {
  for (const viewerId of room.players) {
    const socket = io.sockets.sockets.get(viewerId);
    if (!socket) continue;

    socket.emit("gomokuRoomState", {
      bigRoomCode: bigRoom.code,
      id: room.id,
      name: room.name,
      phase: room.phase,
      board: room.board,
      players: room.players.map(id => publicBoardPlayer(bigRoom, room, id)),
      myId: viewerId,
      hostId: room.hostId,
      bigHostId: bigRoom.hostId,
      turnPlayerId: room.players[room.turnIndex] || null,
      winnerId: room.winnerId,
      winningLine: room.winningLine || [],
      result: room.result,
      log: room.log,
      chat: room.chat,
      size: GOMOKU_SIZE,
      maxPlayers: MAX_GOMOKU_PLAYERS
    });
  }
}

function emitConnectFourRoom(bigRoom, room) {
  for (const viewerId of room.players) {
    const socket = io.sockets.sockets.get(viewerId);
    if (!socket) continue;

    socket.emit("connectFourRoomState", {
      bigRoomCode: bigRoom.code,
      id: room.id,
      name: room.name,
      phase: room.phase,
      board: room.board,
      players: room.players.map(id => publicBoardPlayer(bigRoom, room, id)),
      myId: viewerId,
      hostId: room.hostId,
      bigHostId: bigRoom.hostId,
      turnPlayerId: room.players[room.turnIndex] || null,
      winnerId: room.winnerId,
      winningLine: room.winningLine || [],
      result: room.result,
      log: room.log,
      chat: room.chat,
      rows: CONNECT_FOUR_ROWS,
      cols: CONNECT_FOUR_COLS,
      maxPlayers: MAX_CONNECT_FOUR_PLAYERS
    });
  }
}

function boardWinnerLine(board, row, col, mark, need) {
  const directions = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1]
  ];

  for (const [dr, dc] of directions) {
    const line = [{ row, col }];

    for (const sign of [-1, 1]) {
      let r = row + dr * sign;
      let c = col + dc * sign;

      while (board[r]?.[c] === mark) {
        line.push({ row: r, col: c });
        r += dr * sign;
        c += dc * sign;
      }
    }

    if (line.length >= need) {
      return line.sort((a, b) => a.row - b.row || a.col - b.col).slice(0, line.length);
    }
  }

  return [];
}

function boardFull(board) {
  return board.every(row => row.every(Boolean));
}

function joinGomokuRoomInternal(bigRoom, room, playerId) {
  const player = getBigPlayer(bigRoom, playerId);
  if (!player) return;
  room.players.push(playerId);
  player.currentGameType = "gomoku";
  player.currentRoomId = room.id;
  if (!room.hostId) room.hostId = playerId;
  addBoardLog(room, `${player.name} joined Gomoku.`);
}

function joinConnectFourRoomInternal(bigRoom, room, playerId) {
  const player = getBigPlayer(bigRoom, playerId);
  if (!player) return;
  room.players.push(playerId);
  player.currentGameType = "connectfour";
  player.currentRoomId = room.id;
  if (!room.hostId) room.hostId = playerId;
  addBoardLog(room, `${player.name} joined Connect Four.`);
}

function removeFromGomokuRoom(bigRoom, room, playerId, reason = "left Gomoku") {
  const idx = room.players.indexOf(playerId);
  if (idx === -1) return;
  const player = getBigPlayer(bigRoom, playerId);
  room.players.splice(idx, 1);
  addBoardLog(room, `${player?.name || "A player"} ${reason}.`);
  if (room.hostId === playerId) room.hostId = room.players[0] || null;
  if (player && player.currentGameType === "gomoku" && player.currentRoomId === room.id) {
    player.currentGameType = null;
    player.currentRoomId = null;
  }
  if (room.players.length === 0) {
    bigRoom.gomokuRooms.delete(room.id);
    addBigLog(bigRoom, `${room.name} was removed because it became empty.`);
  } else {
    room.phase = "waiting";
    resetGomokuBoard(room);
  }
}

function removeFromConnectFourRoom(bigRoom, room, playerId, reason = "left Connect Four") {
  const idx = room.players.indexOf(playerId);
  if (idx === -1) return;
  const player = getBigPlayer(bigRoom, playerId);
  room.players.splice(idx, 1);
  addBoardLog(room, `${player?.name || "A player"} ${reason}.`);
  if (room.hostId === playerId) room.hostId = room.players[0] || null;
  if (player && player.currentGameType === "connectfour" && player.currentRoomId === room.id) {
    player.currentGameType = null;
    player.currentRoomId = null;
  }
  if (room.players.length === 0) {
    bigRoom.connectFourRooms.delete(room.id);
    addBigLog(bigRoom, `${room.name} was removed because it became empty.`);
  } else {
    room.phase = "waiting";
    resetConnectFourBoard(room);
  }
}

function handleGomokuAction(socket, payload) {
  const bigRoom = findBigRoomBySocketId(socket.id);
  if (!bigRoom) return;
  const room = findGomokuRoomContaining(bigRoom, socket.id);
  if (!room) return socket.emit("errorMessage", "You are not in a Gomoku room.");

  const action = payload?.action;
  const player = getBigPlayer(bigRoom, socket.id);

  if (action === "start") {
    if (room.hostId !== socket.id) return socket.emit("errorMessage", "Only the Gomoku host can start.");
    if (room.players.length < 2) return socket.emit("errorMessage", "Gomoku needs 2 players.");
    resetGomokuBoard(room);
    room.phase = "playing";
    addBoardLog(room, `${player?.name || "Host"} started Gomoku. Black goes first.`);
    emitEverything(bigRoom);
    return;
  }

  if (action === "place") {
    if (room.phase !== "playing") return socket.emit("errorMessage", "Gomoku is not playing.");
    if (room.players[room.turnIndex] !== socket.id) return socket.emit("errorMessage", "It is not your turn.");

    const row = Number(payload.row);
    const col = Number(payload.col);
    if (!Number.isInteger(row) || !Number.isInteger(col) || row < 0 || row >= GOMOKU_SIZE || col < 0 || col >= GOMOKU_SIZE) {
      return socket.emit("errorMessage", "Invalid Gomoku move.");
    }
    if (room.board[row][col]) return socket.emit("errorMessage", "That spot is already occupied.");

    const mark = room.turnIndex === 0 ? "black" : "white";
    room.board[row][col] = mark;
    const line = boardWinnerLine(room.board, row, col, mark, 5);

    if (line.length >= 5) {
      room.phase = "gameEnd";
      room.winnerId = socket.id;
      room.winningLine = line;
      room.result = `${player?.name || "A player"} wins Gomoku!`;
      addBoardLog(room, room.result);
    } else if (boardFull(room.board)) {
      room.phase = "gameEnd";
      room.result = "Gomoku ended in a draw.";
      addBoardLog(room, room.result);
    } else {
      room.turnIndex = room.turnIndex === 0 ? 1 : 0;
    }

    emitEverything(bigRoom);
  }
}

function handleConnectFourAction(socket, payload) {
  const bigRoom = findBigRoomBySocketId(socket.id);
  if (!bigRoom) return;
  const room = findConnectFourRoomContaining(bigRoom, socket.id);
  if (!room) return socket.emit("errorMessage", "You are not in a Connect Four room.");

  const action = payload?.action;
  const player = getBigPlayer(bigRoom, socket.id);

  if (action === "start") {
    if (room.hostId !== socket.id) return socket.emit("errorMessage", "Only the Connect Four host can start.");
    if (room.players.length < 2) return socket.emit("errorMessage", "Connect Four needs 2 players.");
    resetConnectFourBoard(room);
    room.phase = "playing";
    addBoardLog(room, `${player?.name || "Host"} started Connect Four. Red goes first.`);
    emitEverything(bigRoom);
    return;
  }

  if (action === "drop") {
    if (room.phase !== "playing") return socket.emit("errorMessage", "Connect Four is not playing.");
    if (room.players[room.turnIndex] !== socket.id) return socket.emit("errorMessage", "It is not your turn.");

    const col = Number(payload.col);
    if (!Number.isInteger(col) || col < 0 || col >= CONNECT_FOUR_COLS) {
      return socket.emit("errorMessage", "Invalid column.");
    }

    let row = -1;
    for (let r = CONNECT_FOUR_ROWS - 1; r >= 0; r--) {
      if (!room.board[r][col]) {
        row = r;
        break;
      }
    }
    if (row < 0) return socket.emit("errorMessage", "That column is full.");

    const mark = room.turnIndex === 0 ? "red" : "yellow";
    room.board[row][col] = mark;
    const line = boardWinnerLine(room.board, row, col, mark, 4);

    if (line.length >= 4) {
      room.phase = "gameEnd";
      room.winnerId = socket.id;
      room.winningLine = line;
      room.result = `${player?.name || "A player"} wins Connect Four!`;
      addBoardLog(room, room.result);
    } else if (boardFull(room.board)) {
      room.phase = "gameEnd";
      room.result = "Connect Four ended in a draw.";
      addBoardLog(room, room.result);
    } else {
      room.turnIndex = room.turnIndex === 0 ? 1 : 0;
    }

    emitEverything(bigRoom);
  }
}


io.on("connection", socket => {
  socket.on("joinBigRoom", ({ roomCode, name }) => {
    const code = cleanRoomCode(roomCode);
    const playerName = cleanName(name);

    if (!code) {
      socket.emit("errorMessage", "Big room code cannot be empty.");
      return;
    }

    let bigRoom = bigRooms.get(code);
    if (!bigRoom) {
      bigRoom = makeBigRoom(code);
      bigRooms.set(code, bigRoom);
    }

    socket.join(code);

    let player = getBigPlayer(bigRoom, socket.id);
    if (!player) {
      player = {
        id: socket.id,
        name: playerName,
        chips: STARTING_CHIPS,
        diceCount: STARTING_DICE,
        connected: true,
        currentGameType: null,
        currentRoomId: null,
        chatBubble: null,
        brokeCount: 0,
        lastChips: STARTING_CHIPS
      };
      bigRoom.players.push(player);

      if (!bigRoom.hostId) {
        bigRoom.hostId = socket.id;
        addBigLog(bigRoom, `${player.name} created the big room and became the big room host.`);
      } else {
        addBigLog(bigRoom, `${player.name} joined the big room with ${STARTING_CHIPS} chips.`);
      }
    } else {
      player.connected = true;
      player.name = playerName || player.name;
      if (!Number.isFinite(player.brokeCount)) player.brokeCount = 0;
      if (!Number.isFinite(player.lastChips)) player.lastChips = player.chips;
    }

    emitBigRoom(bigRoom);
  });


  socket.on("sellExtraDie", () => {
    const bigRoom = findBigRoomBySocketId(socket.id);
    if (!bigRoom) return;

    const player = getBigPlayer(bigRoom, socket.id);
    if (!player) return;

    if ((player.diceCount ?? STARTING_DICE) <= DICE_EXCHANGE_MINIMUM) {
      socket.emit("errorMessage", `You need more than ${DICE_EXCHANGE_MINIMUM} dice to sell one.`);
      return;
    }

    player.diceCount -= 1;
    player.chips += DICE_CASH_VALUE;
    syncDiceSeatWithPlayer(bigRoom, socket.id);
    addBigLog(bigRoom, `${player.name} sold 1 extra die for ${DICE_CASH_VALUE} chips.`);
    emitEverything(bigRoom);
  });

  socket.on("buyDie", () => {
    const bigRoom = findBigRoomBySocketId(socket.id);
    if (!bigRoom) return;

    const player = getBigPlayer(bigRoom, socket.id);
    if (!player) return;

    if ((player.diceCount ?? STARTING_DICE) >= MAX_DICE_COUNT) {
      socket.emit("errorMessage", `You can have at most ${MAX_DICE_COUNT} dice.`);
      return;
    }

    if (player.chips < DICE_CASH_VALUE) {
      socket.emit("errorMessage", `You need ${DICE_CASH_VALUE} chips to buy a die.`);
      return;
    }

    player.chips -= DICE_CASH_VALUE;
    player.diceCount = (player.diceCount ?? STARTING_DICE) + 1;
    syncDiceSeatWithPlayer(bigRoom, socket.id);
    addBigLog(bigRoom, `${player.name} bought 1 die for ${DICE_CASH_VALUE} chips.`);
    emitEverything(bigRoom);
  });

  socket.on("sendBigChat", ({ message }) => {
    const bigRoom = findBigRoomBySocketId(socket.id);
    if (!bigRoom) return;

    const player = getBigPlayer(bigRoom, socket.id);
    if (addChatMessage(bigRoom, player, message)) {
      emitBigRoom(bigRoom);
    }
  });

  socket.on("sendGameChat", ({ message }) => {
    const bigRoom = findBigRoomBySocketId(socket.id);
    if (!bigRoom) return;

    const player = getBigPlayer(bigRoom, socket.id);
    const room = findAnyGameRoomContaining(bigRoom, socket.id);
    if (!room) {
      socket.emit("errorMessage", "You are not inside a game room.");
      return;
    }

    if (addChatMessage(room, player, message)) {
      emitEverything(bigRoom);
    }
  });

  socket.on("createPokerRoom", ({ name }) => {
    const bigRoom = findBigRoomBySocketId(socket.id);
    if (!bigRoom) return;

    const existing = findAnyGameRoomContaining(bigRoom, socket.id);
    if (existing && isGameRoomRunning(existing)) {
      socket.emit("errorMessage", "You cannot create another room while a game is running.");
      return;
    }

    if (existing) {
      removeFromAnyGameRoom(bigRoom, existing, socket.id, "left for another poker room");
    }

    const id = `poker-${bigRoom.nextPokerRoomNumber++}`;
    const tableName = cleanName(name, `Poker Room ${bigRoom.nextPokerRoomNumber - 1}`);
    const table = makePokerRoom(id, tableName);
    bigRoom.pokerRooms.set(id, table);

    joinPokerRoomInternal(bigRoom, table, socket.id);
    addBigLog(bigRoom, `${getBigPlayer(bigRoom, socket.id)?.name || "A player"} created ${table.name}.`);

    emitEverything(bigRoom);
  });

  socket.on("joinPokerRoom", ({ pokerRoomId }) => {
    const bigRoom = findBigRoomBySocketId(socket.id);
    if (!bigRoom) return;

    const table = bigRoom.pokerRooms.get(pokerRoomId);
    if (!table) {
      socket.emit("errorMessage", "Poker room not found.");
      return;
    }

    const existing = findAnyGameRoomContaining(bigRoom, socket.id);
    if (existing?.id === table.id && bigRoom.pokerRooms.has(existing.id)) {
      emitPokerRoom(bigRoom, table);
      return;
    }

    if (existing && isGameRoomRunning(existing)) {
      socket.emit("errorMessage", "You cannot switch rooms while a game is running.");
      return;
    }

    if (RUNNING_PHASES.has(table.phase)) {
      socket.emit("errorMessage", "This poker room is currently in a hand. Join after the hand ends.");
      return;
    }

    if (table.players.length >= MAX_POKER_PLAYERS) {
      socket.emit("errorMessage", "This poker room is full. Maximum 10 players.");
      return;
    }

    if (existing) {
      removeFromAnyGameRoom(bigRoom, existing, socket.id, "left for another poker room");
    }

    joinPokerRoomInternal(bigRoom, table, socket.id);
    emitEverything(bigRoom);
  });


  socket.on("createBlackjackRoom", ({ name }) => {
    const bigRoom = findBigRoomBySocketId(socket.id);
    if (!bigRoom) return;

    const existing = findAnyGameRoomContaining(bigRoom, socket.id);
    if (existing && isGameRoomRunning(existing)) {
      socket.emit("errorMessage", "You cannot create another room while a game is running.");
      return;
    }

    if (existing) {
      removeFromAnyGameRoom(bigRoom, existing, socket.id, "left for another room");
    }

    const id = `blackjack-${bigRoom.nextBlackjackRoomNumber++}`;
    const tableName = cleanName(name, `Blackjack Room ${bigRoom.nextBlackjackRoomNumber - 1}`);
    const table = makeBlackjackRoom(id, tableName);
    bigRoom.blackjackRooms.set(id, table);

    joinBlackjackRoomInternal(bigRoom, table, socket.id);
    addBigLog(bigRoom, `${getBigPlayer(bigRoom, socket.id)?.name || "A player"} created ${table.name}.`);
    emitEverything(bigRoom);
  });

  socket.on("joinBlackjackRoom", ({ roomId }) => {
    const bigRoom = findBigRoomBySocketId(socket.id);
    if (!bigRoom) return;

    const table = bigRoom.blackjackRooms.get(roomId);
    if (!table) {
      socket.emit("errorMessage", "Blackjack room not found.");
      return;
    }

    const existing = findAnyGameRoomContaining(bigRoom, socket.id);
    if (existing?.id === table.id && bigRoom.blackjackRooms.has(existing.id)) {
      emitBlackjackRoom(bigRoom, table);
      return;
    }

    if (existing && isGameRoomRunning(existing)) {
      socket.emit("errorMessage", "You cannot switch rooms while a game is running.");
      return;
    }

    if (table.phase === "playerTurns" || table.phase === "dealerTurn") {
      socket.emit("errorMessage", "This blackjack room is in a round. Join after it ends.");
      return;
    }

    if (table.players.length >= MAX_BLACKJACK_PLAYERS) {
      socket.emit("errorMessage", "This blackjack room is full.");
      return;
    }

    if (existing) {
      removeFromAnyGameRoom(bigRoom, existing, socket.id, "left for blackjack");
    }

    joinBlackjackRoomInternal(bigRoom, table, socket.id);
    emitEverything(bigRoom);
  });

  socket.on("blackjackAction", payload => handleBlackjackAction(socket, payload));

  socket.on("createDiceRoom", ({ name }) => {
    const bigRoom = findBigRoomBySocketId(socket.id);
    if (!bigRoom) return;

    const existing = findAnyGameRoomContaining(bigRoom, socket.id);
    if (existing && isGameRoomRunning(existing)) {
      socket.emit("errorMessage", "You cannot create another room while a game is running.");
      return;
    }

    if (existing) {
      removeFromAnyGameRoom(bigRoom, existing, socket.id, "left for another room");
    }

    const id = `dice-${bigRoom.nextDiceRoomNumber++}`;
    const tableName = cleanName(name, `Liar's Dice Room ${bigRoom.nextDiceRoomNumber - 1}`);
    const table = makeDiceRoom(id, tableName);
    bigRoom.diceRooms.set(id, table);

    joinDiceRoomInternal(bigRoom, table, socket.id);
    addBigLog(bigRoom, `${getBigPlayer(bigRoom, socket.id)?.name || "A player"} created ${table.name}.`);
    emitEverything(bigRoom);
  });

  socket.on("joinDiceRoom", ({ roomId }) => {
    const bigRoom = findBigRoomBySocketId(socket.id);
    if (!bigRoom) return;

    const table = bigRoom.diceRooms.get(roomId);
    if (!table) {
      socket.emit("errorMessage", "Liar's Dice room not found.");
      return;
    }

    const existing = findAnyGameRoomContaining(bigRoom, socket.id);
    if (existing?.id === table.id && bigRoom.diceRooms.has(existing.id)) {
      emitDiceRoom(bigRoom, table);
      return;
    }

    if (existing && isGameRoomRunning(existing)) {
      socket.emit("errorMessage", "You cannot switch rooms while a game is running.");
      return;
    }

    if (table.phase === "bidding") {
      socket.emit("errorMessage", "This Liar's Dice room is in a round. Join after it ends.");
      return;
    }

    if (table.players.length >= MAX_DICE_PLAYERS) {
      socket.emit("errorMessage", "This Liar's Dice room is full.");
      return;
    }

    if (existing) {
      removeFromAnyGameRoom(bigRoom, existing, socket.id, "left for Liar's Dice");
    }

    joinDiceRoomInternal(bigRoom, table, socket.id);
    emitEverything(bigRoom);
  });

  socket.on("diceAction", payload => handleDiceAction(socket, payload));


  socket.on("leaveGameRoom", () => {
    const bigRoom = findBigRoomBySocketId(socket.id);
    if (!bigRoom) return;

    const room = findAnyGameRoomContaining(bigRoom, socket.id);
    if (!room) return;

    const running = isGameRoomRunning(room);
    const isTwentyFourRoom = bigRoom.twentyFourRooms.has(room.id);

    if (running && !isTwentyFourRoom) {
      socket.emit("errorMessage", "You cannot leave while the game is running. Finish the round first.");
      return;
    }

    removeFromAnyGameRoom(bigRoom, room, socket.id, "left the game room");
    socket.emit("pokerRoomState", null);
    socket.emit("blackjackRoomState", null);
    socket.emit("diceRoomState", null);
    socket.emit("werewolfRoomState", null);
    socket.emit("undercoverRoomState", null);
    socket.emit("drawingRoomState", null);
    socket.emit("twentyFourRoomState", null);
    socket.emit("regicideRoomState", null);
    socket.emit("gomokuRoomState", null);
    socket.emit("connectFourRoomState", null);
    emitEverything(bigRoom);
  });


  socket.on("createWerewolfRoom", ({ name }) => {
    const bigRoom = findBigRoomBySocketId(socket.id);
    if (!bigRoom) return;

    const existing = findAnyGameRoomContaining(bigRoom, socket.id);
    if (existing && isGameRoomRunning(existing)) {
      socket.emit("errorMessage", "You cannot create another room while a game is running.");
      return;
    }
    if (existing) removeFromAnyGameRoom(bigRoom, existing, socket.id, "left for Werewolf");

    const id = `werewolf-${bigRoom.nextWerewolfRoomNumber++}`;
    const roomName = cleanName(name, `Werewolf Room ${bigRoom.nextWerewolfRoomNumber - 1}`);
    const room = makeWerewolfRoom(id, roomName);
    bigRoom.werewolfRooms.set(id, room);

    joinWerewolfRoomInternal(bigRoom, room, socket.id);
    addBigLog(bigRoom, `${getBigPlayer(bigRoom, socket.id)?.name || "A player"} created ${room.name}.`);
    emitEverything(bigRoom);
  });

  socket.on("joinWerewolfRoom", ({ roomId }) => {
    const bigRoom = findBigRoomBySocketId(socket.id);
    if (!bigRoom) return;

    const room = bigRoom.werewolfRooms.get(roomId);
    if (!room) return socket.emit("errorMessage", "Werewolf room not found.");

    const existing = findAnyGameRoomContaining(bigRoom, socket.id);
    if (existing?.id === room.id && bigRoom.werewolfRooms.has(existing.id)) {
      emitWerewolfRoom(bigRoom, room);
      return;
    }

    if (existing && isGameRoomRunning(existing)) {
      socket.emit("errorMessage", "You cannot switch rooms while a game is running.");
      return;
    }
    if (room.phase !== "waiting" && room.phase !== "gameEnd") {
      socket.emit("errorMessage", "This Werewolf game is running. Join after it ends.");
      return;
    }
    if (room.players.length >= MAX_WEREWOLF_PLAYERS) {
      socket.emit("errorMessage", "This Werewolf room is full.");
      return;
    }

    if (existing) removeFromAnyGameRoom(bigRoom, existing, socket.id, "left for Werewolf");
    joinWerewolfRoomInternal(bigRoom, room, socket.id);
    emitEverything(bigRoom);
  });

  socket.on("werewolfAction", payload => {
    const bigRoom = findBigRoomBySocketId(socket.id);
    if (!bigRoom) return;
    const room = findWerewolfRoomContaining(bigRoom, socket.id);
    if (!room) return socket.emit("errorMessage", "You are not in a Werewolf room.");

    const action = payload?.action;
    const player = getBigPlayer(bigRoom, socket.id);
    const seat = room.seats[socket.id] || {};

    if (action === "start") {
      if (room.hostId !== socket.id) return socket.emit("errorMessage", "Only the Werewolf host can start.");
      if (room.players.length < 6) return socket.emit("errorMessage", "Werewolf needs at least 6 players for this ruleset.");

      const config = werewolfRoleConfig(room.players.length);
      room.phase = "night-wolves";
      room.roundNumber = 1;
      room.rewarded = false;
      room.votes = {};
      room.wolfVotes = {};
      room.voteRound = 1;
      room.voteCandidates = null;
      room.pendingWolfKillId = null;
      room.pendingDeathsQueue = [];
      room.witchSaved = false;
      room.witchPoisonTargetId = null;
      room.witchSaveUsed = false;
      room.witchPoisonUsed = false;
      room.seerCheck = null;
      room.seerResults = {};
      room.seerKnownRoles = {};
      room.witchSavedTargetId = null;
      room.hunterPendingId = null;
      room.hunterUsed = {};
      room.nextPhaseAfterHunter = null;
      room.result = null;

      const shuffled = [...room.players].sort(() => Math.random() - 0.5);
      let idx = 0;

      for (const id of room.players) {
        room.seats[id] = { role: "Villager", alive: true, deathReason: null };
      }

      for (let i = 0; i < config.wolves && idx < shuffled.length; i++, idx++) room.seats[shuffled[idx]].role = "Werewolf";
      for (let i = 0; i < config.seer && idx < shuffled.length; i++, idx++) room.seats[shuffled[idx]].role = "Seer";
      for (let i = 0; i < config.witch && idx < shuffled.length; i++, idx++) room.seats[shuffled[idx]].role = "Witch";
      for (let i = 0; i < config.hunter && idx < shuffled.length; i++, idx++) room.seats[shuffled[idx]].role = "Hunter";

      room.log.unshift(`Werewolf started at night. Roles: ${config.wolves} wolves, ${config.seer} seer, ${config.witch} witch, ${config.hunter} hunter, rest villagers.`);
      room.log = room.log.slice(0, 80);
      emitEverything(bigRoom);
      return;
    }

    if (action === "wolfKill") {
      if (room.phase !== "night-wolves") return socket.emit("errorMessage", "Werewolves can only kill during the wolf phase.");
      if (seat.alive === false || seat.role !== "Werewolf") return socket.emit("errorMessage", "Only alive werewolves can choose a kill target.");

      const targetId = payload?.targetId;
      if (!room.players.includes(targetId) || room.seats[targetId]?.alive === false) {
        socket.emit("errorMessage", "Invalid kill target.");
        return;
      }

      room.wolfVotes[socket.id] = targetId;
      const wolves = aliveWerewolfRoleIds(room, "Werewolf");
      const allVoted = wolves.every(id => room.wolfVotes[id]);

      if (allVoted) {
        const targets = [...new Set(wolves.map(id => room.wolfVotes[id]))];
        if (targets.length === 1) {
          room.pendingWolfKillId = targets[0];
          room.log.unshift(`Werewolves locked a target.`);
          moveWerewolfToSeerOrWitch(bigRoom, room);
        } else {
          room.log.unshift("Werewolves disagreed. They must all choose the same target.");
        }
      }

      emitEverything(bigRoom);
      return;
    }

    if (action === "seerCheck") {
      if (room.phase !== "night-seer") return socket.emit("errorMessage", "Seer can only check during the seer phase.");
      if (seat.alive === false || seat.role !== "Seer") return socket.emit("errorMessage", "Only the alive Seer can check.");

      const targetId = payload?.targetId;
      if (!room.players.includes(targetId)) return socket.emit("errorMessage", "Invalid check target.");

      const target = getBigPlayer(bigRoom, targetId);
      const role = room.seats[targetId]?.role || "Unknown";
      room.seerCheck = { seerId: socket.id, targetId, role };
      room.seerResults[socket.id] = { targetId, targetName: target?.name || "Player", role };
      room.seerKnownRoles[socket.id] = room.seerKnownRoles[socket.id] || {};
      room.seerKnownRoles[socket.id][targetId] = role;
      room.log.unshift(`Seer checked a player.`);
      moveWerewolfToWitchOrFinish(bigRoom, room);
      emitEverything(bigRoom);
      return;
    }

    if (action === "witchAction") {
      if (seat.alive === false || seat.role !== "Witch") return socket.emit("errorMessage", "Only the alive Witch can act.");

      if (room.phase === "night-witch-save") {
        const save = Boolean(payload?.save);

        if (save) {
          if (room.witchSaveUsed) return socket.emit("errorMessage", "The save potion has already been used.");
          if (!room.pendingWolfKillId) return socket.emit("errorMessage", "Nobody was killed by wolves tonight.");
          room.witchSaved = true;
          room.witchSavedTargetId = room.pendingWolfKillId;
          room.witchSaveUsed = true;
          room.log.unshift("Witch used the save potion.");
        } else {
          room.log.unshift("Witch skipped the save potion.");
        }

        moveWerewolfToWitchPoisonOrFinish(bigRoom, room);
        emitEverything(bigRoom);
        return;
      }

      if (room.phase === "night-witch-poison") {
        const poisonTargetId = payload?.poisonTargetId || null;

        if (poisonTargetId) {
          if (room.witchPoisonUsed) return socket.emit("errorMessage", "The poison potion has already been used.");
          if (!room.players.includes(poisonTargetId) || room.seats[poisonTargetId]?.alive === false) {
            return socket.emit("errorMessage", "Invalid poison target.");
          }
          if (poisonTargetId === room.pendingWolfKillId && !room.witchSaved) {
            return socket.emit("errorMessage", "That player was not saved, so they cannot be poisoned this turn.");
          }
          room.witchPoisonTargetId = poisonTargetId;
          room.witchPoisonUsed = true;
          room.log.unshift("Witch used the poison potion.");
        } else {
          room.log.unshift("Witch skipped the poison potion.");
        }

        finishWerewolfNight(bigRoom, room);
        emitEverything(bigRoom);
        return;
      }

      socket.emit("errorMessage", "Witch cannot act right now.");
      return;
    }

    if (action === "hunterShoot") {
      if (room.phase !== "hunter" || room.hunterPendingId !== socket.id) {
        return socket.emit("errorMessage", "Only the dying Hunter can shoot now.");
      }

      const targetId = payload?.targetId || null;
      room.hunterUsed[socket.id] = true;

      if (targetId) {
        if (!room.players.includes(targetId) || room.seats[targetId]?.alive === false) {
          return socket.emit("errorMessage", "Invalid hunter target.");
        }
        const shooter = getBigPlayer(bigRoom, socket.id);
        const target = getBigPlayer(bigRoom, targetId);
        room.log.unshift(`${shooter?.name || "Hunter"} shoots ${target?.name || "a player"}.`);
        const next = room.nextPhaseAfterHunter || "day";
        room.hunterPendingId = null;
        room.nextPhaseAfterHunter = null;
        const result = eliminateWerewolfPlayer(bigRoom, room, targetId, "hunter shot", next);
        if (result !== "hunter") {
          room.nextPhaseAfterHunter = next;
          continueAfterWerewolfHunter(bigRoom, room);
        }
      } else {
        room.log.unshift("Hunter skipped the shot.");
        continueAfterWerewolfHunter(bigRoom, room);
      }

      emitEverything(bigRoom);
      return;
    }

    if (action === "vote") {
      if (room.phase !== "day") return socket.emit("errorMessage", "Voting is only available during day.");
      if (seat.alive === false) return socket.emit("errorMessage", "Dead players cannot vote.");

      const targetId = payload?.targetId || "__abstain__";
      if (targetId !== "__abstain__") {
        if (!room.players.includes(targetId)) return;
        if (room.seats[targetId]?.alive === false) return socket.emit("errorMessage", "Target is already dead.");
        if (room.voteCandidates && !room.voteCandidates.includes(targetId)) {
          return socket.emit("errorMessage", "Revote target must be one of the tied players.");
        }
      }

      room.votes[socket.id] = targetId;
      room.log.unshift(`${player?.name || "A player"} voted${targetId === "__abstain__" ? " to abstain" : ""}.`);
      maybeAutoResolveWerewolfVote(bigRoom, room);
      room.log = room.log.slice(0, 80);
      emitEverything(bigRoom);
      return;
    }

    if (action === "eliminate") {
      socket.emit("errorMessage", "Werewolf eliminations are automatic in this ruleset.");
      return;
    }

    if (action === "nextPhase") {
      socket.emit("errorMessage", "Werewolf phases advance automatically in this ruleset.");
      return;
    }
  });


  socket.on("sendWerewolfWolfChat", ({ message }) => {
    const bigRoom = findBigRoomBySocketId(socket.id);
    if (!bigRoom) return;

    const room = findWerewolfRoomContaining(bigRoom, socket.id);
    if (!room) {
      socket.emit("errorMessage", "You are not inside a Werewolf room.");
      return;
    }

    const player = getBigPlayer(bigRoom, socket.id);
    const seat = room.seats[socket.id];

    if (!player || seat?.role !== "Werewolf") {
      socket.emit("errorMessage", "Only werewolves can send wolf-only messages.");
      return;
    }

    const clean = cleanChatMessage(message);
    if (!clean) return;

    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    room.wolfChat = room.wolfChat || [];
    room.wolfChat.push({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      time,
      playerId: player.id,
      name: player.name,
      message: clean,
      wolfOnly: true
    });
    room.wolfChat = room.wolfChat.slice(-80);

    emitWerewolfRoom(bigRoom, room);
  });

  socket.on("createUndercoverRoom", ({ name }) => {
    const bigRoom = findBigRoomBySocketId(socket.id);
    if (!bigRoom) return;

    const existing = findAnyGameRoomContaining(bigRoom, socket.id);
    if (existing && isGameRoomRunning(existing)) {
      socket.emit("errorMessage", "You cannot create another room while a game is running.");
      return;
    }
    if (existing) removeFromAnyGameRoom(bigRoom, existing, socket.id, "left for Who's Undercover");

    const id = `undercover-${bigRoom.nextUndercoverRoomNumber++}`;
    const roomName = cleanName(name, `Who's Undercover Room ${bigRoom.nextUndercoverRoomNumber - 1}`);
    const room = makeUndercoverRoom(id, roomName);
    bigRoom.undercoverRooms.set(id, room);

    joinUndercoverRoomInternal(bigRoom, room, socket.id);
    addBigLog(bigRoom, `${getBigPlayer(bigRoom, socket.id)?.name || "A player"} created ${room.name}.`);
    emitEverything(bigRoom);
  });

  socket.on("joinUndercoverRoom", ({ roomId }) => {
    const bigRoom = findBigRoomBySocketId(socket.id);
    if (!bigRoom) return;

    const room = bigRoom.undercoverRooms.get(roomId);
    if (!room) return socket.emit("errorMessage", "Who's Undercover room not found.");

    const existing = findAnyGameRoomContaining(bigRoom, socket.id);
    if (existing?.id === room.id && bigRoom.undercoverRooms.has(existing.id)) {
      emitUndercoverRoom(bigRoom, room);
      return;
    }

    if (existing && isGameRoomRunning(existing)) {
      socket.emit("errorMessage", "You cannot switch rooms while a game is running.");
      return;
    }
    if (room.phase !== "waiting" && room.phase !== "gameEnd") {
      socket.emit("errorMessage", "This Who's Undercover game is running. Join after it ends.");
      return;
    }
    if (room.players.length >= MAX_UNDERCOVER_PLAYERS) {
      socket.emit("errorMessage", "This Who's Undercover room is full.");
      return;
    }

    if (existing) removeFromAnyGameRoom(bigRoom, existing, socket.id, "left for Who's Undercover");
    joinUndercoverRoomInternal(bigRoom, room, socket.id);
    emitEverything(bigRoom);
  });

  socket.on("undercoverAction", payload => {
    const bigRoom = findBigRoomBySocketId(socket.id);
    if (!bigRoom) return;
    const room = findUndercoverRoomContaining(bigRoom, socket.id);
    if (!room) return socket.emit("errorMessage", "You are not in a Who's Undercover room.");

    const action = payload?.action;
    const player = getBigPlayer(bigRoom, socket.id);

    if (action === "start") {
      if (room.hostId !== socket.id) return socket.emit("errorMessage", "Only the Who's Undercover host can start.");
      if (room.players.length < 3) return socket.emit("errorMessage", "Who's Undercover needs at least 3 players.");

      const pairs = loadUndercoverWordPairs();
      const pair = pickRandom(pairs);
      const undercoverId = room.players[Math.floor(Math.random() * room.players.length)];

      room.phase = "discussion";
      room.roundNumber += 1;
      room.rewarded = false;
      room.votes = {};
      room.result = null;
      room.words = { civilian: pair[0], undercover: pair[1] };

      for (const id of room.players) {
        room.seats[id] = {
          role: id === undercoverId ? "Undercover" : "Civilian",
          word: id === undercoverId ? pair[1] : pair[0],
          alive: true
        };
      }

      room.log.unshift("Who's Undercover started. Everyone received a secret word.");
      room.log = room.log.slice(0, 80);
      emitEverything(bigRoom);
      return;
    }

    if (action === "vote") {
      if (room.phase !== "discussion" && room.phase !== "voting") return socket.emit("errorMessage", "Voting is not available now.");
      const targetId = payload?.targetId;
      if (!room.players.includes(targetId)) return;
      if (room.seats[socket.id]?.alive === false) return socket.emit("errorMessage", "Eliminated players cannot vote.");
      if (room.seats[targetId]?.alive === false) return socket.emit("errorMessage", "Target is already eliminated.");
      room.phase = "voting";
      room.votes[socket.id] = targetId;
      room.log.unshift(`${player?.name || "A player"} voted.`);
      maybeAutoResolveUndercoverVote(bigRoom, room);
      room.log = room.log.slice(0, 80);
      emitEverything(bigRoom);
      return;
    }

    if (action === "eliminate") {
      if (room.hostId !== socket.id) return socket.emit("errorMessage", "Only the host can eliminate.");
      const targetId = payload?.targetId;
      if (!room.players.includes(targetId)) return;
      eliminateUndercoverPlayer(bigRoom, room, targetId, "host action");
      emitEverything(bigRoom);
      return;
    }
  });




  socket.on("createRegicideRoom", ({ name }) => {
    const bigRoom = findBigRoomBySocketId(socket.id);
    if (!bigRoom) return;

    const existing = findAnyGameRoomContaining(bigRoom, socket.id);
    if (existing && isGameRoomRunning(existing)) {
      socket.emit("errorMessage", "You cannot create another room while a game is running.");
      return;
    }
    if (existing) removeFromAnyGameRoom(bigRoom, existing, socket.id, "left for Regicide");

    const id = `regicide-${bigRoom.nextRegicideRoomNumber++}`;
    const roomName = cleanName(name, `Regicide Room ${bigRoom.nextRegicideRoomNumber - 1}`);
    const room = makeRegicideRoom(id, roomName);
    bigRoom.regicideRooms.set(id, room);

    joinRegicideRoomInternal(bigRoom, room, socket.id);
    addBigLog(bigRoom, `${getBigPlayer(bigRoom, socket.id)?.name || "A player"} created ${room.name}.`);
    emitEverything(bigRoom);
  });

  socket.on("joinRegicideRoom", ({ roomId }) => {
    const bigRoom = findBigRoomBySocketId(socket.id);
    if (!bigRoom) return;

    const room = bigRoom.regicideRooms.get(roomId);
    if (!room) return socket.emit("errorMessage", "Regicide room not found.");

    const existing = findAnyGameRoomContaining(bigRoom, socket.id);
    if (existing?.id === room.id && bigRoom.regicideRooms.has(existing.id)) {
      emitRegicideRoom(bigRoom, room);
      return;
    }

    if (existing && isGameRoomRunning(existing)) {
      socket.emit("errorMessage", "You cannot switch rooms while a game is running.");
      return;
    }

    if (room.phase !== "waiting" && room.phase !== "won" && room.phase !== "lost") {
      socket.emit("errorMessage", "This Regicide game is already running.");
      return;
    }

    if (room.players.length >= MAX_REGICIDE_PLAYERS) {
      socket.emit("errorMessage", "This Regicide room is full.");
      return;
    }

    if (existing) removeFromAnyGameRoom(bigRoom, existing, socket.id, "left for Regicide");
    joinRegicideRoomInternal(bigRoom, room, socket.id);
    emitEverything(bigRoom);
  });

  socket.on("regicideAction", payload => {
    const bigRoom = findBigRoomBySocketId(socket.id);
    if (!bigRoom) return;

    const room = findRegicideRoomContaining(bigRoom, socket.id);
    if (!room) return socket.emit("errorMessage", "You are not in a Regicide room.");

    const action = payload?.action;
    const player = getBigPlayer(bigRoom, socket.id);

    if (action === "start") {
      if (room.hostId !== socket.id) {
        socket.emit("errorMessage", "Only the Regicide host can start.");
        return;
      }
      startRegicideGame(bigRoom, room);
      emitEverything(bigRoom);
      return;
    }

    if (action === "soloRefresh") {
      if (room.players.length !== 1) {
        socket.emit("errorMessage", "Solo refresh is only for 1-player Regicide.");
        return;
      }
      if ((room.jokerTokens?.[socket.id] || 0) <= 0) {
        socket.emit("errorMessage", "No solo Joker refresh tokens left.");
        return;
      }
      room.jokerTokens[socket.id] -= 1;
      room.discard.push(...(room.hands[socket.id] || []));
      room.hands[socket.id] = [];
      const limit = room.handLimits[socket.id] || 8;
      for (let i = 0; i < limit; i++) drawRegicideCard(room, socket.id);
      room.log.unshift(`${player?.name || "Solo player"} used a solo Joker refresh.`);
      room.log = room.log.slice(0, 80);
      emitEverything(bigRoom);
      return;
    }

    if (room.phase !== "playing" && room.phase !== "defending" && room.phase !== "chooseNext") {
      socket.emit("errorMessage", "Regicide is not in an active phase.");
      return;
    }

    const currentId = currentRegicidePlayerId(room);
    if (socket.id !== currentId && action !== "chooseNext") {
      socket.emit("errorMessage", "It is not your Regicide turn.");
      return;
    }

    if (action === "play") {
      if (room.phase !== "playing") {
        socket.emit("errorMessage", "You cannot play cards right now.");
        return;
      }

      const hand = room.hands[socket.id] || [];
      const cleanIndices = [...new Set((Array.isArray(payload?.indices) ? payload.indices : []).map(Number))]
        .filter(index => Number.isInteger(index) && index >= 0 && index < hand.length)
        .sort((a, b) => a - b);
      const selected = cleanIndices.map(index => hand[index]);
      const validation = validateRegicidePlay(selected);
      if (!validation.ok) {
        socket.emit("errorMessage", validation.message);
        return;
      }

      const played = removeRegicideCardsFromHand(room, socket.id, cleanIndices);
      if (played.length === 1 && played[0].rank === "Joker") {
        room.battleZone.push(...played);
        room.lastPlayed = played;
        if (room.enemy) room.enemy.immunityDisabled = true;
        room.phase = "chooseNext";
        room.pendingJokerPlayerId = socket.id;
        room.lastEffect = "Joker played: enemy immunity removed. Choose the next player.";
        room.log.unshift(`${player?.name || "Player"} played Joker. Enemy immunity is disabled for this enemy.`);
        room.log = room.log.slice(0, 80);
        emitEverything(bigRoom);
        return;
      }

      applyRegicidePlay(bigRoom, room, socket.id, played);
      emitEverything(bigRoom);
      return;
    }

    if (action === "pass") {
      if (room.phase !== "playing") {
        socket.emit("errorMessage", "You cannot pass right now.");
        return;
      }
      room.lastPlayed = [];
      room.lastEffect = `${player?.name || "Player"} passed and must still defend.`;
      room.log.unshift(room.lastEffect);
      room.log = room.log.slice(0, 80);
      enterRegicideDefense(bigRoom, room, socket.id);
      emitEverything(bigRoom);
      return;
    }

    if (action === "defend") {
      if (room.phase !== "defending") {
        socket.emit("errorMessage", "You are not defending right now.");
        return;
      }

      const hand = room.hands[socket.id] || [];
      const cleanIndices = [...new Set((Array.isArray(payload?.indices) ? payload.indices : []).map(Number))]
        .filter(index => Number.isInteger(index) && index >= 0 && index < hand.length)
        .sort((a, b) => a - b);
      const selected = cleanIndices.map(index => hand[index]);
      const total = selected.reduce((sum, card) => sum + regicideCardValue(card), 0);

      if (total < room.currentAttack) {
        socket.emit("errorMessage", `Discard total must be at least ${room.currentAttack}.`);
        return;
      }

      const discarded = removeRegicideCardsFromHand(room, socket.id, cleanIndices);
      room.discard.push(...discarded);
      room.log.unshift(`${player?.name || "Player"} defended ${room.currentAttack} by discarding ${discarded.map(publicRegicideCard).join(" ")}.`);
      room.log = room.log.slice(0, 80);
      room.currentAttack = 0;
      room.phase = "playing";
      regicideAdvanceTurn(room);
      emitEverything(bigRoom);
      return;
    }

    if (action === "chooseNext") {
      if (room.phase !== "chooseNext" || room.pendingJokerPlayerId !== socket.id) {
        socket.emit("errorMessage", "Only the Joker player can choose next.");
        return;
      }

      const targetId = payload?.targetId;
      if (!room.players.includes(targetId)) {
        socket.emit("errorMessage", "Choose a player in this Regicide room.");
        return;
      }

      room.phase = "playing";
      room.pendingJokerPlayerId = null;
      regicideAdvanceTurn(room, targetId);
      room.log.unshift(`${player?.name || "Joker player"} chose ${getBigPlayer(bigRoom, targetId)?.name || "a player"} to act next.`);
      room.log = room.log.slice(0, 80);
      emitEverything(bigRoom);
      return;
    }
  });

  socket.on("createTwentyFourRoom", ({ name }) => {
    const bigRoom = findBigRoomBySocketId(socket.id);
    if (!bigRoom) return;

    const existing = findAnyGameRoomContaining(bigRoom, socket.id);
    const existingIsTwentyFour = existing && bigRoom.twentyFourRooms.has(existing.id);
    if (existing && isGameRoomRunning(existing) && !existingIsTwentyFour) {
      socket.emit("errorMessage", "You cannot create another room while a game is running.");
      return;
    }
    if (existing) removeFromAnyGameRoom(bigRoom, existing, socket.id, "left for 24 Points");

    const id = `twentyfour-${bigRoom.nextTwentyFourRoomNumber++}`;
    const roomName = cleanName(name, `24 Points Room ${bigRoom.nextTwentyFourRoomNumber - 1}`);
    const room = makeTwentyFourRoom(id, roomName);
    bigRoom.twentyFourRooms.set(id, room);

    joinTwentyFourRoomInternal(bigRoom, room, socket.id);
    addBigLog(bigRoom, `${getBigPlayer(bigRoom, socket.id)?.name || "A player"} created ${room.name}.`);
    emitEverything(bigRoom);
  });

  socket.on("joinTwentyFourRoom", ({ roomId }) => {
    const bigRoom = findBigRoomBySocketId(socket.id);
    if (!bigRoom) return;

    const room = bigRoom.twentyFourRooms.get(roomId);
    if (!room) return socket.emit("errorMessage", "24 Points room not found.");

    const existing = findAnyGameRoomContaining(bigRoom, socket.id);
    if (existing?.id === room.id && bigRoom.twentyFourRooms.has(existing.id)) {
      emitTwentyFourRoom(bigRoom, room);
      return;
    }

    const existingIsTwentyFour = existing && bigRoom.twentyFourRooms.has(existing.id);
    if (existing && isGameRoomRunning(existing) && !existingIsTwentyFour) {
      socket.emit("errorMessage", "You cannot switch rooms while a game is running.");
      return;
    }

    if (room.players.length >= MAX_TWENTYFOUR_PLAYERS) {
      socket.emit("errorMessage", "This 24 Points room is full.");
      return;
    }

    if (existing) removeFromAnyGameRoom(bigRoom, existing, socket.id, "left for 24 Points");
    joinTwentyFourRoomInternal(bigRoom, room, socket.id);
    emitEverything(bigRoom);
  });

  socket.on("twentyFourAction", payload => {
    const bigRoom = findBigRoomBySocketId(socket.id);
    if (!bigRoom) return;

    const room = findTwentyFourRoomContaining(bigRoom, socket.id);
    if (!room) return socket.emit("errorMessage", "You are not in a 24 Points room.");

    const action = payload?.action;

    if (action === "start") {
      if (room.phase === "playing") {
        socket.emit("errorMessage", "A round is already running. Vote to skip instead.");
        return;
      }

      startTwentyFourRound(bigRoom, room);
      emitEverything(bigRoom);
      return;
    }

    if (action === "skipVote") {
      if (room.phase !== "playing") {
        socket.emit("errorMessage", "No active 24 Points round to skip.");
        return;
      }

      room.skipVotes = room.skipVotes || {};
      room.skipVotes[socket.id] = true;
      const player = getBigPlayer(bigRoom, socket.id);
      room.log.unshift(`${player?.name || "A player"} voted to skip this 24 Points round.`);
      room.log = room.log.slice(0, 80);

      maybeSkipTwentyFourRound(bigRoom, room);
      emitEverything(bigRoom);
      return;
    }

    if (action === "submit") {
      if (room.phase !== "playing") {
        socket.emit("errorMessage", "No active 24 Points round.");
        return;
      }

      const expression = String(payload?.expression || "").trim();
      const result = validateTwentyFourExpression(expression, room.cards);
      if (!result.ok) {
        socket.emit("errorMessage", result.message);
        return;
      }

      settleTwentyFourWinner(bigRoom, room, socket.id, expression);
      emitEverything(bigRoom);
      return;
    }
  });

  socket.on("createDrawingRoom", ({ name }) => {
    const bigRoom = findBigRoomBySocketId(socket.id);
    if (!bigRoom) return;

    const existing = findAnyGameRoomContaining(bigRoom, socket.id);
    if (existing && isGameRoomRunning(existing)) {
      socket.emit("errorMessage", "You cannot create another room while a game is running.");
      return;
    }
    if (existing) removeFromAnyGameRoom(bigRoom, existing, socket.id, "left for Draw Guess");

    const id = `drawing-${bigRoom.nextDrawingRoomNumber++}`;
    const roomName = cleanName(name, `Draw Guess Room ${bigRoom.nextDrawingRoomNumber - 1}`);
    const room = makeDrawingRoom(id, roomName);
    bigRoom.drawingRooms.set(id, room);

    joinDrawingRoomInternal(bigRoom, room, socket.id);
    addBigLog(bigRoom, `${getBigPlayer(bigRoom, socket.id)?.name || "A player"} created ${room.name}.`);
    emitEverything(bigRoom);
  });

  socket.on("joinDrawingRoom", ({ roomId }) => {
    const bigRoom = findBigRoomBySocketId(socket.id);
    if (!bigRoom) return;

    const room = bigRoom.drawingRooms.get(roomId);
    if (!room) return socket.emit("errorMessage", "Draw Guess room not found.");

    const existing = findAnyGameRoomContaining(bigRoom, socket.id);
    if (existing?.id === room.id && bigRoom.drawingRooms.has(existing.id)) {
      emitDrawingRoom(bigRoom, room);
      return;
    }

    if (existing && isGameRoomRunning(existing)) {
      socket.emit("errorMessage", "You cannot switch rooms while a game is running.");
      return;
    }
    if (room.phase !== "waiting" && room.phase !== "gallery") {
      socket.emit("errorMessage", "This Draw Guess game is running. Join after the gallery.");
      return;
    }
    if (room.players.length >= MAX_DRAWING_PLAYERS) {
      socket.emit("errorMessage", "This Draw Guess room is full.");
      return;
    }

    if (existing) removeFromAnyGameRoom(bigRoom, existing, socket.id, "left for Draw Guess");
    joinDrawingRoomInternal(bigRoom, room, socket.id);
    emitEverything(bigRoom);
  });

  socket.on("drawingAction", payload => {
    const bigRoom = findBigRoomBySocketId(socket.id);
    if (!bigRoom) return;
    const room = findDrawingRoomContaining(bigRoom, socket.id);
    if (!room) return socket.emit("errorMessage", "You are not in a Draw Guess room.");

    const action = payload?.action;

    if (action === "start") {
      if (room.hostId !== socket.id) return socket.emit("errorMessage", "Only the Draw Guess host can start.");
      if (room.players.length < 4) return socket.emit("errorMessage", "Draw Guess needs at least 4 players to avoid players receiving their own chain.");

      room.phase = "prompt";
      room.stepIndex = 0;
      room.rewarded = false;
      room.submissions = {};
      room.ratingVotes = {};
      room.ratingResults = {};
      room.ratingCursor = null;
      room.deadlineAt = null;
      room.result = null;
      clearDrawingRatingTimer(bigRoom, room);
      room.chains = room.players.map((playerId, index) => ({
        id: `chain-${index}-${Date.now()}`,
        ownerId: playerId,
        entries: []
      }));
      room.log.unshift("Draw Guess started. Everyone writes a starting prompt. Each round has a 2-minute time limit.");
      room.log = room.log.slice(0, 80);
      scheduleDrawingPhaseTimer(bigRoom, room);
      emitEverything(bigRoom);
      return;
    }

    if (action === "submitPrompt") {
      if (room.phase !== "prompt") return socket.emit("errorMessage", "Prompt submission is not open.");
      const text = String(payload?.text || "").trim().slice(0, 200);
      if (!text) return socket.emit("errorMessage", "Please enter a prompt.");
      submitDrawingRoomEntry(bigRoom, room, socket.id, { text });
      emitEverything(bigRoom);
      return;
    }

    if (action === "submitDrawing") {
      if (room.phase !== "draw") return socket.emit("errorMessage", "Drawing submission is not open.");
      const image = String(payload?.image || "");
      if (!image.startsWith("data:image/")) return socket.emit("errorMessage", "Invalid drawing image.");
      submitDrawingRoomEntry(bigRoom, room, socket.id, { image: image.slice(0, 600000) });
      emitEverything(bigRoom);
      return;
    }

    if (action === "submitGuess") {
      if (room.phase !== "guess") return socket.emit("errorMessage", "Guess submission is not open.");
      const text = String(payload?.text || "").trim().slice(0, 200);
      if (!text) return socket.emit("errorMessage", "Please enter a guess.");
      submitDrawingRoomEntry(bigRoom, room, socket.id, { text });
      emitEverything(bigRoom);
      return;
    }

    if (action === "submitRating") {
      if (room.phase !== "rating") return socket.emit("errorMessage", "Rating is not open.");

      const targetKey = String(payload?.targetKey || "");
      const rating = payload?.rating === "good" ? "good" : payload?.rating === "bad" ? "bad" : null;
      if (!targetKey || !rating) return socket.emit("errorMessage", "Invalid rating.");

      const currentTarget = currentDrawingRatingTarget(room);
      if (!currentTarget || currentTarget.targetKey !== targetKey) {
        return socket.emit("errorMessage", "This rating target is not currently open.");
      }

      const target = drawingPerformanceTargets(room).find(item => item.targetKey === targetKey);
      if (!target) return socket.emit("errorMessage", "Performance target not found.");
      if (target.playerId === socket.id) return socket.emit("errorMessage", "You cannot rate yourself.");

      room.ratingVotes[socket.id] = room.ratingVotes[socket.id] || {};
      room.ratingVotes[socket.id][targetKey] = rating;

      maybeAdvanceDrawingRatingCursor(bigRoom, room);
      emitEverything(bigRoom);
      return;
    }

  });

  socket.on("leavePokerRoom", () => {
    const bigRoom = findBigRoomBySocketId(socket.id);
    if (!bigRoom) return;

    const table = findPokerRoomContaining(bigRoom, socket.id);
    if (!table) return;

    if (!ensureNotRunning(table)) {
      socket.emit("errorMessage", "You cannot leave the poker room while a hand is running. Fold first and wait for the hand to end.");
      return;
    }

    removeFromPokerRoom(bigRoom, table, socket.id, "left the poker room");
    socket.emit("pokerRoomState", null);
    socket.emit("blackjackRoomState", null);
    socket.emit("diceRoomState", null);
    socket.emit("werewolfRoomState", null);
    socket.emit("undercoverRoomState", null);
    socket.emit("drawingRoomState", null);
    emitEverything(bigRoom);
  });


  socket.on("showPokerCards", ({ indices }) => {
    const bigRoom = findBigRoomBySocketId(socket.id);
    if (!bigRoom) return;

    const table = findPokerRoomContaining(bigRoom, socket.id);
    if (!table) {
      socket.emit("errorMessage", "You are not inside a poker room.");
      return;
    }

    const result = showPokerCards(bigRoom, table, socket.id, indices);
    if (!result.ok) {
      socket.emit("errorMessage", result.message);
      return;
    }

    emitEverything(bigRoom);
  });

  socket.on("startHand", () => {
    const bigRoom = findBigRoomBySocketId(socket.id);
    if (!bigRoom) return;

    const table = findPokerRoomContaining(bigRoom, socket.id);
    if (!table) {
      socket.emit("errorMessage", "You are not inside a poker room.");
      return;
    }

    if (table.hostId !== socket.id) {
      socket.emit("errorMessage", "Only the poker room host can start this poker game.");
      return;
    }

    if (RUNNING_PHASES.has(table.phase)) {
      socket.emit("errorMessage", "A hand is already running.");
      return;
    }

    if (activePlayers(bigRoom, table).length < 2) {
      socket.emit("errorMessage", "Need at least 2 players with chips to start.");
      return;
    }

    startHand(bigRoom, table);
    emitEverything(bigRoom);
  });

  socket.on("playerAction", payload => handlePokerAction(socket, payload));

  socket.on("kickPlayer", ({ playerId }) => {
    const bigRoom = findBigRoomBySocketId(socket.id);
    if (!bigRoom) return;

    if (bigRoom.hostId !== socket.id) {
      socket.emit("errorMessage", "Only the big room host can kick players.");
      return;
    }

    if (playerId === socket.id) {
      socket.emit("errorMessage", "The big room host cannot kick themselves.");
      return;
    }

    const target = getBigPlayer(bigRoom, playerId);
    if (!target) {
      socket.emit("errorMessage", "Player not found.");
      return;
    }

    const targetSocket = io.sockets.sockets.get(playerId);
    if (targetSocket) {
      targetSocket.emit("kicked", "You were kicked by the big room host.");
    }

    removeFromBigRoom(bigRoom, playerId, "was kicked by the big room host");
  });


  socket.on("voice:join", () => {
    const info = currentVoiceRoomInfo(socket.id);
    if (!info) {
      socket.emit("voice:error", { message: "Join a game room before starting voice." });
      return;
    }

    if (socket.data.voiceRoomKey && socket.data.voiceRoomKey !== info.key) {
      leaveVoiceRoom(socket, "changed voice room");
    }

    if (!voiceRooms.has(info.key)) voiceRooms.set(info.key, new Set());
    const members = voiceRooms.get(info.key);
    const peers = [...members]
      .filter(id => id !== socket.id)
      .map(id => publicVoicePeer(info.bigRoom, id));

    members.add(socket.id);
    socket.join(info.key);
    socket.data.voiceRoomKey = info.key;
    socket.data.voiceMuted = false;

    socket.emit("voice:joined", {
      roomKey: info.key,
      type: info.type,
      roomId: info.room.id,
      roomName: info.room.name,
      myId: socket.id,
      peers
    });

    socket.to(info.key).emit("voice:peer-joined", publicVoicePeer(info.bigRoom, socket.id));
  });

  socket.on("voice:leave", () => {
    leaveVoiceRoom(socket, "left voice");
  });

  socket.on("voice:mute", ({ muted } = {}) => {
    if (!socket.data.voiceRoomKey) return;
    socket.data.voiceMuted = Boolean(muted);
    socket.to(socket.data.voiceRoomKey).emit("voice:peer-muted", {
      id: socket.id,
      muted: socket.data.voiceMuted
    });
  });

  socket.on("voice:offer", ({ targetId, offer } = {}) => {
    if (!targetId || !offer || !sameVoiceRoom(socket, targetId)) return;
    io.to(targetId).emit("voice:offer", {
      from: socket.id,
      offer
    });
  });

  socket.on("voice:answer", ({ targetId, answer } = {}) => {
    if (!targetId || !answer || !sameVoiceRoom(socket, targetId)) return;
    io.to(targetId).emit("voice:answer", {
      from: socket.id,
      answer
    });
  });

  socket.on("voice:ice", ({ targetId, candidate } = {}) => {
    if (!targetId || !candidate || !sameVoiceRoom(socket, targetId)) return;
    io.to(targetId).emit("voice:ice", {
      from: socket.id,
      candidate
    });
  });


  socket.on("createGomokuRoom", ({ name }) => {
    const bigRoom = findBigRoomBySocketId(socket.id);
    if (!bigRoom) return;

    const existing = findAnyGameRoomContaining(bigRoom, socket.id);
    if (existing && isGameRoomRunning(existing)) {
      socket.emit("errorMessage", "You cannot create another room while a game is running.");
      return;
    }
    if (existing) removeFromAnyGameRoom(bigRoom, existing, socket.id, "left for Gomoku");

    const id = `gomoku-${bigRoom.nextGomokuRoomNumber++}`;
    const roomName = cleanName(name, `Gomoku Room ${bigRoom.nextGomokuRoomNumber - 1}`);
    const room = makeGomokuRoom(id, roomName);
    bigRoom.gomokuRooms.set(id, room);

    joinGomokuRoomInternal(bigRoom, room, socket.id);
    addBigLog(bigRoom, `${getBigPlayer(bigRoom, socket.id)?.name || "A player"} created ${room.name}.`);
    emitEverything(bigRoom);
  });

  socket.on("joinGomokuRoom", ({ roomId }) => {
    const bigRoom = findBigRoomBySocketId(socket.id);
    if (!bigRoom) return;

    const room = bigRoom.gomokuRooms.get(roomId);
    if (!room) return socket.emit("errorMessage", "Gomoku room not found.");

    const existing = findAnyGameRoomContaining(bigRoom, socket.id);
    if (existing?.id === room.id && bigRoom.gomokuRooms.has(existing.id)) {
      emitGomokuRoom(bigRoom, room);
      return;
    }
    if (existing && isGameRoomRunning(existing)) {
      socket.emit("errorMessage", "You cannot switch rooms while a game is running.");
      return;
    }
    if (room.phase === "playing") {
      socket.emit("errorMessage", "This Gomoku game is running. Join after it ends.");
      return;
    }
    if (room.players.length >= MAX_GOMOKU_PLAYERS) {
      socket.emit("errorMessage", "This Gomoku room is full.");
      return;
    }

    if (existing) removeFromAnyGameRoom(bigRoom, existing, socket.id, "left for Gomoku");
    joinGomokuRoomInternal(bigRoom, room, socket.id);
    emitEverything(bigRoom);
  });

  socket.on("gomokuAction", payload => handleGomokuAction(socket, payload));

  socket.on("createConnectFourRoom", ({ name }) => {
    const bigRoom = findBigRoomBySocketId(socket.id);
    if (!bigRoom) return;

    const existing = findAnyGameRoomContaining(bigRoom, socket.id);
    if (existing && isGameRoomRunning(existing)) {
      socket.emit("errorMessage", "You cannot create another room while a game is running.");
      return;
    }
    if (existing) removeFromAnyGameRoom(bigRoom, existing, socket.id, "left for Connect Four");

    const id = `connectfour-${bigRoom.nextConnectFourRoomNumber++}`;
    const roomName = cleanName(name, `Connect Four Room ${bigRoom.nextConnectFourRoomNumber - 1}`);
    const room = makeConnectFourRoom(id, roomName);
    bigRoom.connectFourRooms.set(id, room);

    joinConnectFourRoomInternal(bigRoom, room, socket.id);
    addBigLog(bigRoom, `${getBigPlayer(bigRoom, socket.id)?.name || "A player"} created ${room.name}.`);
    emitEverything(bigRoom);
  });

  socket.on("joinConnectFourRoom", ({ roomId }) => {
    const bigRoom = findBigRoomBySocketId(socket.id);
    if (!bigRoom) return;

    const room = bigRoom.connectFourRooms.get(roomId);
    if (!room) return socket.emit("errorMessage", "Connect Four room not found.");

    const existing = findAnyGameRoomContaining(bigRoom, socket.id);
    if (existing?.id === room.id && bigRoom.connectFourRooms.has(existing.id)) {
      emitConnectFourRoom(bigRoom, room);
      return;
    }
    if (existing && isGameRoomRunning(existing)) {
      socket.emit("errorMessage", "You cannot switch rooms while a game is running.");
      return;
    }
    if (room.phase === "playing") {
      socket.emit("errorMessage", "This Connect Four game is running. Join after it ends.");
      return;
    }
    if (room.players.length >= MAX_CONNECT_FOUR_PLAYERS) {
      socket.emit("errorMessage", "This Connect Four room is full.");
      return;
    }

    if (existing) removeFromAnyGameRoom(bigRoom, existing, socket.id, "left for Connect Four");
    joinConnectFourRoomInternal(bigRoom, room, socket.id);
    emitEverything(bigRoom);
  });

  socket.on("connectFourAction", payload => handleConnectFourAction(socket, payload));

  socket.on("leaveBigRoom", () => {
    leaveVoiceRoom(socket, "left big room");
    const bigRoom = findBigRoomBySocketId(socket.id);
    if (!bigRoom) return;
    removeFromBigRoom(bigRoom, socket.id, "left the big room");
  });

  socket.on("disconnect", () => {
    leaveVoiceRoom(socket, "disconnected");
    const bigRoom = findBigRoomBySocketId(socket.id);
    if (!bigRoom) return;
    removeFromBigRoom(bigRoom, socket.id, "disconnected");
  });
});

function joinPokerRoomInternal(bigRoom, table, playerId) {
  const player = getBigPlayer(bigRoom, playerId);
  if (!player) return;

  table.players.push(playerId);
  table.seats[playerId] = emptySeat();
  player.currentGameType = "poker";
  player.currentRoomId = table.id;

  if (!table.hostId) {
    table.hostId = playerId;
    addPokerLog(table, `${player.name} entered first and became the poker room host.`);
  } else {
    addPokerLog(table, `${player.name} joined the poker room.`);
  }
}

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Poker server running on http://localhost:${PORT}`);
  console.log(`LAN test: open http://YOUR_LOCAL_IP:${PORT} on another device.`);
});
