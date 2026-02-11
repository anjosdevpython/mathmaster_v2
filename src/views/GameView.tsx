import React, { useRef, useEffect } from 'react';
import { GameState, GameStats, Question } from '../types';
import { TutorialOverlay } from '../components/TutorialOverlay';

interface GameViewProps {
    gameState: GameState;
    stats: GameStats;
    currentQuestion: Question | null;
    timeLeft: number;
    userInput: string;
    setUserInput: (val: string) => void;
    handleSubmit: (e?: React.FormEvent) => void;
    feedback: 'correct' | 'wrong' | null;
    setGameState: (state: GameState) => void;
    showExplanation: boolean;
    setShowExplanation: (show: boolean) => void;
    visibleSteps: number;
    isFlashing: boolean;
    nextQ: () => void;
    aiExplanation: string | null;
    isLoadingAI: boolean;
    successMessage: string | null;
}

export const GameView: React.FC<GameViewProps> = ({
    gameState, stats, currentQuestion, timeLeft, userInput, setUserInput, handleSubmit,
    feedback, setGameState, showExplanation, setShowExplanation, visibleSteps, isFlashing, nextQ,
    aiExplanation, isLoadingAI, successMessage
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const isTraining = gameState === GameState.TRAINING;

    useEffect(() => {
        if (!feedback && !showExplanation) {
            const timer = setTimeout(() => inputRef.current?.focus(), 10);
            return () => clearTimeout(timer);
        }
    }, [currentQuestion, feedback, showExplanation]);

    if (!currentQuestion) return null;

    // Formatting time with milliseconds for the "Tech" feel
    const formattedTime = (timeLeft: number) => {
        const seconds = Math.floor(timeLeft);
        const ms = Math.floor((timeLeft % 1) * 100);
        return {
            s: seconds.toString().padStart(2, '0'),
            ms: ms.toString().padStart(2, '0')
        };
    };

    const time = formattedTime(timeLeft);
    const progress = !isTraining && currentQuestion ? (stats.currentQuestionIndex / 10) * 100 : 0;

    return (
        <div className="relative w-full max-w-[430px] h-full mx-auto overflow-hidden bg-background-dark/40 shadow-2xl flex flex-col border-x border-primary/10 animate-pop-in">
            {/* HUD / Header Area */}
            <header className="relative z-10 px-6 pt-4 flex flex-col gap-2 shrink-0">
                <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                        <span className="text-[9px] uppercase tracking-widest text-primary font-bold">Progresso</span>
                        <div className="flex items-center gap-1">
                            <span className="text-[11px] font-medium text-white/80">
                                {isTraining ? 'Training Mode' : `Questão ${stats.currentQuestionIndex + 1}/10`}
                            </span>
                        </div>
                    </div>
                    {!isTraining && (
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] uppercase tracking-widest text-primary font-bold">Tempo</span>
                            <div className={`flex items-center gap-1 tabular-nums transition-colors ${timeLeft <= 5 ? 'text-red-400' : 'text-primary'}`}>
                                <span className="material-icons text-xs">schedule</span>
                                <span className="text-sm font-bold glow-text">00:{time.s}</span>
                                <span className="text-[9px] opacity-50">.{time.ms}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                {!isTraining && (
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-500 shadow-[0_0_10px_#22d3ee]"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}

                {/* Points & Stats HUD */}
                <div className="flex justify-between items-center mt-1">
                    <div className="glass-panel px-3 py-1 rounded-full flex items-center gap-2 border-primary/20 backdrop-blur-md">
                        <div className="flex flex-col">
                            <span className="text-[6px] uppercase tracking-tighter text-slate-400 leading-none">Pontos</span>
                            <span className="text-primary font-bold tracking-tight text-[9px] leading-none mt-1">{stats.score.toLocaleString()}</span>
                        </div>
                        <div className="h-3 w-[1px] bg-white/10" />
                        <div className="flex flex-col">
                            <span className="text-[6px] uppercase tracking-tighter text-slate-400 leading-none">Combo</span>
                            <span className="text-success font-bold tracking-tight text-[9px] leading-none mt-1">x{stats.correctInLevel}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className={`h-1 transition-all duration-300 rounded-full ${i < stats.lives ? 'w-5 bg-primary shadow-[0_0_8px_#22d3ee]' : 'w-1 bg-white/10'}`}
                            />
                        ))}
                    </div>
                </div>
            </header>

            {/* Main Problem Area */}
            <main className="relative z-10 flex-grow flex flex-col items-center justify-center sm:justify-center md:gap-8 px-6 min-h-0 py-2">
                <div className="relative group w-full flex flex-col items-center gap-4 sm:gap-8">
                    <div className="text-center relative">
                        <p className="text-[8px] uppercase tracking-[0.3em] text-primary/40 mb-1 font-mono">Maestria Mental</p>
                        <h1 className={`text-5xl sm:text-7xl font-black tracking-tighter text-white glow-text transition-all duration-300 ${isFlashing ? 'scale-110 text-red-500' : 'scale-100'}`}>
                            {currentQuestion.text.split(' ').map((part, i) => (
                                <span key={i} className={i === 1 ? 'text-primary px-2' : ''}>{part}</span>
                            ))}
                        </h1>
                    </div>

                    <div className="w-full relative group max-w-[280px] sm:max-w-[320px]">
                        <input
                            ref={inputRef}
                            type="number"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            placeholder="?"
                            className={`w-full bg-white/5 border-2 ${feedback === 'wrong' ? 'border-red-500/40 text-red-400' : 'border-white/10 focus:border-primary/50'} rounded-2xl p-4 py-6 text-4xl sm:text-5xl font-display font-black text-center outline-none transition-all duration-500 placeholder:text-white/5 shadow-2xl group-hover:bg-white/10 overflow-hidden`}
                            autoFocus
                        />
                        <button
                            onClick={handleSubmit}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-primary text-background-dark rounded-xl sm:rounded-2xl flex items-center justify-center text-lg sm:text-xl shadow-neon hover:scale-105 active:scale-95 transition-all"
                        >
                            <span className="material-symbols-outlined font-black">check</span>
                        </button>
                    </div>

                    {feedback === 'wrong' && (
                        <div className="w-full flex flex-col sm:flex-row items-center gap-2 sm:gap-3 animate-pop-in max-w-[280px] sm:max-w-[320px]">
                            <button
                                onClick={() => setShowExplanation(true)}
                                disabled={isLoadingAI}
                                className="flex-1 stitch-btn stitch-btn-primary w-full py-2 sm:py-3 text-[10px] sm:text-xs"
                            >
                                {isLoadingAI ? (
                                    <><span className="material-symbols-outlined animate-spin text-[10px] sm:text-sm">sync</span> ANALISANDO...</>
                                ) : (
                                    <><span className="material-symbols-outlined text-[10px] sm:text-sm">school</span> MACETE DO MESTRE</>
                                )}
                            </button>
                            <button
                                onClick={nextQ}
                                className="flex-1 stitch-btn stitch-btn-outline w-full py-2 sm:py-3 text-[10px] sm:text-xs"
                            >
                                <span className="material-symbols-outlined text-[10px] sm:text-sm">fast_forward</span> PULAR
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer Meta Info Area */}
            <footer className="relative z-10 px-8 pb-8 w-full shrink-0">
                <div className="flex justify-between items-end">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            <p className="text-[10px] text-white/40 font-display font-bold tracking-[0.2em] uppercase">
                                {isTraining ? 'Simulação de Treino' : 'Missão de Campo'}
                            </p>
                        </div>
                        <div className="flex flex-col gap-1 opacity-20">
                            <p className="text-[8px] text-white font-mono tracking-widest uppercase">Protocolo: VEKTRA_M_{stats.currentLevel.toString().padStart(3, '0')}</p>
                            <p className="text-[8px] text-white font-mono tracking-widest uppercase">Sync: {localStorage.getItem('vektramind_offline_user') ? 'MODO LOCAL' : 'CÉREBRO NUVEM'}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setGameState(GameState.HOME)}
                        className="group flex flex-col items-end gap-2 transition-all"
                    >
                        <span className="text-[10px] uppercase font-display font-black text-red-500/50 group-hover:text-red-500 tracking-widest leading-none">Status</span>
                        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all">
                            <span className="text-[10px] uppercase font-display font-bold tracking-widest">Abortar Missão</span>
                            <span className="material-symbols-outlined text-sm">logout</span>
                        </div>
                    </button>
                </div>
            </footer>

            {/* Bottom Indicator */}
            <div className="relative z-10 flex justify-center pb-4">
                <div className="w-32 h-1 bg-white/10 rounded-full" />
            </div>

            {showExplanation && (
                <TutorialOverlay
                    question={currentQuestion}
                    aiExplanation={aiExplanation}
                    onClose={() => {
                        setShowExplanation(false);
                        nextQ();
                    }}
                />
            )}

            {successMessage && (
                <div className="fixed top-32 left-0 right-0 z-[200] flex justify-center pointer-events-none px-4">
                    <div className="gradient-button text-white px-10 py-5 rounded-[2.5rem] font-black text-2xl shadow-neon animate-pop-in flex items-center gap-4">
                        <span className="material-symbols-outlined text-3xl">bolt</span>
                        <span className="tracking-tighter">{successMessage}</span>
                    </div>
                </div>
            )}
        </div>
    );
};
