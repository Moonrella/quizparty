export type Difficulty = 1 | 2 | 3 | 4 | 5 | 6;

export type QuestionType = 'choice' | 'judge';

export interface Question {
  id: string;
  theme: string;
  difficulty: Difficulty;
  type: QuestionType;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface Player {
  id: string;
  name: string;
  color: string;
  emoji: string;
  coins: number;
  score: number;
  position: number;
  properties: string[];
}

export type TileType = 'wheel' | 'fortune' | 'property' | 'treasure' | 'safe' | 'empty';

export interface BoardTile {
  index: number;
  type: TileType;
  label: string;
  emoji: string;
  ownerId?: string;
  propertyPrice?: number;
  toll?: number;
  row: number;
  col: number;
}

export interface BoardPreset {
  id: string;
  name: string;
  emoji: string;
  description: string;
  rows: number;
  cols: number;
  tiles: BoardTile[];
  size: number;
}

export type GamePhase =
  | 'lobby'
  | 'rolling'
  | 'choosing-theme'
  | 'answering'
  | 'tile-effect'
  | 'wheel'
  | 'fortune'
  | 'buying-property'
  | 'finished';

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  boardPresetId: string;
  board: BoardTile[];
  round: number;
  phase: GamePhase;
  diceValue: Difficulty | null;
  usedQuestionIds: string[];
  enabledThemes: string[];
  maxRounds: number;
}

export interface ThemeInfo {
  id: string;
  name: string;
  emoji: string;
}
