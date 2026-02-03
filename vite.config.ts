import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  // Se estiver na Vercel, o base deve ser '/', se for no GitHub Pages, deve ser o nome do repo.
  // const isVercel = process.env.VERCEL === '1' || mode === 'production' && !process.env.GITHUB_ACTIONS;
  // Na verdade, o mais seguro é usar '/' por padrão e deixar os deploys específicos lidarem com isso.
  // Vou usar '/' como padrão para Vercel.
  // const basePath = process.env.GITHUB_ACTIONS ? '/mathmaster_v2/' : '/';

  return {
    base: './', // Universal: funciona em Vercel (/), GH Pages (/mathmaster_v2/) e local.
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
