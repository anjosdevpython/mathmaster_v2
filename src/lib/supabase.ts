
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client: SupabaseClient;

if (supabaseUrl && supabaseAnonKey) {
    console.log('[Supabase] Credenciais detectadas. Inicializando cliente...');
    client = createClient(supabaseUrl, supabaseAnonKey);
} else {
    console.error('[Supabase] ERRO: Credenciais VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY ausentes no .env!');
    // Mock client seguro para evitar crash
    client = {
        auth: {
            getSession: async () => ({ data: { session: null }, error: null }),
            getUser: async () => ({ data: { user: null }, error: null }),
            signInAnonymously: async () => ({ data: {}, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
            updateUser: async () => ({ error: { message: 'Cloud disabled' } }),
            signInWithPassword: async () => ({ error: { message: 'Cloud disabled' } })
        },
        from: () => ({
            select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
            upsert: async () => ({ error: null })
        })
    } as unknown as SupabaseClient;
}

export const supabase = client;
