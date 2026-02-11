import { supabase } from '../lib/supabase';

const STATIC_FALLBACKS: Record<string, string> = {
    '+': "[O QUE HOUVE]\n\nSincronização neural instável, mas o mestre deixou um recado.\n\n[MACETE DO ALLAN]\n\nPara somas rápidas, arredonde um dos números para a dezena mais próxima e depois desconte a diferença no final.\n\n[MISSÃO]\n\n Tente novamente com foco total!",
    '-': "[O QUE HOUVE]\n\nConexão com o templo falhou, mas a lição continua.\n\n[MACETE DO ALLAN]\n\nNa subtração, tente somar o que falta para chegar ao número maior. É muito mais fácil do que subtrair!\n\n[MISSÃO]\n\nNão desista, Jogador(a)!",
    '*': "[O QUE HOUVE]\n\nInterferência na rede neural. Macete manual ativado.\n\n[MACETE DO ALLAN]\n\nMultiplicar por 5? É só dividir o número por 2 e colocar um zero no final. Por 9? Multiplique por 10 e subtraia o número original.\n\n[MISSÃO]\n\nSua agilidade mental é sua maior arma!",
    '/': "[O QUE HOUVE]\n\nMestre offline, mas a técnica ninja está aqui.\n\n[MACETE DO ALLAN]\n\nDividir por 5 é o oposto da multiplicação: dobre o número e mova a vírgula uma casa para a esquerda.\n\n[MISSÃO]\n\nPrecisão é a chave do VektraMind."
};

export const aiService = {
    async explainError(question: string, correctAnswer: number, userAnswer: string) {
        // Detectar o operador para o fallback
        const operator = question.includes('+') ? '+' :
            question.includes('-') ? '-' :
                question.includes('x') || question.includes('*') ? '*' :
                    question.includes('/') || question.includes('÷') ? '/' : '+';

        const fallback = STATIC_FALLBACKS[operator] || STATIC_FALLBACKS['+'];

        try {
            const { data, error } = await supabase.functions.invoke('ai-mentor', {
                body: { question, correctAnswer, userAnswer }
            });

            if (error || !data?.choices?.[0]?.message?.content) {
                console.warn("Using static fallback due to AI error:", error);
                return fallback;
            }

            return data.choices[0].message.content;
        } catch (error: any) {
            console.error("AI Service failure, using fallback:", error);
            return fallback;
        }
    }
};
