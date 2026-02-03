
import React, { useState, useEffect } from 'react';
import { PersistenceService } from '../services/persistence';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
    onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
    const [mode, setMode] = useState<'create' | 'login'>('create');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Gera um nome aleatório simples ao abrir na aba de criação
        if (mode === 'create') {
            const randomId = Math.floor(Math.random() * 9000) + 1000;
            setUsername(`Player${randomId}`);
        } else {
            setUsername('');
        }
    }, [mode]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Internally construct a fake email for Auth simplicity
            const email = `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@mathmaster.game`;

            if (mode === 'create') {
                // Link current anonymous session to this identity
                const { error } = await supabase.auth.updateUser({
                    email: email,
                    password: password,
                    data: { username: username } // Save original casing username in metadata
                });

                if (error) throw error;
                // Save immediately to ensure data sync with new identity
                await PersistenceService.sync();
                alert('Conta salva com sucesso! Você pode usar este usuário e senha para entrar em outros dispositivos.');
            } else {
                // Login
                const { error } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password,
                });

                if (error) throw error;
                // Sync data from cloud to local after login
                await PersistenceService.sync();
                // We might need to reload local state in App, but PersistenceService.sync handles storage update
                // Reloading page is the safest way to ensure state is fresh without complex context
                window.location.reload();
                return;
            }
            onClose();
        } catch (err: any) {
            console.error(err);
            if (err.message.includes('already registered')) {
                setError('Este usuário já existe. Tente outro.');
            } else if (err.message.includes('Invalid login')) {
                setError('Usuário ou senha incorretos.');
            } else {
                setError(err.message || 'Erro ao processar. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-pop-in">
            <div className="w-full max-w-md bg-surface border border-white/10 rounded-tech p-6 shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"
                >
                    <i className="fas fa-times text-xl"></i>
                </button>

                <h2 className="text-2xl font-bold font-display text-white mb-6 text-center">
                    {mode === 'create' ? 'SALVAR PROGRESSO' : 'ENTRAR'}
                </h2>

                <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-lg">
                    <button
                        onClick={() => setMode('create')}
                        className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider rounded transition-all ${mode === 'create' ? 'bg-primary text-background font-bold' : 'text-white/50 hover:text-white'}`}
                    >
                        Criar Usuário
                    </button>
                    <button
                        onClick={() => setMode('login')}
                        className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider rounded transition-all ${mode === 'login' ? 'bg-primary text-background font-bold' : 'text-white/50 hover:text-white'}`}
                    >
                        Já tenho conta
                    </button>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-mono uppercase tracking-widest text-white/50 mb-1">
                            Nome de Usuário
                        </label>
                        <div className="relative">
                            <i className="fas fa-user absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-xs"></i>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-black/30 border border-white/10 rounded px-3 pl-8 py-3 text-sm text-white focus:border-primary focus:outline-none transition-colors font-mono"
                                placeholder={mode === 'create' ? "Ex: Player123" : "Seu usuário"}
                                required
                                minLength={3}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-mono uppercase tracking-widest text-white/50 mb-1">
                            Senha
                        </label>
                        <div className="relative">
                            <i className="fas fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-xs"></i>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/30 border border-white/10 rounded px-3 pl-8 py-3 text-sm text-white focus:border-primary focus:outline-none transition-colors font-mono"
                                placeholder="******"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs text-center animate-pulse">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-background font-bold py-3 rounded-lg uppercase tracking-widest text-sm hover:bg-primary-hover transition-colors disabled:opacity-50 mt-4"
                    >
                        {loading ? <i className="fas fa-spinner fa-spin"></i> : (mode === 'create' ? 'Salvar Conta' : 'Entrar')}
                    </button>

                    {mode === 'create' && (
                        <p className="text-[10px] text-white/30 text-center px-4">
                            Isso transformará seu usuário anônimo em uma conta permanente para não perder seu progresso.
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
};
