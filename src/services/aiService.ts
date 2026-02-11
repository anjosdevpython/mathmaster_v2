import { supabase } from '../lib/supabase';

export const aiService = {
    async explainError(question: string, correctAnswer: number, userAnswer: string) {
        try {
            // Chamada via Supabase Edge Function (Escudo Neural)
            const { data, error } = await supabase.functions.invoke('ai-mentor', {
                body: { question, correctAnswer, userAnswer }
            });

            if (error) {
                console.error("Supabase Function Error:", error);
                return "[O QUE HOUVE]\n\nO escudo neural detectou uma instabilidade na conexão.\n\n[MISSÃO]\n\nTente novamente ou verifique se o serviço está ativo.";
            }

            return data.choices?.[0]?.message?.content || "Ops! O mestre está meditando. Tente novamente!";
        } catch (error: any) {
            console.error("AI Service Error:", error);
            return "[O QUE HOUVE]\n\nNão foi possível sincronizar com o mestre Allan via protocolo seguro.\n\n[MISSÃO]\n\nVerifique seu protocolo de rede e tente novamente.";
        }
    }
};
