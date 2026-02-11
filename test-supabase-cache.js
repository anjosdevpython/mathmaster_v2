
import { readFile } from 'fs/promises';

async function testSupabase() {
    try {
        const envContent = await readFile('.env', 'utf-8');
        const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.+)/);
        const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/);

        if (!urlMatch || !keyMatch) {
            console.log('❌ Erro: Credenciais do Supabase não encontradas no .env');
            return;
        }

        const URL = urlMatch[1].trim();
        const KEY = keyMatch[1].trim();

        console.log('--- Testando Conexão com Supabase (Tabela ai_explanations) ---');

        // Teste de inserção/leitura via REST API do Supabase (para não precisar instalar o client no node de teste)
        const testData = {
            question_text: "Teste de Sistema " + Date.now(),
            correct_answer: 100,
            user_answer: "99",
            explanation: "Este é um teste automático de cache."
        };

        console.log('1. Tentando inserir dados de teste...');
        const insertRes = await fetch(`${URL}/rest/v1/ai_explanations`, {
            method: "POST",
            headers: {
                "apikey": KEY,
                "Authorization": `Bearer ${KEY}`,
                "Content-Type": "application/json",
                "Prefer": "return=minimal"
            },
            body: JSON.stringify(testData)
        });

        if (insertRes.ok) {
            console.log('   ✅ Inserção ok!');
        } else {
            const error = await insertRes.json();
            console.log('   ❌ Erro na inserção (verifique se criou a tabela):', error);
            return;
        }

        console.log('2. Tentando ler dados de volta...');
        const selectRes = await fetch(`${URL}/rest/v1/ai_explanations?question_text=eq.${testData.question_text}`, {
            method: "GET",
            headers: {
                "apikey": KEY,
                "Authorization": `Bearer ${KEY}`
            }
        });

        const data = await selectRes.json();
        if (selectRes.ok && data.length > 0) {
            console.log('   ✅ Leitura ok! Resposta encontrada:', data[0].explanation);

            // Limpeza (opcional)
            await fetch(`${URL}/rest/v1/ai_explanations?question_text=eq.${testData.question_text}`, {
                method: "DELETE",
                headers: {
                    "apikey": KEY,
                    "Authorization": `Bearer ${KEY}`
                }
            });
            console.log('   ✅ Limpeza de teste ok!');

        } else {
            console.log('   ❌ Erro na leitura:', data);
        }

    } catch (error) {
        console.error('❌ Erro ao executar o teste:', error.message);
    }
}

testSupabase();
