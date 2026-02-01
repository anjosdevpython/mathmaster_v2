import React, { useRef, useEffect } from 'react';
import { GameState, GameStats, Question } from '../types';
import { LEVELS, INITIAL_LIVES } from '../constants';
import Timer from '../components/Timer';
import { PowerVisual } from '../components/visuals/PowerVisual';
import { SqrtVisual } from '../components/visuals/SqrtVisual';
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
}

export const GameView: React.FC<GameViewProps> = ({
    gameState, stats, currentQuestion, timeLeft, userInput, setUserInput, handleSubmit,
    feedback, setGameState, showExplanation, setShowExplanation, visibleSteps, isFlashing, nextQ
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const isTraining = gameState === GameState.TRAINING;
    const steps = currentQuestion?.explanation?.split('|') || [];

    // Auto-focus no input sempre que a pergunta mudar ou o feedback for limpo
    useEffect(() => {
        if (!feedback && !showExplanation) {
            // Pequeno delay para garantir que a renderização terminou
            const timer = setTimeout(() => inputRef.current?.focus(), 10);
            return () => clearTimeout(timer);
        }
    }, [currentQuestion, feedback, showExplanation]);

    return (
        <div className={`flex flex-col h-full max-w-4xl mx-auto px-6 py-10 relative z-10 ${isFlashing ? 'bg-danger/10' : ''}`}>

            {/* HUD Header */}
            <div className="flex items-center gap-6 panel-glass p-4 mb-4 md:mb-8 border-t-2 border-t-primary/50 relative shrink-0">

                <div className="flex-1">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-primary/70 block mb-1">
                        {isTraining ? 'ACERTOS' : 'SCORE'}
                    </span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold font-display text-white">
                            {isTraining ? stats.correctInLevel : stats.score}
                        </span>
                        {!isTraining && (
                            <span className="text-sm font-mono text-white/40">
                                / {LEVELS[stats.currentLevel - 1]?.totalQuestions || 10} Q
                            </span>
                        )}
                    </div>
                    {/* Barra de Progresso Fina */}
                    {!isTraining && (
                        <div className="h-1 w-24 bg-white/10 mt-1 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-300"
                                style={{ width: `${(stats.currentQuestionIndex / (LEVELS[stats.currentLevel - 1]?.totalQuestions || 10)) * 100}%` }}
                            />
                        </div>
                    )}
                </div>

                {!isTraining && (
                    <div className="flex gap-1">
                        {Array.from({ length: INITIAL_LIVES }).map((_, i) => (
                            <div
                                key={i}
                                className={`w-8 h-2 transform skew-x-12 ${i < stats.lives ? 'bg-danger shadow-glow-danger' : 'bg-white/10'}`}
                            />
                        ))}
                    </div>
                )}

                <button
                    onClick={() => setGameState(GameState.HOME)}
                    className="w-10 h-10 flex items-center justify-center rounded-tech bg-white/5 text-white/40 hover:text-white hover:bg-danger transition-colors"
                >
                    <i className="fas fa-times" />
                </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-12 relative">
                {!isTraining && <Timer current={timeLeft} total={LEVELS[stats.currentLevel - 1].timePerQuestion} />}

                <div className="text-center w-full">
                    <h2 className={`text-5xl md:text-9xl font-black font-display tracking-tighter transition-all duration-200
            ${feedback === 'correct' ? 'text-primary scale-110 drop-shadow-[0_0_30px_rgba(16,185,129,0.5)]' :
                            feedback === 'wrong' ? 'text-danger shake-error drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]' : 'text-white'}`}>
                        {currentQuestion?.text}
                    </h2>

                    {feedback === 'wrong' && isTraining && (
                        <button
                            onClick={() => setShowExplanation(true)}
                            className="mt-8 px-6 py-2 bg-accent/10 hover:bg-accent/20 text-accent border border-accent/40 rounded-tech font-mono font-bold uppercase tracking-widest text-xs animate-pop-in flex items-center gap-2 mx-auto"
                        >
                            <i className="fas fa-eye" /> Ver Tutorial
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="w-full max-w-md relative group">
                    <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-full"></div>
                    <input
                        ref={inputRef}
                        type="number"
                        inputMode="numeric" // Mobile numeric keyboard trigger
                        pattern="[0-9]*"   // Mobile numeric keyboard trigger fallback
                        value={userInput}
                        onChange={e => setUserInput(e.target.value)}
                        className="w-full bg-black/60 border-2 border-white/10 rounded-full py-6 md:py-8 px-8 text-4xl md:text-6xl font-bold font-display text-center text-white 
                       focus:outline-none focus:border-primary focus:shadow-glow-primary transition-all placeholder-white/5 relative z-10"
                        placeholder="?"
                        autoFocus
                        disabled={feedback === 'correct' || showExplanation}
                    />
                </form>
            </div>

            {/* Explanation Modal (The Interactive Tutorial Overlay) */}
            {showExplanation && currentQuestion && (
                <TutorialOverlay
                    question={currentQuestion}
                    onClose={() => {
                        setShowExplanation(false);
                        // Optional: Next question immediately or let user act? User usually wants to try again or move on.
                        // Let's keep existing logic: closes modal, user is back to input.
                        // If in training, maybe we force a new question if they just learned?
                        // For now just close.
                    }}
                />
            )}
        </div>
    );
};
