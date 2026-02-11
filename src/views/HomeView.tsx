import React, { useState, useEffect } from 'react';
import { GameState } from '../types';
import { AuthModal } from '../components/AuthModal';
import { supabase } from '../lib/supabase';

interface HomeViewProps {
    setGameState: (state: GameState) => void;
    startLevel: (level: number, reset?: boolean, isTraining?: boolean, timedTraining?: boolean) => void;
    selectedOps: string[];
    setSelectedOps: React.Dispatch<React.SetStateAction<string[]>>;
}

export const HomeView: React.FC<HomeViewProps> = ({ setGameState, startLevel, selectedOps, setSelectedOps }) => {
    const [showAuth, setShowAuth] = useState(false);
    const [userLabel, setUserLabel] = useState('Acesso Neural');
    const [timedTraining, setTimedTraining] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            const offlineUser = localStorage.getItem('vektramind_offline_user');
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
        { id: 'sqrt', icon: '√', label: 'RAIZ', isText: true },
        { id: 'percentage', icon: 'auto_graph', label: 'LOG' }
    ];

    const toggleOp = (id: string) => {
        setSelectedOps(prev => prev.includes(id) ? prev.filter(o => o !== id) : [...prev, id]);
    };

    return (
        <div className="relative z-10 flex flex-col lg:flex-row w-full max-w-7xl mx-auto h-full px-4 py-4 lg:px-8 lg:py-8 justify-between gap-6 lg:gap-12 animate-pop-in overflow-hidden overflow-y-auto lg:overflow-hidden custom-scrollbar">
            {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

            {/* Left Column: Branding & Stats (Desktop) */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left lg:w-1/2 flex-1 relative lg:pt-0">
                <header className="w-full flex flex-col items-center lg:items-start mb-1 lg:mb-2 lg:-mt-10">
                    <div className="flex flex-col items-center lg:items-start space-y-2">
                        <div className="relative inline-block w-full max-w-[200px] md:max-w-[300px] lg:max-w-[400px] transition-all duration-700 hover:scale-[1.02]">
                            {/* Logo Image */}
                            <img
                                src="./logo.png"
                                alt="Vektra Mind"
                                className="w-full h-auto object-contain drop-shadow-[0_0_60px_rgba(34,211,238,0.2)] animate-pulse-slow"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const fallback = e.currentTarget.parentElement?.querySelector('.fallback-title');
                                    if (fallback) fallback.classList.remove('hidden');
                                }}
                            />
                            {/* Fallback Static Title */}
                            <h1 className="fallback-title hidden font-display font-black text-5xl md:text-7xl lg:text-8xl tracking-tighter items-center justify-center lg:justify-start">
                                <span className="text-white">VEKTRA</span>
                                <span className="text-primary glow-text ml-2">MIND</span>
                            </h1>
                        </div>
                        <p className="text-[9px] md:text-[11px] tracking-[0.6em] font-display font-black text-primary/50 uppercase">
                            Alta Eficiência em Matemática Neural
                        </p>
                    </div>
                </header>

                <div className="flex flex-col items-center lg:items-start space-y-2">
                    <div className="hidden lg:flex flex-col space-y-6">
                        <div className="flex items-center gap-6 group">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-all">
                                <span className="material-symbols-outlined text-primary text-3xl">terminal</span>
                            </div>
                            <div>
                                <h4 className="font-display font-black text-white text-base tracking-tight">CÉREBRO ATIVO</h4>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Protocolo Vektra Mind v3.0</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 group">
                            <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:bg-accent/20 transition-all">
                                <span className="material-symbols-outlined text-accent text-3xl">monitoring</span>
                            </div>
                            <div>
                                <h4 className="font-display font-black text-white text-base tracking-tight">ALTA PERFORMANCE</h4>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Sincronização Neural em tempo real</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="block lg:hidden w-full h-px bg-white/5 my-4"></div>
            </div>

            {/* Right Column: Interaction Panel */}
            <div className="flex flex-col items-center lg:w-[480px] space-y-6 lg:space-y-8 pb-10 lg:pb-0">
                <div className="w-full bg-slate-900/40 backdrop-blur-3xl border border-white/10 p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl relative overflow-hidden group">
                    <button
                        onClick={() => setShowAuth(true)}
                        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 transition-all duration-300 group/avatar cursor-pointer hover:scale-110 active:scale-95 flex flex-col items-center"
                        title={userLabel}
                    >
                        <span className="material-symbols-outlined text-2xl sm:text-3xl text-slate-500 group-hover/avatar:text-primary transition-colors animate-pulse-slow">settings</span>
                        <span className="mt-1 text-[7px] sm:text-[8px] font-display font-bold text-primary/70 uppercase tracking-widest whitespace-nowrap opacity-40 group-hover/avatar:opacity-100 transition-opacity pointer-events-none">{userLabel}</span>
                    </button>

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

                        <div className="space-y-3 sm:space-y-4">
                            <button
                                onClick={() => setGameState(GameState.LEVEL_SELECT)}
                                className="w-full h-14 sm:h-18 stitch-btn stitch-btn-primary"
                            >
                                <span className="font-display font-bold text-lg sm:text-xl tracking-[0.15em]">COMEÇAR JOGO</span>
                                <span className="material-symbols-outlined text-xl sm:text-2xl">rocket_launch</span>
                            </button>

                            <button
                                onClick={() => startLevel(1, true, true, timedTraining)}
                                className="w-full h-14 sm:h-18 stitch-btn stitch-btn-outline"
                            >
                                <span className="font-display font-bold text-sm sm:text-base tracking-[0.15em]">MODO TREINO</span>
                                <span className="material-symbols-outlined text-slate-400 text-lg sm:text-xl">psychology</span>
                            </button>

                            <button
                                onClick={() => setTimedTraining(!timedTraining)}
                                className={`w-full h-14 flex items-center justify-between px-6 rounded-2xl border-2 transition-all ${timedTraining
                                    ? 'border-primary/40 bg-primary/10 text-primary'
                                    : 'border-slate-700/30 bg-slate-800/40 text-slate-400 hover:border-slate-500'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-xl">{timedTraining ? 'timer' : 'timer_off'}</span>
                                    <span className="font-display font-bold text-sm tracking-wider">TREINO COM TEMPO</span>
                                </div>
                                <div className={`w-12 h-6 rounded-full transition-all relative ${timedTraining ? 'bg-primary' : 'bg-slate-700'
                                    }`}>
                                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${timedTraining ? 'right-0.5' : 'left-0.5'
                                        }`} />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                <footer className="w-full flex flex-col items-center space-y-4">
                    <div className="flex items-center gap-6 opacity-30 hover:opacity-100 transition-opacity">
                        <a href="https://allananjos.dev.br" target="_blank" rel="noreferrer" className="text-[10px] tracking-[0.3em] font-display font-black text-white uppercase hover:text-primary transition-colors">
                            Desenvolvido por Allan Anjos
                        </a>
                        <span className="w-1.5 h-1.5 bg-slate-700 rounded-full"></span>
                        <p className="text-[10px] tracking-[0.3em] font-display font-black text-slate-600 uppercase">
                            Protocolo v4.0.0
                        </p>
                    </div>
                </footer>
            </div>

        </div>
    );
};
