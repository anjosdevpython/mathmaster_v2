
import { readFile } from 'fs/promises';
import { join } from 'path';

async function testAI() {
    try {
        const envContent = await readFile('.env', 'utf-8');
        const keyMatch = envContent.match(/VITE_OPENROUTER_API_KEY=(.+)/);

        if (!keyMatch || keyMatch[1] === 'COLE_SUA_CHAVE_AQUI') {
            console.log('❌ Erro: Chave da API não configurada no .env');
            return;
        }

        const API_KEY = keyMatch[1].trim();

        console.log('--- Testando Conexão com OpenRouter (pony-alpha) ---');
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "openrouter/pony-alpha",
                messages: [
                    {
                        role: "system",
                        content: "Você é um tutor de matemática."
                    },
                    {
                        role: "user",
                        content: "Questão: 7 x 8\nResposta Correta: 56\nResposta do Usuário: 54\nExplique o erro rapidamente."
                    }
                ]
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ Conexão bem sucedida!');
            console.log('Resposta da AI:', data.choices[0].message.content);
        } else {
            console.log('❌ Erro na API:', data);
        }

    } catch (error) {
        console.error('❌ Erro ao executar o teste:', error.message);
    }
}

testAI();
