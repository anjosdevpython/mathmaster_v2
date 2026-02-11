
import { LevelConfig, Question, OperationType } from '../types';

// Difficulty tier based on level (1-6)
const getTier = (level: number): number => {
  if (level <= 5) return 1;
  if (level <= 10) return 2;
  if (level <= 15) return 3;
  if (level <= 20) return 4;
  if (level <= 25) return 5;
  return 6;
};

const rand = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// ─── ADDITION ───────────────────────────────────────────
const generateAddition = (tier: number): Omit<Question, 'opType'> => {
  const ranges: [number, number][] = [
    [1, 20],     // Tier 1: somas simples
    [10, 50],    // Tier 2: dezenas
    [20, 100],   // Tier 3: centenas baixas
    [50, 300],   // Tier 4: centenas médias
    [100, 500],  // Tier 5: centenas altas
    [100, 999],  // Tier 6: milhar
  ];
  const [min, max] = ranges[tier - 1];
  const a = rand(min, max);
  const b = rand(min, max);
  const answer = a + b;

  return {
    text: `${a} + ${b}`,
    answer,
    values: [a, b],
    hint: 'Arredonde para a dezena mais próxima e ajuste depois.',
    explanation: `ARREDONDAMENTO: Números redondos são fáceis de somar.|AÇÃO: Ajuste ${a} ou ${b} para a dezena mais próxima.|AJUSTE: Corrija a diferença do arredondamento.|SOLUÇÃO: ${a} + ${b} = ${answer}.`,
  };
};

// ─── SUBTRACTION ────────────────────────────────────────
const generateSubtraction = (tier: number): Omit<Question, 'opType'> => {
  const ranges: [number, number][] = [
    [1, 20],
    [10, 50],
    [20, 100],
    [50, 300],
    [100, 500],
    [100, 999],
  ];
  const [min, max] = ranges[tier - 1];
  const a = rand(min + Math.floor((max - min) / 3), max); // a é sempre maior
  const b = rand(min, a - 1);
  const answer = a - b;

  return {
    text: `${a} - ${b}`,
    answer,
    values: [a, b],
    hint: `Quanto falta para ir de ${b} até ${a}?`,
    explanation: `DISTÂNCIA: Quanto falta de ${b} até ${a}?|PASSO 1: Suba de ${b} até a próxima dezena (${Math.ceil(b / 10) * 10}).|PASSO 2: Continue até ${a}.|SOLUÇÃO: ${a} - ${b} = ${answer}.`,
  };
};

// ─── MULTIPLICATION ─────────────────────────────────────
const generateMultiplication = (tier: number): Omit<Question, 'opType'> => {
  let a: number, b: number;

  switch (tier) {
    case 1: // Tabuada básica
      a = rand(2, 5);
      b = rand(2, 5);
      break;
    case 2: // Tabuada completa
      a = rand(2, 9);
      b = rand(2, 9);
      break;
    case 3: // Tabuada estendida
      a = rand(2, 12);
      b = rand(2, 12);
      break;
    case 4: // 2 dígitos × 1 dígito
      a = rand(10, 25);
      b = rand(2, 9);
      break;
    case 5: // 2 dígitos × 1-2 dígitos
      a = rand(10, 50);
      b = rand(2, 12);
      break;
    default: // 2 dígitos × 2 dígitos
      a = rand(10, 99);
      b = rand(10, 25);
      break;
  }

  const answer = a * b;
  return {
    text: `${a} × ${b}`,
    answer,
    values: [a, b],
    hint: `Decomponha ${a} em partes menores.`,
    explanation: `DECOMPOSIÇÃO: Quebre ${a} em partes fáceis.|PASSO 1: Multiplique as dezenas de ${a} por ${b}.|PASSO 2: Multiplique as unidades de ${a} por ${b}.|PASSO 3: Some os resultados = ${answer}.`,
  };
};

// ─── DIVISION ───────────────────────────────────────────
const generateDivision = (tier: number): Omit<Question, 'opType'> => {
  let divisor: number, result: number;

  switch (tier) {
    case 1:
      divisor = rand(2, 5);
      result = rand(1, 10);
      break;
    case 2:
      divisor = rand(2, 9);
      result = rand(2, 12);
      break;
    case 3:
      divisor = rand(2, 12);
      result = rand(2, 15);
      break;
    case 4:
      divisor = rand(3, 12);
      result = rand(5, 20);
      break;
    case 5:
      divisor = rand(5, 15);
      result = rand(5, 30);
      break;
    default:
      divisor = rand(5, 25);
      result = rand(10, 50);
      break;
  }

  const a = result * divisor;
  return {
    text: `${a} ÷ ${divisor}`,
    answer: result,
    values: [a, divisor],
    hint: `Na tabuada do ${divisor}, qual × ${divisor} = ${a}?`,
    explanation: `INVERSÃO: Pense como multiplicação ao contrário.|PERGUNTA: ${divisor} × ? = ${a}.|TESTE: Tente múltiplos de ${divisor} perto de ${a}.|RESPOSTA: ${divisor} × ${result} = ${a}.`,
  };
};

// ─── POWER ──────────────────────────────────────────────
const generatePower = (tier: number): Omit<Question, 'opType'> => {
  let base: number, exponent: number;

  if (tier <= 2) {
    base = rand(2, 5);
    exponent = 2;
  } else if (tier <= 3) {
    base = rand(2, 9);
    exponent = 2;
  } else if (tier <= 4) {
    base = rand(2, 12);
    exponent = 2;
  } else if (tier <= 5) {
    // Mix de quadrados grandes e cubos pequenos
    if (Math.random() > 0.4) {
      base = rand(2, 15);
      exponent = 2;
    } else {
      base = rand(2, 5);
      exponent = 3;
    }
  } else {
    // Quadrados grandes e cubos médios
    if (Math.random() > 0.5) {
      base = rand(5, 20);
      exponent = 2;
    } else {
      base = rand(2, 8);
      exponent = 3;
    }
  }

  const answer = Math.pow(base, exponent);
  const expSymbol = exponent === 2 ? '²' : '³';

  return {
    text: `${base}${expSymbol}`,
    answer,
    values: [base],
    hint: `${base}${expSymbol} = ${base} × ${base}${exponent === 3 ? ` × ${base}` : ''}.`,
    explanation: `DEFINIÇÃO: O expoente ${exponent} significa multiplicar a base ${exponent} vezes.|AÇÃO: ${base} × ${base}${exponent === 3 ? ` × ${base}` : ''} = ?|CÁLCULO: ${exponent === 3 ? `${base}×${base}=${base * base}, depois ×${base}` : `${base} × ${base}`}.|RESULTADO: ${answer}.`,
  };
};

// ─── SQUARE ROOT ────────────────────────────────────────
const generateSqrt = (tier: number): Omit<Question, 'opType'> => {
  let maxRoot: number;

  if (tier <= 2) maxRoot = 5;
  else if (tier <= 3) maxRoot = 9;
  else if (tier <= 4) maxRoot = 12;
  else if (tier <= 5) maxRoot = 15;
  else maxRoot = 20;

  const root = rand(2, maxRoot);
  const a = root * root;

  return {
    text: `√${a}`,
    answer: root,
    values: [a],
    hint: `Que número × ele mesmo = ${a}?`,
    explanation: `INVESTIGAÇÃO: Qual número² = ${a}?|TESTE: ${root - 1}² = ${(root - 1) * (root - 1)}, ${root}² = ${a}.|CONFIRMAÇÃO: ${root} × ${root} = ${a}.|RESPOSTA: √${a} = ${root}.`,
  };
};

// ─── PERCENTAGE ─────────────────────────────────────────
const generatePercentage = (tier: number): Omit<Question, 'opType'> => {
  let percents: number[];
  let baseMultiplier: number;

  switch (tier) {
    case 1:
      percents = [10, 50];
      baseMultiplier = 10;
      break;
    case 2:
      percents = [10, 25, 50];
      baseMultiplier = 10;
      break;
    case 3:
      percents = [10, 20, 25, 50, 75];
      baseMultiplier = 20;
      break;
    case 4:
      percents = [5, 10, 15, 20, 25, 50, 75];
      baseMultiplier = 20;
      break;
    case 5:
      percents = [5, 10, 15, 20, 25, 30, 40, 50, 75];
      baseMultiplier = 40;
      break;
    default:
      percents = [5, 10, 12, 15, 20, 25, 30, 33, 40, 50, 60, 75];
      baseMultiplier = 60;
      break;
  }

  const p = pick(percents);
  // Garante que o resultado é inteiro
  const divisor = 100 / gcd(p, 100);
  const factor = rand(1, Math.floor(baseMultiplier / divisor) || 1);
  const b = factor * divisor;
  const answer = (p * b) / 100;

  let explanation: string;
  if (p === 50) {
    explanation = `CONCEITO: 50% = metade.|OPERAÇÃO: ${b} ÷ 2.|RESPOSTA: ${answer}.`;
  } else if (p === 10) {
    explanation = `TRUQUE: 10% = mover a vírgula uma casa.|AÇÃO: ${b} ÷ 10.|RESPOSTA: ${answer}.`;
  } else if (p === 25) {
    explanation = `ESTRATÉGIA: 25% = metade da metade.|PASSO 1: ${b} ÷ 2 = ${b / 2}.|PASSO 2: ${b / 2} ÷ 2 = ${answer}.`;
  } else if (p === 75) {
    explanation = `DICA: 75% = 50% + 25%.|PASSO 1: 50% de ${b} = ${b / 2}.|PASSO 2: 25% de ${b} = ${b / 4}.|SOMA: ${b / 2} + ${b / 4} = ${answer}.`;
  } else {
    explanation = `ANÁLISE: ${p}% = ${p}/100.|CÁLCULO: ${b} × ${p} ÷ 100.|DICA: Simplifique em partes (ex: 10% + 5%).|RESPOSTA: ${answer}.`;
  }

  return {
    text: `${p}% de ${b}`,
    answer,
    values: [p, b],
    hint: `Decomponha ${p}% em porcentagens mais simples.`,
    explanation,
  };
};

// ─── EQUATION ───────────────────────────────────────────
const generateEquation = (tier: number): Omit<Question, 'opType'> => {
  let text: string, answer: number, values: number[], explanation: string;

  if (tier <= 2) {
    // x + a = b
    answer = rand(1, 15);
    const a = rand(1, 10);
    const sum = answer + a;
    text = `x + ${a} = ${sum}`;
    values = [a, sum];
    explanation = `OBJETIVO: Isolar X.|LÓGICA: X + ${a} = ${sum}, então X = ${sum} - ${a}.|SOLUÇÃO: X = ${answer}.`;
  } else if (tier <= 3) {
    // x + a = b ou x - a = b (números médios)
    answer = rand(5, 30);
    const a = rand(3, 15);
    if (Math.random() > 0.5) {
      const sum = answer + a;
      text = `x + ${a} = ${sum}`;
      values = [a, sum];
      explanation = `ISOLAR X: X = ${sum} - ${a} = ${answer}.`;
    } else {
      const diff = answer - a;
      text = `x - ${a} = ${diff}`;
      values = [a, diff];
      explanation = `ISOLAR X: X = ${diff} + ${a} = ${answer}.`;
    }
  } else if (tier <= 4) {
    // ax = b
    answer = rand(2, 12);
    const coeff = rand(2, 9);
    const product = answer * coeff;
    text = `${coeff}x = ${product}`;
    values = [coeff, product];
    explanation = `ISOLAR X: Divida ambos os lados por ${coeff}.|CÁLCULO: ${product} ÷ ${coeff} = ${answer}.|SOLUÇÃO: X = ${answer}.`;
  } else if (tier <= 5) {
    // ax + b = c
    answer = rand(2, 15);
    const coeff = rand(2, 6);
    const constant = rand(1, 10);
    const result = coeff * answer + constant;
    text = `${coeff}x + ${constant} = ${result}`;
    values = [coeff, constant, result];
    explanation = `PASSO 1: Subtraia ${constant}: ${coeff}x = ${result - constant}.|PASSO 2: Divida por ${coeff}: x = ${(result - constant) / coeff}.|SOLUÇÃO: X = ${answer}.`;
  } else {
    // ax - b = c ou ax + b = c (números maiores)
    answer = rand(3, 20);
    const coeff = rand(2, 8);
    const constant = rand(2, 15);
    if (Math.random() > 0.5) {
      const result = coeff * answer + constant;
      text = `${coeff}x + ${constant} = ${result}`;
      values = [coeff, constant, result];
      explanation = `PASSO 1: ${coeff}x = ${result} - ${constant} = ${result - constant}.|PASSO 2: x = ${result - constant} ÷ ${coeff}.|SOLUÇÃO: X = ${answer}.`;
    } else {
      const result = coeff * answer - constant;
      text = `${coeff}x - ${constant} = ${result}`;
      values = [coeff, constant, result];
      explanation = `PASSO 1: ${coeff}x = ${result} + ${constant} = ${result + constant}.|PASSO 2: x = ${result + constant} ÷ ${coeff}.|SOLUÇÃO: X = ${answer}.`;
    }
  }

  return { text, answer, values, hint: 'Isole o X do outro lado da equação.', explanation };
};

// ─── FRACTION ───────────────────────────────────────────
const generateFraction = (tier: number): Omit<Question, 'opType'> => {
  let numerator: number, denominator: number, base: number;

  switch (tier) {
    case 1:
    case 2:
      denominator = pick([2, 4, 5]);
      numerator = 1;
      base = denominator * rand(1, 8);
      break;
    case 3:
      denominator = pick([2, 3, 4, 5, 10]);
      numerator = 1;
      base = denominator * rand(2, 10);
      break;
    case 4:
      denominator = pick([2, 3, 4, 5, 6, 8, 10]);
      numerator = tier > 3 && Math.random() > 0.5 ? rand(2, denominator - 1) : 1;
      base = denominator * rand(2, 12);
      break;
    case 5:
      denominator = pick([2, 3, 4, 5, 6, 8, 10, 12]);
      numerator = Math.random() > 0.4 ? rand(2, Math.min(denominator - 1, 5)) : 1;
      base = denominator * rand(3, 15);
      break;
    default:
      denominator = pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15]);
      numerator = Math.random() > 0.3 ? rand(2, Math.min(denominator - 1, 7)) : 1;
      base = denominator * rand(3, 20);
      break;
  }

  // Simplifica a fração se possível para a exibição
  const g = gcd(numerator, denominator);
  const dispNum = numerator / g;
  const dispDen = denominator / g;

  const answer = (numerator * base) / denominator;
  const fractionText = dispNum === 1 ? `1/${dispDen}` : `${dispNum}/${dispDen}`;

  return {
    text: `${fractionText} de ${base}`,
    answer,
    values: [dispNum, dispDen, base],
    hint: `Divida ${base} por ${dispDen}${dispNum > 1 ? `, depois multiplique por ${dispNum}` : ''}.`,
    explanation: `CONCEITO: ${fractionText} de ${base} = dividir em ${dispDen} partes${dispNum > 1 ? ` e pegar ${dispNum}` : ''}.|PASSO 1: ${base} ÷ ${dispDen} = ${base / dispDen}.${dispNum > 1 ? `|PASSO 2: ${base / dispDen} × ${dispNum} = ${answer}.` : ''}|RESPOSTA: ${answer}.`,
  };
};

// ─── GCD HELPER ─────────────────────────────────────────
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

// ─── QUESTION HISTORY (Anti-repetição) ──────────────────
const questionHistory = new Set<string>();

export const clearQuestionHistory = (): void => {
  questionHistory.clear();
};

// ─── MAIN GENERATOR ─────────────────────────────────────
export const generateQuestion = (config: LevelConfig, userSelectedOps?: string[], trainingQuestionCount?: number): Question => {
  // Se estiver no modo treino, calcular tier baseado no número de questões respondidas
  let tier: number;
  if (trainingQuestionCount !== undefined) {
    // A cada 5 questões corretas, aumenta 1 tier (máximo 6)
    tier = Math.min(6, Math.floor(trainingQuestionCount / 5) + 1);
  } else {
    tier = getTier(config.level);
  }

  const availableOps = userSelectedOps && userSelectedOps.length > 0
    ? userSelectedOps
    : config.operations;

  const safeOps = availableOps.length > 0 ? availableOps : ['+'];

  let attempts = 0;
  const maxAttempts = 50;
  let question: Question;

  // Gera questões até encontrar uma que não foi usada recentemente
  do {
    const op = pick(safeOps) as OperationType;
    let partial: Omit<Question, 'opType'>;

    switch (op) {
      case '+':
        partial = generateAddition(tier);
        break;
      case '-':
        partial = generateSubtraction(tier);
        break;
      case '*':
        partial = generateMultiplication(tier);
        break;
      case '/':
        partial = generateDivision(tier);
        break;
      case 'power':
        partial = generatePower(tier);
        break;
      case 'sqrt':
        partial = generateSqrt(tier);
        break;
      case 'percentage':
        partial = generatePercentage(tier);
        break;
      case 'equation':
        partial = generateEquation(tier);
        break;
      case 'fraction':
        partial = generateFraction(tier);
        break;
      default:
        partial = generateAddition(tier);
        break;
    }

    question = { ...partial, opType: op };
    attempts++;

    // Se tentou muitas vezes, limpa o histórico e aceita a questão
    if (attempts >= maxAttempts) {
      questionHistory.clear();
      break;
    }
  } while (questionHistory.has(question.text));

  // Adiciona a questão ao histórico
  questionHistory.add(question.text);

  // Limita o tamanho do histórico a 100 questões
  if (questionHistory.size > 100) {
    const firstItem = questionHistory.values().next().value;
    questionHistory.delete(firstItem);
  }

  return question;
};
