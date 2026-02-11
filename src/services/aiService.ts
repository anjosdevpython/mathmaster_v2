import { supabase } from '../lib/supabase';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export const aiService = {
    async explainError(question: string, correctAnswer: number, userAnswer: string) {
        // 1. Tentar buscar do cache no Supabase primeiro
        try {
            const { data: cachedData } = await supabase
                .from('ai_explanations')
                .select('explanation')
                .eq('question_text', question)
                .eq('correct_answer', correctAnswer)
                .eq('user_answer', userAnswer)
                .maybeSingle();

            if (cachedData?.explanation) {
                console.log("Retrieved explanation from cache");
                return cachedData.explanation;
            }
        } catch (err) {
            console.warn("Cache fetch failed or table doesn't exist yet:", err);
        }

        // 2. Se não estiver no cache, chamar OpenRouter
        if (!OPENROUTER_API_KEY) {
            console.warn("VITE_OPENROUTER_API_KEY is not defined in .env");
            return "Para ver explicações personalizadas, configure sua VITE_OPENROUTER_API_KEY no arquivo .env.";
        }

        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                    "HTTP-Referer": window.location.origin, // Required by OpenRouter
                    "X-Title": "MathMaster", // Optional
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "openrouter/pony-alpha",
                    messages: [
                        {
                            role: "system",
                            content: `Você é "Allan Anjos", o professor virtual e mentor de elite do MathMaster. 
                            Sua especialidade é ensinar MATEMÁTICA MENTAL e MACETES (hacks) que facilitam a vida do aluno.
                            
                            Ao explicar:
                            1. Identifique-se como Professor Allan Anjos.
                            2. Ensine sempre um "Macete de Mestre": um truque de cálculo rápido, atalho mental ou técnica ninja para resolver aquela operação sem esforço.
                            3. Use uma estrutura fixa:
                               - [Análise do Desvio]: O que aconteceu no erro.
                               - [Caminho da Lógica]: O passo a passo tradicional.
                               - [Macete do Allan]: O atalho rápido para nunca mais esquecer.
                               - [Missão]: Um encorajamento final.
                            4. Se for multiplicação por 5, fale de dividir por 2 e adicionar zero. Se for por 9, fale de multiplicar por 10 e subtrair o número, etc.
                            5. ATENÇÃO: Nunca use símbolos de formatação Markdown como "#", "##", "###", "**", "__", ">" ou "---". 
                            6. Use APENAS texto simples, emojis e quebras de linha para organizar a resposta. Para dar ênfase a uma palavra, use LETRAS MAIÚSCULAS.
                            7. Mantenha o tom carismático e focado na facilidade do cálculo rápido.`
                        },
                        {
                            role: "user",
                            content: `Professor Allan, um aluno cometeu um erro! Além de explicar, ensine um macete ninja (sem usar # ou **) para essa conta:
                            Questão: ${question}
                            Resposta Correta: ${correctAnswer}
                            Resposta do Aluno: ${userAnswer}
                            
                            Mostre sua sabedoria e compartilhe um truque de mestre agora.`
                        }
                    ]
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const explanation = data.choices?.[0]?.message?.content || "Ops! Não consegui gerar uma explicação agora, mas tente novamente!";

            // 3. Salvar no cache para a próxima vez (sem bloquear o retorno)
            if (explanation && !explanation.includes("Ops!")) {
                supabase.from('ai_explanations').insert([
                    {
                        question_text: question,
                        correct_answer: correctAnswer,
                        user_answer: userAnswer,
                        explanation: explanation
                    }
                ]).then(({ error }) => {
                    if (error) console.error("Error saving to cache:", error);
                    else console.log("Explanation saved to cache");
                });
            }

            return explanation;
        } catch (error) {
            console.error("Error calling OpenRouter:", error);
            return "Houve um erro ao conectar com o mestre de matemática. Tente novamente mais tarde!";
        }
    }
};
