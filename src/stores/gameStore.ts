import { type Player, type GameState, type Difficulty } from '../types';
import { getBoardPreset } from '../data/boardPresets';
import { COIN_REWARDS } from '../data/themes';

const STORAGE_KEY = 'quizparty_game_v2';

export function createGameState(
  playerConfigs: { name: string; color: string; emoji?: string }[],
  boardPresetId: string,
  enabledThemes: string[] = [],
  maxRounds: number = 5,
): GameState {
  const preset = getBoardPreset(boardPresetId);
  const players: Player[] = playerConfigs.map(p => ({
    id: crypto.randomUUID(),
    name: p.name,
    color: p.color,
    emoji: p.emoji || '',
    coins: 100,
    score: 0,
    position: 0,
    properties: [],
  }));

  // Fisher-Yates shuffle for random turn order
  for (let i = players.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [players[i], players[j]] = [players[j], players[i]];
  }

  return {
    players,
    currentPlayerIndex: 0,
    boardPresetId,
    board: preset.tiles.map(t => ({ ...t })),
    round: 1,
    phase: 'rolling',
    diceValue: null,
    usedQuestionIds: [],
    enabledThemes,
    maxRounds,
  };
}

export function saveGameState(state: GameState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadGameState(): GameState | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try { return JSON.parse(raw) as GameState; } catch { return null; }
  }
  return null;
}

export function clearGameState(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function nextTurn(state: GameState): GameState {
  const next = (state.currentPlayerIndex + 1) % state.players.length;
  const round = next === 0 ? state.round + 1 : state.round;
  return { ...state, currentPlayerIndex: next, round, phase: 'rolling', diceValue: null };
}

export function rollDice(state: GameState): { state: GameState; value: number } {
  const value = (Math.floor(Math.random() * 6) + 1) as Difficulty;
  return { state: { ...state, diceValue: value, phase: 'choosing-theme' }, value };
}

const LAP_BONUS = 80;

export function movePlayer(state: GameState, playerIndex: number, steps: number): GameState {
  const boardLen = state.board.length;
  const players = state.players.map((p, i) => {
    if (i !== playerIndex) return p;
    const newPos = p.position + steps;
    if (newPos >= boardLen) {
      // Wrap around: subtract board length, award lap bonus
      return { ...p, position: newPos % boardLen, coins: p.coins + LAP_BONUS };
    }
    return { ...p, position: newPos };
  });
  return { ...state, players };
}

export function addCoins(state: GameState, playerIndex: number, amount: number): GameState {
  const players = state.players.map((p, i) => {
    if (i !== playerIndex) return p;
    return { ...p, coins: Math.max(0, p.coins + amount) };
  });
  return { ...state, players };
}

export function addScore(state: GameState, playerIndex: number, points: number): GameState {
  const players = state.players.map((p, i) => {
    if (i !== playerIndex) return p;
    return { ...p, score: p.score + points };
  });
  return { ...state, players };
}

export function buyProperty(state: GameState, playerIndex: number, tileIndex: number): GameState {
  const tile = state.board[tileIndex];
  if (!tile || tile.type !== 'property' || tile.ownerId) return state;
  const player = state.players[playerIndex];
  if (player.coins < (tile.propertyPrice || 0)) return state;

  const players = state.players.map((p, i) => {
    if (i !== playerIndex) return p;
    return {
      ...p,
      coins: p.coins - (tile.propertyPrice || 0),
      properties: [...p.properties, String(tileIndex)],
    };
  });
  const board = state.board.map((t, i) => {
    if (i !== tileIndex) return t;
    return { ...t, ownerId: player.id };
  });
  return { ...state, players, board };
}

export function payToll(state: GameState, tenantIndex: number, ownerIndex: number, tileIndex: number): GameState {
  const tile = state.board[tileIndex];
  const toll = tile?.toll || 10;
  const players = state.players.map((p, i) => {
    if (i === tenantIndex) return { ...p, coins: Math.max(0, p.coins - toll) };
    if (i === ownerIndex) return { ...p, coins: p.coins + toll };
    return p;
  });
  return { ...state, players };
}

export function markQuestionUsed(state: GameState, questionId: string): GameState {
  return { ...state, usedQuestionIds: [...state.usedQuestionIds, questionId] };
}

export function getCoinReward(difficulty: Difficulty): number {
  return COIN_REWARDS[difficulty] || 10;
}

export function checkWinner(state: GameState): Player | null {
  if (state.round > state.maxRounds) {
    return getRanking(state)[0] || null;
  }
  return null;
}

export function getRanking(state: GameState): Player[] {
  return [...state.players].sort((a, b) => {
    if (b.coins !== a.coins) return b.coins - a.coins;
    if (b.score !== a.score) return b.score - a.score;
    return b.position - a.position;
  });
}

// Host controls
export function hostMovePlayer(state: GameState, playerIndex: number, position: number): GameState {
  const players = state.players.map((p, i) => {
    if (i !== playerIndex) return p;
    return { ...p, position: Math.max(0, Math.min(position, state.board.length - 1)) };
  });
  return { ...state, players };
}

export function hostSetCoins(state: GameState, playerIndex: number, coins: number): GameState {
  const players = state.players.map((p, i) => {
    if (i !== playerIndex) return p;
    return { ...p, coins: Math.max(0, coins) };
  });
  return { ...state, players };
}
