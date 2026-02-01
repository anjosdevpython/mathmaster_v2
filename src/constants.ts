
import { LevelConfig } from './types';

const generateLevels = (): LevelConfig[] => {
  const levels: LevelConfig[] = [];
  const names = [
    "Novato", "Calouro", "Júnior", "Agente", "Piloto",
    "Ninja", "Samurai", "Sábio", "Bruxo", "Elite",
    "Titã", "Ciborgue", "Fênix", "Dragão", "Lorde",
    "Alfa", "Ômega", "Galático", "Cósmico", "Divino",
    "Quantum", "Matrix", "Oráculo", "Infinito", "Eterno",
    "Lenda", "Mito", "Deus", "Zen", "MASTER"
  ];

  for (let i = 1; i <= 30; i++) {
    let ops = ['+', '-'];
    let range: [number, number] = [1, 10 + (i * 5)];
    let time = Math.max(8, 30 - Math.floor(i * 0.75));

    if (i > 5) ops.push('*');
    if (i > 10) ops.push('/');
    if (i > 20) ops.push('fraction');

    // Custom adjustment for specific tiers
    if (i >= 11 && i <= 15) range = [1, 12]; // Focus on pure tables
    if (i > 25) range = [1, 200];

    levels.push({
      level: i,
      name: names[i - 1],
      operations: ops,
      range: range,
      timePerQuestion: time,
      totalQuestions: 10
    });
  }
  return levels;
};

export const LEVELS: LevelConfig[] = generateLevels();
export const INITIAL_LIVES = 3;
export const BASE_CORRECT_POINTS = 100;
export const SPEED_BONUS_POINTS = 50;
export const WRONG_PENALTY = 20;
