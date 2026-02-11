import { supabase } from '../lib/supabase';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export const aiService = {
    async explainError(question: string, correctAnswer: number, userAnswer: string) {
        if (!OPENROUTER_API_KEY) {
            console.warn("VITE_OPENROUTER_API_KEY is not defined in .env");
            return "Para ver explicações personalizadas, configure sua VITE_OPENROUTER_API_KEY no arquivo .env.";
        }

        try {
            // Chamar OpenRouter diretamente (removido cache do Supabase para máxima velocidade)
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                    "HTTP-Referer": window.location.origin,
                    "X-Title": "Vektra Mind",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "google/gemini-2.0-flash-001", // Modelo ultra-rápido de 2025
                    messages: [
                        {
                            role: "system",
                            content: `Você é "Allan Anjos", o professor virtual e mentor de elite do Vektra Mind. 
                            Sua especialidade é ensinar MATEMÁTICA MENTAL e MACETES (hacks) que facilitam a vida do aluno no protocolo Vektra.
                            
                            Ao explicar:
                            1. Identifique-se como Professor Allan Anjos.
                            2. Seja conciso (máximo 4 parágrafos curtos).
                            3. Ensine sempre um "Macete do Allan": um truque de cálculo rápido ou técnica ninja.
                            4. Estrutura:
                               - [O QUE HOUVE]: Explicação curta do erro.
                               - [MACETE DO ALLAN]: O atalho rápido.
                               - [MISSÃO]: Encorajamento.
                            5. APENAS texto simples e emojis. NUNCA use markdown (#, *, etc).`
                        },
                        {
                            role: "user",
                            content: `Professor Allan, explique de forma rápida (sem markdown):
                            Conta: ${question}
                            Certo: ${correctAnswer}
                            Erro do Aluno: ${userAnswer}`
                        }
                    ]
                })
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            return data.choices?.[0]?.message?.content || "Ops! O mestre está meditando. Tente novamente!";
        } catch (error) {
            console.error("Error calling OpenRouter:", error);
            return "Houve um erro ao conectar com o mestre. Verifique sua conexão!";
        }
    }
};
