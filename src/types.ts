
export enum GameState {
  HOME = 'HOME',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE',
  GAME_OVER = 'GAME_OVER',
  RANKING = 'RANKING',
  TRAINING = 'TRAINING',
  LEVEL_SELECT = 'LEVEL_SELECT'
}

export type OperationType = '+' | '-' | '*' | '/' | 'fraction' | 'power' | 'sqrt' | 'percentage' | 'equation';

export interface LevelConfig {
  level: number;
  name: string;
  operations: string[];
  range: [number, number];
  timePerQuestion: number;
  totalQuestions: number;
}

export interface Question {
  text: string;
  answer: number;
  opType: OperationType;
  values: number[];
  hint?: string;
  explanation?: string;
}

export interface ScoreEntry {
  name: string;
  score: number;
  date: string;
  levelReached: number;
}

export interface GameStats {
  score: number;
  lives: number;
  currentLevel: number;
  currentQuestionIndex: number;
  correctInLevel: number;
  perfectLevel: boolean;
}
