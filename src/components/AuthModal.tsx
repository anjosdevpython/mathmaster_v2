import React, { useState, useEffect } from 'react';
import { PersistenceService } from '../services/persistence';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
    onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
    const [mode, setMode] = useState<'create' | 'login' | 'profile'>('create');
    const [user, setUser] = useState<any>(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        const offlineId = localStorage.getItem('vektramind_offline_user');
        if (offlineId) {
            setUser({ user_metadata: { username: offlineId } });
            setMode('profile');
            return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.user_metadata?.username) {
            setUser(user);
            setMode('profile');
        } else if (mode === 'create') {
            const randomId = Math.floor(Math.random() * 9000) + 1000;
            setUsername(`Player${randomId}`);
        }
    };

    const handleLogout = async () => {
        setLoading(true);
        localStorage.removeItem('vektramind_offline_user');
        await supabase.auth.signOut();
        window.location.reload();
    };

    const handleAuth = async (e: React.FormEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (loading) return;
        setLoading(true);
        setError(null);

        try {
            console.log(`[VektraAuth] >>> INÍCIO | Modo: ${mode} | User: ${username}`);
            const email = `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@vektramind.game`;

            // Processo direto sem check de sessão para evitar hang
            const authTask = (async () => {
                if (mode === 'create') {
                    console.log('[VektraAuth] 1. Tentando registro direto...');
                    const { error } = await supabase.auth.signUp({
                        email: email,
                        password: password,
                        options: { data: { username: username } }
                    });

                    if (error) {
                        if (error.message.includes('already registered')) {
                            throw new Error('USUÁRIO JÁ EXISTE. TENTE FAZER LOGIN.');
                        }
                        throw error;
                    }
                } else if (mode === 'login') {
                    console.log('[VektraAuth] 1. Validando login direto...');
                    const { error } = await supabase.auth.signInWithPassword({
                        email: email,
                        password: password,
                    });
                    if (error) throw error;
                }

                console.log('[VektraAuth] 2. Sincronizando dados...');
                await PersistenceService.sync();
                window.location.reload();
            })();

            await Promise.race([
                authTask,
                new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT NA AUTENTICAÇÃO')), 10000))
            ]);

            onClose();
        } catch (err: any) {
            console.error('[VektraAuth] ERRO:', err);
            const msg = err.message || '';

            if (msg.includes('TIMEOUT')) {
                console.warn('[VektraAuth] Entrando em MODO OFFLINE DE EMERGÊNCIA.');
                alert('CONEXÃO LENTA: O sistema entrará em modo local para você não perder o progresso.');
                // Salva um usuário fake no localStorage para o app achar que está logado
                localStorage.setItem('vektramind_offline_user', username);
                window.location.reload();
                return;
            }

            if (msg.includes('already registered')) {
                setError('ESSE USUÁRIO JÁ EXISTE NO SISTEMA.');
            } else if (msg.includes('Invalid login')) {
                setError('DADOS INCORRETOS. VERIFIQUE SUA CHAVE.');
            } else {
                setError(msg.toUpperCase() || 'FALHA NA CONEXÃO NEURAL.');
            }
        } finally {
            setLoading(false);
            console.log('[AuthMaster] <<< FIM DO PROCESSO');
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-2xl animate-pop-in">
            <div className="w-full max-w-md bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <span className="material-symbols-outlined text-8xl">fingerprint</span>
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                {mode === 'profile' ? (
                    <div className="flex flex-col items-center py-4 relative z-10">
                        <div className="w-24 h-24 rounded-[2rem] bg-primary/10 border-2 border-primary/30 flex items-center justify-center mb-6 shadow-neon">
                            <span className="material-symbols-outlined text-5xl text-primary">person</span>
                        </div>
                        <h2 className="text-3xl font-display font-black text-white mb-1 uppercase tracking-tighter">
                            {user?.user_metadata?.username || 'USUÁRIO'}
                        </h2>
                        <p className="text-[10px] font-display font-bold text-primary uppercase tracking-[0.3em] mb-10">
                            Protocolo Ativo
                        </p>

                        <div className="w-full space-y-4">
                            <div className="p-5 bg-slate-900/50 rounded-2xl border border-white/5 flex justify-between items-center">
                                <span className="text-[10px] font-display font-bold text-slate-500 uppercase tracking-widest">Sincronização</span>
                                <span className="text-[10px] font-display font-black text-primary uppercase flex items-center gap-2">
                                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_#22d3ee]"></span>
                                    Nuvem Estável
                                </span>
                            </div>

                            <button
                                onClick={handleLogout}
                                disabled={loading}
                                className="w-full h-14 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-display font-bold rounded-2xl uppercase tracking-widest text-[10px] border border-red-500/20 transition-all mt-6"
                            >
                                {loading ? <span className="material-symbols-outlined animate-spin">sync</span> : 'Desconectar Protocolo'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="relative z-10">
                        <header className="text-center mb-10">
                            <h2 className="text-3xl font-display font-black text-white uppercase tracking-tighter">
                                {mode === 'create' ? 'NOVO REGISTRO' : 'IDENTIFICAÇÃO'}
                            </h2>
                            <p className="text-[10px] font-display font-bold text-slate-500 uppercase tracking-widest mt-1">
                                Garanta a integridade dos seus dados
                            </p>
                        </header>

                        <div className="flex gap-2 mb-8 bg-black/20 p-1.5 rounded-2xl border border-white/5">
                            <button
                                onClick={() => setMode('create')}
                                className={`flex-1 py-3 text-[10px] font-display font-bold uppercase tracking-widest rounded-xl transition-all ${mode === 'create' ? 'bg-primary text-slate-950 shadow-neon' : 'text-slate-500 hover:text-white'}`}
                            >
                                Criar
                            </button>
                            <button
                                onClick={() => setMode('login')}
                                className={`flex-1 py-3 text-[10px] font-display font-bold uppercase tracking-widest rounded-xl transition-all ${mode === 'login' ? 'bg-primary text-slate-950 shadow-neon' : 'text-slate-500 hover:text-white'}`}
                            >
                                Entrar
                            </button>
                        </div>

                        <form onSubmit={handleAuth} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-display font-black text-slate-500 uppercase tracking-widest ml-1">
                                    ID de Usuário
                                </label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl">person</span>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-slate-950/40 border border-white/5 rounded-2xl px-4 pl-12 py-4 text-sm text-white focus:border-primary/50 focus:outline-none transition-all font-display font-medium placeholder:text-slate-700"
                                        placeholder={mode === 'create' ? "Ex: ACE_PLAYER" : "Digite seu ID"}
                                        required
                                        minLength={3}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-display font-black text-slate-500 uppercase tracking-widest ml-1">
                                    Chave de Acesso
                                </label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl">lock</span>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-950/40 border border-white/5 rounded-2xl px-4 pl-12 py-4 text-sm text-white focus:border-primary/50 focus:outline-none transition-all font-display font-medium placeholder:text-slate-700"
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-display font-bold uppercase tracking-widest text-center animate-pulse">
                                    <span className="material-symbols-outlined text-sm mr-2 align-middle">warning</span>
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-16 stitch-btn stitch-btn-primary mt-4"
                            >
                                {loading ? <span className="material-symbols-outlined animate-spin">sync</span> : (mode === 'create' ? 'INICIAR REGISTRO' : 'VALIDAR ACESSO')}
                            </button>

                            {mode === 'create' && (
                                <p className="text-[9px] text-slate-600 text-center font-display uppercase tracking-wider leading-relaxed">
                                    Ao registrar, seus dados locais serão<br />sincronizados com o banco de dados neural.
                                </p>
                            )}
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};
