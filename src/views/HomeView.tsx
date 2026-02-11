import React, { useState, useEffect } from 'react';
import { GameState } from '../types';
import { AuthModal } from '../components/AuthModal';
import { supabase } from '../lib/supabase';

interface HomeViewProps {
    setGameState: (state: GameState) => void;
    startLevel: (level: number, reset?: boolean, isTraining?: boolean) => void;
    selectedOps: string[];
    setSelectedOps: React.Dispatch<React.SetStateAction<string[]>>;
}

export const HomeView: React.FC<HomeViewProps> = ({ setGameState, startLevel, selectedOps, setSelectedOps }) => {
    const [showAuth, setShowAuth] = useState(false);
    const [userLabel, setUserLabel] = useState('Acesso Neural');

    useEffect(() => {
        const checkUser = async () => {
            const offlineUser = localStorage.getItem('mathmaster_offline_user');
            if (offlineUser) {
                setUserLabel(offlineUser.toUpperCase());
                return;
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (user?.user_metadata?.username) {
                setUserLabel(user.user_metadata.username.toUpperCase());
            }
        };
        checkUser();
    }, []);

    const ops = [
        { id: '+', icon: 'add', label: 'SOMA' },
        { id: '-', icon: 'remove', label: 'SUB' },
        { id: '*', icon: 'close', label: 'MULT' },
        { id: '/', icon: 'percent', label: 'DIV' },
        { id: 'power', icon: 'X²', label: 'POT', isText: true },
        { id: 'sqrt', icon: 'square_foot', label: 'RAIZ' },
        { id: 'percentage', icon: 'auto_graph', label: 'LOG' }
    ];

    const toggleOp = (id: string) => {
        setSelectedOps(prev => prev.includes(id) ? prev.filter(o => o !== id) : [...prev, id]);
    };

    return (
        <div className="relative z-10 flex flex-col lg:flex-row w-full max-w-7xl mx-auto h-full px-8 py-12 lg:items-center justify-between gap-12 animate-pop-in">
            {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

            {/* Left Column: Branding & Stats (Desktop) */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 lg:w-1/2">
                <header className="w-full flex flex-col md:flex-row lg:flex-col justify-between items-center lg:items-start gap-6">
                    <div className="flex flex-col items-center lg:items-start space-y-4">
                        <div className="relative inline-block">
                            <h1 className="font-display font-black text-5xl md:text-7xl lg:text-8xl tracking-tighter flex flex-wrap items-center justify-center lg:justify-start">
                                <span className="text-white">MATH</span>
                                <span className="text-primary glow-text ml-2">MASTER</span>
                            </h1>
                        </div>
                        <p className="text-xs md:text-sm tracking-[0.4em] font-display font-medium text-slate-400 uppercase">
                            Matemática Mental de Alta Performance
                        </p>
                    </div>

                    <button
                        onClick={() => setShowAuth(true)}
                        className="group relative flex items-center gap-3 bg-slate-900/60 backdrop-blur-2xl border border-white/10 px-6 py-3 rounded-2xl hover:bg-slate-800 transition-all text-slate-400 hover:text-white shadow-2xl lg:mt-4"
                    >
                        <span className="text-[10px] font-display font-bold tracking-widest uppercase">{userLabel}</span>
                        <span className="material-symbols-outlined text-xl">person</span>
                        <div className="absolute inset-0 rounded-2xl border border-primary/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    </button>
                </header>

                <div className="hidden lg:flex flex-col space-y-6 pt-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-3xl">terminal</span>
                        </div>
                        <div>
                            <h4 className="font-display font-black text-white text-lg tracking-tight">SISTEMA ATIVO</h4>
                            <p className="text-xs text-slate-500 uppercase tracking-widest">Protocolo de Treinamento Neural v3.0</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-neon-cyan text-3xl">monitoring</span>
                        </div>
                        <div>
                            <h4 className="font-display font-black text-white text-lg tracking-tight">ALTA EFICIÊNCIA</h4>
                            <p className="text-xs text-slate-500 uppercase tracking-widest">Otimização de Cálculo em tempo real</p>
                        </div>
                    </div>
                </div>

                <div className="block lg:hidden w-full h-px bg-white/5 my-4"></div>
            </div>

            {/* Right Column: Interaction Panel */}
            <div className="flex flex-col items-center lg:w-[480px] space-y-8">
                <div className="w-full bg-slate-900/40 backdrop-blur-3xl border border-white/10 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <span className="material-symbols-outlined text-6xl">settings_account_box</span>
                    </div>

                    <div className="relative z-10 space-y-8">
                        <div>
                            <h3 className="text-center font-display font-black text-white text-xs tracking-[0.3em] uppercase mb-6 opacity-60">Configuração de Missão</h3>
                            <div className="grid grid-cols-4 gap-4 max-w-[320px] mx-auto">
                                {ops.map(op => (
                                    <button
                                        key={op.id}
                                        onClick={() => toggleOp(op.id)}
                                        className={`aspect-square flex flex-col items-center justify-center border-2 rounded-2xl transition-all active:scale-90 group relative
                                            ${selectedOps.includes(op.id)
                                                ? 'border-primary/40 bg-primary/10 text-primary shadow-neon scale-105'
                                                : 'border-slate-700/30 bg-slate-800/40 text-slate-500 hover:border-slate-500 hover:text-white'}`}
                                    >
                                        {op.isText ? (
                                            <span className={`font-display font-black text-sm mb-1 ${selectedOps.includes(op.id) ? 'text-primary' : 'text-slate-400'}`}>
                                                {op.icon}
                                            </span>
                                        ) : (
                                            <span className={`material-symbols-outlined mb-1 group-hover:scale-110 transition-transform ${selectedOps.includes(op.id) ? 'text-primary' : 'text-slate-400'}`}>
                                                {op.icon}
                                            </span>
                                        )}
                                        <span className={`text-[8px] font-display font-bold tracking-widest ${selectedOps.includes(op.id) ? 'text-primary' : 'text-slate-500'}`}>
                                            {op.label}
                                        </span>
                                    </button>
                                ))}
                                <button className="aspect-square flex items-center justify-center border-2 border-slate-800/10 bg-slate-900/10 rounded-2xl opacity-20 cursor-not-allowed">
                                    <span className="material-symbols-outlined text-slate-700 text-sm">lock</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={() => setGameState(GameState.LEVEL_SELECT)}
                                className="w-full h-18 stitch-btn stitch-btn-primary"
                            >
                                <span className="font-display font-bold text-xl tracking-[0.15em]">COMEÇAR JOGO</span>
                                <span className="material-symbols-outlined text-2xl">rocket_launch</span>
                            </button>

                            <button
                                onClick={() => startLevel(1, true, true)}
                                className="w-full h-18 stitch-btn stitch-btn-outline"
                            >
                                <span className="font-display font-bold text-base tracking-[0.15em]">MODO TREINO</span>
                                <span className="material-symbols-outlined text-slate-400 text-xl">psychology</span>
                            </button>
                        </div>
                    </div>
                </div>

                <footer className="w-full flex flex-col items-center space-y-4">
                    <div className="flex items-center gap-6 opacity-30 hover:opacity-100 transition-opacity">
                        <a href="https://allananjos.dev.br" target="_blank" rel="noreferrer" className="text-[10px] tracking-[0.3em] font-display font-black text-white uppercase hover:text-primary transition-colors">
                            Allan Anjos Developer
                        </a>
                        <span className="w-1.5 h-1.5 bg-slate-700 rounded-full"></span>
                        <p className="text-[10px] tracking-[0.3em] font-display font-black text-slate-600 uppercase">
                            Protocolo v3.0.1
                        </p>
                    </div>
                </footer>
            </div>

        </div>
    );
};
