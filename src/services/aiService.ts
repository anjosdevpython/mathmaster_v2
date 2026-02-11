import { supabase } from '../lib/supabase';

const STATIC_FALLBACKS: Record<string, string> = {
    '+': "[O QUE HOUVE]\n\nSincronização neural instável, mas o mestre deixou um recado.\n\n[MACETE DO ALLAN]\n\nPara somas rápidas, arredonde um dos números para a dezena mais próxima e depois desconte a diferença no final.\n\n[MISSÃO]\n\n Tente novamente com foco total!",
    '-': "[O QUE HOUVE]\n\nConexão com o templo falhou, mas a lição continua.\n\n[MACETE DO ALLAN]\n\nNa subtração, tente somar o que falta para chegar ao número maior. É muito mais fácil do que subtrair!\n\n[MISSÃO]\n\nNão desista, Jogador(a)!",
    '*': "[O QUE HOUVE]\n\nInterferência na rede neural. Macete manual ativado.\n\n[MACETE DO ALLAN]\n\nMultiplicar por 5? É só dividir o número por 2 e colocar um zero no final. Por 9? Multiplique por 10 e subtraia o número original.\n\n[MISSÃO]\n\nSua agilidade mental é sua maior arma!",
    '/': "[O QUE HOUVE]\n\nMestre offline, mas a técnica ninja está aqui.\n\n[MACETE DO ALLAN]\n\nDividir por 5 é o oposto da multiplicação: dobre o número e mova a vírgula uma casa para a esquerda.\n\n[MISSÃO]\n\nPrecisão é a chave do VektraMind."
};

const AICache = new Map<string, string>();

export const aiService = {
    async explainError(question: string, correctAnswer: number, userAnswer: string) {
        const cacheKey = `${question}:${correctAnswer}:${userAnswer}`;
        if (AICache.has(cacheKey)) {
            console.log("[AI Cache] Hit!");
            return AICache.get(cacheKey)!;
        }

        // Detectar o operador para o fallback
        const operator = question.includes('+') ? '+' :
            question.includes('-') ? '-' :
                question.includes('x') || question.includes('*') || question.includes('×') ? '*' :
                    question.includes('/') || question.includes('÷') ? '/' : '+';

        const fallback = STATIC_FALLBACKS[operator] || STATIC_FALLBACKS['+'];

        try {
            const { data, error } = await supabase.functions.invoke('ai-mentor', {
                body: { question, correctAnswer, userAnswer }
            });

            if (data?.choices?.[0]?.message?.content) {
                const content = data.choices[0].message.content;
                AICache.set(cacheKey, content);
                return content;
            }

            console.warn("AI Service error:", error);
            return `[O QUE HOUVE]\n\nO mestre não pôde responder por um erro técnico.\n\nDetalhe: ${error?.message || 'Resposta da IA vazia'}\n\n[MISSÃO]\n\nVerifique as variáveis de ambiente e o saldo da API.`;
        } catch (error: any) {
            console.error("AI Service failure, using fallback:", error);
            // Se o erro for crítico, mostra o erro no lugar do macete para debug
            return `[O QUE HOUVE]\n\nErro crítico na conexão neural.\n\nDetalhe: ${error.message}\n\n[MISSÃO]\n\nVerifique as chaves VITE_SUPABASE no painel da Vercel.`;
        }
    }
};
