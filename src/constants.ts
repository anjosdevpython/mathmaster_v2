
import { LevelConfig } from './types';

const generateLevels = (): LevelConfig[] => {
  const levels: LevelConfig[] = [];
  const names = [
    // Tier 1 (1-5): Iniciante
    "Novato", "Calouro", "Júnior", "Cadete", "Agente",
    // Tier 2 (6-10): Intermediário
    "Piloto", "Ninja", "Samurai", "Guerreiro", "Sábio",
    // Tier 3 (11-15): Avançado
    "Bruxo", "Elite", "Titã", "Ciborgue", "Fênix",
    // Tier 4 (16-20): Expert
    "Dragão", "Lorde", "Alfa", "Ômega", "Galático",
    // Tier 5 (21-25): Mestre
    "Cósmico", "Quantum", "Matrix", "Oráculo", "Infinito",
    // Tier 6 (26-30): Lenda
    "Eterno", "Lenda", "Mito", "Deus", "MASTER"
  ];

  for (let i = 1; i <= 30; i++) {
    // Operações desbloqueadas progressivamente
    let ops: string[] = ['+', '-'];

    if (i >= 4) ops.push('*');           // Multiplicação a partir do nível 4
    if (i >= 8) ops.push('/');            // Divisão a partir do nível 8
    if (i >= 12) ops.push('power');       // Potenciação a partir do nível 12
    if (i >= 14) ops.push('sqrt');        // Raiz quadrada a partir do nível 14
    if (i >= 16) ops.push('percentage');  // Porcentagem a partir do nível 16
    if (i >= 18) ops.push('equation');    // Equações a partir do nível 18
    if (i >= 22) ops.push('fraction');    // Frações a partir do nível 22

    // Tempo por questão: começa generoso, fica apertado
    // Tier 1: 30s → Tier 6: 8s
    let time: number;
    if (i <= 5) time = Math.max(25, 35 - i * 2);         // 33, 31, 29, 27, 25
    else if (i <= 10) time = Math.max(18, 25 - (i - 5));  // 24, 23, 22, 21, 20 → capped 18-24
    else if (i <= 15) time = Math.max(14, 20 - (i - 10)); // 19, 18, 17, 16, 15 → capped 14-19
    else if (i <= 20) time = Math.max(12, 16 - (i - 15)); // 15, 14, 13, 12, 12
    else if (i <= 25) time = Math.max(10, 13 - (i - 20)); // 12, 11, 10, 10, 10
    else time = Math.max(8, 11 - (i - 25));               // 10, 9, 8, 8, 8

    // Questões por nível: cresce gradualmente
    let totalQuestions: number;
    if (i <= 5) totalQuestions = 8;
    else if (i <= 10) totalQuestions = 10;
    else if (i <= 15) totalQuestions = 10;
    else if (i <= 20) totalQuestions = 12;
    else if (i <= 25) totalQuestions = 12;
    else totalQuestions = 15;

    // O range é usado como fallback, mas o mathGenerator agora tem sua própria lógica de tier
    const baseRange = 10 + i * 5;

    levels.push({
      level: i,
      name: names[i - 1],
      operations: ops,
      range: [1, baseRange],
      timePerQuestion: time,
      totalQuestions
    });
  }
  return levels;
};

export const LEVELS: LevelConfig[] = generateLevels();
export const INITIAL_LIVES = 3;
export const BASE_CORRECT_POINTS = 100;
export const SPEED_BONUS_POINTS = 50;
export const WRONG_PENALTY = 20;
