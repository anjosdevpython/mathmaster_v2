import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Lista de modelos na ordem de preferência (Priorizando Grátis e Rápidos)
const MODELS = [
    "google/gemini-2.0-flash-exp:free",
    "google/gemini-flash-1.5-exp",
    "openrouter/pony-alpha",
    "meta-llama/llama-3.1-8b-instruct:free",
    "google/gemini-flash-1.5" // Pago (fallback final se nada funcionar)
];

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY')

        if (!OPENROUTER_API_KEY) {
            return new Response(JSON.stringify({
                choices: [{ message: { content: "[O QUE HOUVE]\n\nChave de API ausente.\n\n[MISSÃO]\n\nConfigure a chave OPENROUTER_API_KEY no painel do Supabase." } }]
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        const { question, correctAnswer, userAnswer } = await req.json()

        // Loop de redundância neural (Tenta até um modelo funcionar)
        let lastError = null;
        for (const model of MODELS) {
            try {
                console.log(`Neural Backup: Tentando conectar ao modelo ${model}...`)
                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                        "HTTP-Referer": "https://vektra-mind.vercel.app",
                        "X-Title": "Vektra Mind",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: [
                            {
                                role: "system",
                                content: `Você é "Allan Anjos", o professor virtual e mentor de elite do Vektra Mind. 
                Sua especialidade é ensinar MATEMÁTICA MENTAL e MACETES (hacks).
                
                Ao explicar:
                1. Identifique-se como Professor Allan Anjos.
                2. Refira-se ao usuário sempre como "Jogador(a)".
                3. Seja conciso (máximo 4 parágrafos curtos).
                4. Ensine um "Macete do Allan": um truque ninja.
                5. Estrutura OBRIGATÓRIA (use colchetes): [O QUE HOUVE], [MACETE DO ALLAN], [MISSÃO].
                6. Use duas quebras de linha entre cada seção.
                7. APENAS texto simples e emojis. NUNCA use markdown.`
                            },
                            {
                                role: "user",
                                content: `Professor Allan, explique rápido: Conta: ${question} Certo: ${correctAnswer} Erro: ${userAnswer}`
                            }
                        ]
                    })
                });

                const data = await response.json()

                if (response.ok && !data.error) {
                    console.log(`Sucesso Neural: ${model} respondeu perfeitamente.`)
                    return new Response(JSON.stringify(data), {
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                        status: 200,
                    })
                }

                console.warn(`Modelo ${model} falhou:`, data.error || data)
                lastError = data.error || data;
            } catch (err) {
                console.error(`Erro crítico no modelo ${model}:`, err.message)
                lastError = err;
            }
        }

        // Se todos os modelos falharem
        return new Response(JSON.stringify({
            choices: [{ message: { content: `[O QUE HOUVE]\n\nFalha em todos os modelos de redundância neural.\n\n[MISSÃO]\n\nVerifique se sua chave OpenRouter tem saldo ou se o serviço está offline. Erro: ${JSON.stringify(lastError)}` } }]
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        return new Response(JSON.stringify({
            choices: [{ message: { content: "[O QUE HOUVE]\n\nErro interno no protocolo de mentoria.\n\n[MISSÃO]\n\nTente novamente em instantes." } }]
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    }
})
