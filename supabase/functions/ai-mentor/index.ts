import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Tratar pre-flight do CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY')

        if (!OPENROUTER_API_KEY) {
            throw new Error('OPENROUTER_API_KEY não configurada no Supabase Secrets')
        }

        const { question, correctAnswer, userAnswer } = await req.json()

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "google/gemini-flash-1.5",
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
            5. Estrutura OBRIGATÓRIA (use colchetes):
               - [O QUE HOUVE]
               - [MACETE DO ALLAN]
               - [MISSÃO]
            6. Use duas quebras de linha entre cada seção.
            7. APENAS texto simples e emojis. NUNCA use markdown.`
                    },
                    {
                        role: "user",
                        content: `Professor Allan, explique rápido:
            Conta: ${question}
            Certo: ${correctAnswer}
            Erro: ${userAnswer}`
                    }
                ]
            })
        })

        const data = await response.json()

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
