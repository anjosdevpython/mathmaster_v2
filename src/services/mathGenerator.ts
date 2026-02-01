
import { LevelConfig, Question, OperationType } from '../types';

export const generateQuestion = (config: LevelConfig, userSelectedOps?: string[]): Question => {
  const { range } = config;

  // Se o usuário selecionou operações específicas, use APENAS elas.
  // Caso contrário, use as operações padrão do nível.
  const availableOps = userSelectedOps && userSelectedOps.length > 0
    ? userSelectedOps
    : config.operations;

  // Fallback de segurança: se por algum motivo availableOps estiver vazio, usa adição.
  const safeOps = availableOps.length > 0 ? availableOps : ['+'];

  const op = safeOps[Math.floor(Math.random() * safeOps.length)] as OperationType;

  let a: number, b: number, answer: number, text: string, hint: string = '', explanation: string = '', values: number[] = [];

  switch (op) {
    case 'power':
      a = Math.floor(Math.random() * Math.min(range[1], 10)) + 2;
      answer = a * a;
      text = `${a}²`;
      values = [a];
      hint = `Um número ao quadrado é ele multiplicado por ele mesmo.`;
      explanation = `DEFINIÇÃO: O expoente ² significa multiplicar a base por ela mesma.|AÇÃO: Calcule ${a} × ${a} mentalmente.|RESULTADO: A área do quadrado de lado ${a} é ${answer}.`;
      break;

    case 'sqrt':
      answer = Math.floor(Math.random() * Math.min(range[1], 10)) + 2;
      a = answer * answer;
      text = `√${a}`;
      values = [a];
      hint = `Pergunte-se: Que número vezes ele mesmo dá ${a}?`;
      explanation = `INVESTIGAÇÃO: Qual número, multiplicado por ele mesmo, resulta em ${a}?|TESTE: Tente multiplicar números próximos (Ex: ${answer - 1}x${answer - 1}, ${answer}x${answer}).|CONFIRMAÇÃO: Como ${answer} × ${answer} = ${a}, a raiz é ${answer}.`;
      break;

    case 'percentage':
      const percents = [10, 20, 25, 50, 75];
      const p = percents[Math.floor(Math.random() * percents.length)];
      b = (Math.floor(Math.random() * 10) + 1) * (p === 25 || p === 75 ? 40 : 10);
      answer = (p * b) / 100;
      text = `${p}% de ${b}`;
      values = [p, b];
      if (p === 50) {
        explanation = `CONCEITO: 50% é, por definição, a metade exata de qualquer valor.|OPERAÇÃO: Divida o número total (${b}) por 2.|RESPOSTA: A metade de ${b} é ${answer}.`;
      } else if (p === 10) {
        explanation = `TRUQUE: 10% é a décima parte. Basta deslocar a vírgula uma casa à esquerda.|AÇÃO: Imagine a vírgula em ${b},0 e mova ela para trás.|RESPOSTA: O valor se torna ${answer}.`;
      } else if (p === 25) {
        explanation = `ESTRATÉGIA: 25% equivale a "metade da metade".|PASSO 1: A metade de ${b} é ${b / 2}.|PASSO 2: A metade de ${b / 2} é ${answer}.`;
      } else {
        explanation = `ANÁLISE: ${p}% de ${b} pode ser quebrado em partes mais simples.|CÁLCULO: Multiplique ${p} por ${b} e corte os zeros finais (divida por 100).|RESPOSTA: ${p} × ${b} ÷ 100 = ${answer}.`;
      }
      break;

    case 'equation':
      answer = Math.floor(Math.random() * range[1]) + 1;
      a = Math.floor(Math.random() * range[1]) + 1;
      const usePlus = Math.random() > 0.5;
      if (usePlus) {
        const sum = answer + a;
        text = `x + ${a} = ${sum}`;
        values = [a, sum];
        explanation = `OBJETIVO: Descobrir o valor oculto de X.|LÓGICA: Se X + ${a} = ${sum}, então X é a diferença entre eles.|AÇÃO: Subtraia ${a} de ${sum} (${sum} - ${a}).|SOLUÇÃO: X vale ${answer}.`;
      } else {
        const diff = answer - a;
        text = `x - ${a} = ${diff}`;
        values = [a, diff];
        explanation = `OBJETIVO: Restaurar o valor original de X.|LÓGICA: Alguém tirou ${a} e sobrou ${diff}. Precisamos devolver o valor.|AÇÃO: Some o que sobrou (${diff}) com o que foi tirado (${a}).|SOLUÇÃO: X vale ${answer}.`;
      }
      break;

    case 'fraction':
      const denominators = [2, 3, 4, 5, 10];
      const d = denominators[Math.floor(Math.random() * denominators.length)];
      const factor = Math.floor(Math.random() * 10) + 1;
      b = d * factor;
      answer = factor;
      text = `1/${d} de ${b}`;
      values = [d, b];
      explanation = `CONCEITO: Uma fração 1/${d} pede para dividir o total em ${d} grupos iguais.|OPERAÇÃO: Divida o valor ${b} pelo denominador ${d}.|CÁLCULO: Quantas vezes o ${d} cabe em ${b}?|RESPOSTA: ${answer}.`;
      break;

    case '/':
      answer = Math.floor(Math.random() * range[1]) + 1;
      b = Math.floor(Math.random() * Math.min(range[1], 12)) + 1;
      a = answer * b;
      text = `${a} ÷ ${b}`;
      values = [a, b];
      explanation = `INVERSÃO: Pense na divisão como uma multiplicação ao contrário.|PERGUNTA: Na tabuada do ${b}, qual número vezes ${b} resulta em ${a}?|TESTE: ${b} × ... = ${a}.|RESPOSTA: É o número ${answer}.`;
      break;

    case '*':
      a = Math.floor(Math.random() * Math.min(range[1], 15)) + 2;
      b = Math.floor(Math.random() * Math.min(range[1], 12)) + 2;
      answer = a * b;
      text = `${a} × ${b}`;
      values = [a, b];
      explanation = `DECOMPOSIÇÃO: Em vez de calcular tudo, quebre o ${a}.|PASSO 1: Multiplique as dezenas de ${a} por ${b}.|PASSO 2: Multiplique as unidades de ${a} por ${b}.|PASSO 3: Some os dois resultados para achar ${answer}.`;
      break;

    case '-':
      a = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
      b = Math.floor(Math.random() * (a - 1)) + 1;
      answer = a - b;
      text = `${a} - ${b}`;
      values = [a, b];
      explanation = `DISTÂNCIA: Quanto falta para ir de ${b} até ${a}?|PASSO 1: Conte de ${b} até a próxima dezena (Ex: ${Math.ceil(b / 10) * 10}).|PASSO 2: Da dezena até chegar em ${a}.|PASSO 3: Some esses dois saltos. Distância total: ${answer}.`;
      break;

    default: // Addition
      a = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
      b = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
      answer = a + b;
      text = `${a} + ${b}`;
      values = [a, b];
      explanation = `ARREDONDAMENTO: Números redondos são fáceis de somar.|AÇÃO: Ajuste o ${a} ou ${b} para a dezena mais próxima mentalmente.|AJUSTE: Some (ou subtraia) a diferença desse ajuste no resultado final.|SOLUÇÃO: ${a} + ${b} = ${answer}.`;
      break;

  }

  return { text, answer, hint, explanation, opType: op, values };
};
