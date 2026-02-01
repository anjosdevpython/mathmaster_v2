import React, { useState } from 'react';
import { GameState } from '../types';
import { LEVELS } from '../constants';

interface LevelSelectViewProps {
    setGameState: (state: GameState) => void;
    startLevel: (level: number, reset?: boolean) => void;
    unlockedLevel: number;
}

const LEVEL_ICONS = [
    "fa-user", "fa-user-graduate", "fa-book-reader", "fa-user-secret", "fa-jet-fighter", // 1-5
    "fa-user-ninja", "fa-khanda", "fa-scroll", "fa-hat-wizard", "fa-medal", // 6-10
    "fa-dumbbell", "fa-robot", "fa-fire", "fa-dragon", "fa-chess-king", // 11-15
    "fa-atom", "fa-balance-scale", "fa-globe-americas", "fa-meteor", "fa-sun", // 16-20
    "fa-microchip", "fa-network-wired", "fa-eye", "fa-infinity", "fa-hourglass-half", // 21-25
    "fa-trophy", "fa-bolt", "fa-star", "fa-yin-yang", "fa-crown" // 26-30
];

export const LevelSelectView: React.FC<LevelSelectViewProps> = ({ setGameState, startLevel, unlockedLevel }) => {
    // Estado para controlar qual nível está sendo pré-visualizado (hover) ou o atual desbloqueado
    const [previewLevel, setPreviewLevel] = useState(unlockedLevel);

    // Dados do nível em destaque
    const currentPreview = LEVELS[previewLevel - 1] || LEVELS[0];
    const currentIcon = LEVEL_ICONS[previewLevel - 1] || "fa-question";
    const isPreviewUnlocked = previewLevel <= unlockedLevel;

    // Navegação por Teclado
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') setPreviewLevel(p => Math.min(p + 1, 30));
            if (e.key === 'ArrowLeft') setPreviewLevel(p => Math.max(p - 1, 1));
            if (e.key === 'ArrowDown') setPreviewLevel(p => Math.min(p + 5, 30)); // Pulando linha (aprox)
            if (e.key === 'ArrowUp') setPreviewLevel(p => Math.max(p - 5, 1));
            if (e.key === 'Enter') {
                if (previewLevel <= unlockedLevel) startLevel(previewLevel, true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [previewLevel, unlockedLevel, startLevel]);

    // Auto-scroll para manter o item selecionado visível
    React.useEffect(() => {
        const el = document.getElementById(`level-btn-${previewLevel}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }, [previewLevel]);

    return (
        <div className="flex flex-col h-full px-6 py-6 animate-pop-in max-w-7xl mx-auto w-full relative z-10 text-white gap-6">

            {/* Header / Nav */}
            <div className="flex items-center gap-4 shrink-0">
                <button
                    onClick={() => setGameState(GameState.HOME)}
                    className="w-10 h-10 flex items-center justify-center rounded-tech bg-surfaceLight hover:bg-white/10 transition-all border border-white/10"
                >
                    <i className="fas fa-chevron-left text-primary" />
                </button>
                <h2 className="text-2xl font-display font-bold">ESCOLHA UM NÍVEL</h2>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">

                {/* Lado Esquerdo: Destaque do Personagem (Hidden on small mobile, visible on larger screens) */}
                <div className="hidden md:flex md:w-5/12 lg:w-1/3 flex-col panel-glass p-6 lg:p-8 items-center justify-center text-center relative overflow-hidden transition-all duration-300 border-primary/20 shrink-0">
                    <div className={`absolute inset-0 bg-gradient-to-b ${isPreviewUnlocked ? 'from-primary/5 to-transparent' : 'from-red-500/5 to-transparent'} pointer-events-none`} />

                    {/* Avatar Grande */}
                    <div className={`relative mb-6 transition-transform duration-500 ${isPreviewUnlocked ? 'scale-100' : 'grayscale opacity-50'}`}>
                        <div className="absolute inset-0 blur-3xl bg-primary/20 rounded-full transform scale-150 animate-pulse-slow"></div>
                        <i className={`fas ${currentIcon} text-8xl lg:text-9xl drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] ${isPreviewUnlocked ? 'text-white' : 'text-white/20'}`} />
                    </div>

                    <h1 className="text-3xl lg:text-4xl font-black font-display mb-2 uppercase tracking-wide break-words w-full">{currentPreview.name}</h1>
                    <div className="text-primary font-mono font-bold text-xl mb-6">NÍVEL {currentPreview.level}</div>

                    {isPreviewUnlocked ? (
                        <div className="space-y-4 w-full max-w-xs">
                            <div className="flex justify-between text-xs font-mono border-b border-white/10 pb-2">
                                <span className="text-white/50">TEMPO</span>
                                <span className="text-white">{currentPreview.timePerQuestion}s / pergunta</span>
                            </div>
                            <div className="flex justify-between text-xs font-mono border-b border-white/10 pb-2">
                                <span className="text-white/50">MISSÃO</span>
                                <span className="text-white">{currentPreview.totalQuestions} Fases</span>
                            </div>
                            <div className="flex justify-between text-xs font-mono border-b border-white/10 pb-2">
                                <span className="text-white/50">OPERAÇÕES</span>
                                <div className="flex gap-2 text-accent">
                                    {currentPreview.operations.map(op => (
                                        <span key={op}>{op === 'fraction' ? '%' : op}</span>
                                    ))}
                                </div>
                            </div>
                            <button
                                onClick={() => startLevel(currentPreview.level, true)}
                                className="w-full btn-primary mt-4 py-4"
                            >
                                JOGAR AGORA <i className="fas fa-play ml-2" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-danger font-mono text-sm border border-danger/30 p-4 rounded-tech bg-danger/5">
                            <i className="fas fa-lock" /> ACESSO RESTRITO
                        </div>
                    )}
                </div>

                {/* Lado Direito: Grid de Níveis */}
                <div className="flex-1 overflow-y-auto no-scrollbar pr-2 pb-32 md:pb-0">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {LEVELS.map((lvl, index) => {
                            const isUnlocked = lvl.level <= unlockedLevel;
                            const isSelected = lvl.level === previewLevel;
                            const icon = LEVEL_ICONS[index] || "fa-question";

                            return (
                                <button
                                    key={lvl.level}
                                    id={`level-btn-${lvl.level}`}
                                    disabled={!isUnlocked && false}
                                    onClick={() => {
                                        setPreviewLevel(lvl.level);
                                        // Apenas inicia o jogo se estiver desbloqueado
                                        if (isUnlocked) startLevel(lvl.level, true);
                                    }}
                                    onMouseEnter={() => setPreviewLevel(lvl.level)}
                                    className={`aspect-square rounded-tech flex flex-col items-center justify-center transition-all border relative group
                                    ${isSelected
                                            ? 'bg-primary border-primary text-background shadow-glow-primary z-10 md:scale-105'
                                            : isUnlocked
                                                ? 'bg-surfaceLight/30 border-white/5 text-white hover:bg-surfaceLight hover:border-white/20'
                                                : 'bg-black/40 border-white/5 text-white/5 grayscale'}`}
                                >
                                    <i className={`fas ${icon} text-lg md:text-xl mb-1 ${isSelected ? 'animate-bounce' : ''}`} />
                                    <span className={`text-base md:text-lg font-bold font-display leading-none`}>{lvl.level}</span>
                                    <div className={`text-[6px] md:text-[7px] uppercase font-mono tracking-widest mt-1 max-w-[90%] truncate ${isSelected ? 'text-black/80 font-bold' : 'text-white/40'}`}>
                                        {lvl.name}
                                    </div>
                                    {!isUnlocked && <div className="absolute top-1 right-2"><i className="fas fa-lock text-[8px]" /></div>}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

