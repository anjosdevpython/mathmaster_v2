import React, { useState, useEffect } from 'react';
import { GameState } from '../types';
import { LEVELS } from '../constants';

interface LevelSelectViewProps {
    setGameState: (state: GameState) => void;
    startLevel: (level: number, reset?: boolean) => void;
    unlockedLevel: number;
}

const LEVEL_ICONS = [
    // Tier 1 (1-5): Iniciante
    "person",              // 1: Novato
    "school",              // 2: Calouro
    "menu_book",           // 3: Júnior
    "military_tech",       // 4: Cadete
    "badge",               // 5: Agente

    // Tier 2 (6-10): Intermediário
    "flight",              // 6: Piloto
    "sports_martial_arts", // 7: Ninja
    "swords",              // 8: Samurai
    "shield",              // 9: Guerreiro
    "psychology",          // 10: Sábio

    // Tier 3 (11-15): Avançado
    "auto_fix_high",       // 11: Bruxo
    "workspace_premium",   // 12: Elite
    "fitness_center",      // 13: Titã
    "smart_toy",           // 14: Ciborgue
    "local_fire_department", // 15: Fênix

    // Tier 4 (16-20): Expert
    "pets",                // 16: Dragão
    "castle",              // 17: Lorde
    "star",                // 18: Alfa
    "all_inclusive",       // 19: Ômega
    "rocket",              // 20: Galático

    // Tier 5 (21-25): Mestre
    "blur_on",             // 21: Cósmico
    "atom",                // 22: Quantum
    "grid_on",             // 23: Matrix
    "visibility",          // 24: Oráculo
    "all_inclusive",       // 25: Infinito

    // Tier 6 (26-30): Lenda
    "hourglass_empty",     // 26: Eterno
    "emoji_events",        // 27: Lenda
    "bolt",                // 28: Mito
    "wb_sunny",            // 29: Deus
    "crown"                // 30: MASTER
];

export const LevelSelectView: React.FC<LevelSelectViewProps> = React.memo(({ setGameState, startLevel, unlockedLevel }) => {
    const [previewLevel, setPreviewLevel] = useState(unlockedLevel);
    const currentPreview = LEVELS[previewLevel - 1] || LEVELS[0];
    const currentIcon = LEVEL_ICONS[previewLevel - 1] || "question_mark";
    const isPreviewUnlocked = previewLevel <= unlockedLevel;

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') setPreviewLevel(p => Math.min(p + 1, 30));
            if (e.key === 'ArrowLeft') setPreviewLevel(p => Math.max(p - 1, 1));
            if (e.key === 'ArrowDown') setPreviewLevel(p => Math.min(p + 5, 30));
            if (e.key === 'ArrowUp') setPreviewLevel(p => Math.max(p - 5, 1));
            if (e.key === 'Enter' && previewLevel <= unlockedLevel) startLevel(previewLevel, true);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [previewLevel, unlockedLevel, startLevel]);

    useEffect(() => {
        const el = document.getElementById(`level-btn-${previewLevel}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }, [previewLevel]);

    return (
        <div className="relative z-10 flex flex-col w-full max-w-4xl mx-auto h-full px-4 sm:px-6 py-4 sm:py-8 gap-6 sm:gap-8 animate-pop-in">
            {/* Header */}
            <header className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setGameState(GameState.HOME)}
                        className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl sm:rounded-2xl bg-slate-900/40 border border-slate-800/50 hover:bg-slate-800 transition-all text-primary"
                    >
                        <span className="material-symbols-outlined text-sm sm:text-base">chevron_left</span>
                    </button>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-display font-black tracking-tighter text-white">SELEÇÃO DE SETOR</h2>
                        <p className="text-[8px] sm:text-[10px] font-display font-medium text-slate-500 uppercase tracking-widest">Protocolo de Ascensão Vektra</p>
                    </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full">
                    <span className="text-[10px] font-display font-bold text-primary uppercase">Progresso Total:</span>
                    <span className="text-sm font-display font-black text-white">{Math.round((unlockedLevel / 30) * 100)}%</span>
                </div>
            </header>

            <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
                {/* Level Detail Panel */}
                <div className="w-full lg:w-80 flex flex-col bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 items-center justify-between text-center shrink-0 shadow-2xl relative overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-b ${isPreviewUnlocked ? 'from-primary/5' : 'from-red-500/5'} to-transparent opacity-50`} />

                    <div className="z-10 w-full flex flex-col items-center">
                        <div className={`relative mb-4 sm:mb-8 transition-all duration-500 ${isPreviewUnlocked ? 'scale-100 sm:scale-110' : 'grayscale opacity-30 scale-100'}`}>
                            <div className={`absolute inset-0 blur-3xl rounded-full transform scale-150 animate-pulse ${isPreviewUnlocked ? 'bg-primary/20' : 'bg-red-500/10'}`} />
                            <span className={`material-symbols-outlined text-6xl sm:text-8xl ${isPreviewUnlocked ? 'text-white glow-text' : 'text-slate-600'}`}>
                                {isPreviewUnlocked ? currentIcon : 'lock'}
                            </span>
                        </div>

                        <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight mb-1">{currentPreview.name}</h3>
                        <div className="text-primary font-display font-bold text-xs tracking-[0.2em] mb-8">SETOR {currentPreview.level.toString().padStart(2, '0')}</div>
                    </div>

                    <div className="z-10 w-full space-y-3">
                        {isPreviewUnlocked ? (
                            <>
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-[10px] font-display font-bold text-slate-500 uppercase">Tempo</span>
                                    <span className="text-xs font-display font-black text-white">{currentPreview.timePerQuestion}S</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-[10px] font-display font-bold text-slate-500 uppercase">Questões</span>
                                    <span className="text-xs font-display font-black text-white">{currentPreview.totalQuestions}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-[10px] font-display font-bold text-slate-500 uppercase">Operações</span>
                                    <div className="flex gap-1.5 flex-wrap justify-end">
                                        {currentPreview.operations.map((op: string) => {
                                            const symbols: Record<string, string> = { '+': '+', '-': '−', '*': '×', '/': '÷', 'power': 'x²', 'sqrt': '√', 'percentage': '%', 'equation': 'eq', 'fraction': '½' };
                                            return (
                                                <span key={op} className="text-[9px] font-display font-black bg-primary/10 text-primary px-1.5 py-0.5 rounded-md">
                                                    {symbols[op] || op}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                                <button
                                    onClick={() => startLevel(currentPreview.level, true)}
                                    className="w-full h-14 stitch-btn stitch-btn-primary mt-4"
                                >
                                    ASSUMIR COMANDO
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col items-center gap-3 py-6 px-4 border border-red-500/20 bg-red-500/5 rounded-2xl">
                                <span className="material-symbols-outlined text-red-500">lock</span>
                                <span className="text-[10px] font-display font-black text-red-500 uppercase tracking-widest text-center">
                                    Acesso Bloqueado. Conclua o setor anterior.
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Grid Container */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 pb-20 lg:pb-0">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-4">
                        {LEVELS.map((lvl, index) => {
                            const isUnlocked = lvl.level <= unlockedLevel;
                            const isSelected = lvl.level === previewLevel;
                            const icon = LEVEL_ICONS[index] || "question_mark";

                            return (
                                <button
                                    key={lvl.level}
                                    id={`level-btn-${lvl.level}`}
                                    onClick={() => {
                                        setPreviewLevel(lvl.level);
                                        if (isUnlocked) startLevel(lvl.level, true);
                                    }}
                                    onMouseEnter={() => setPreviewLevel(lvl.level)}
                                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300 border-2 relative group active:scale-90
                                        ${isSelected
                                            ? 'border-primary bg-primary/20 text-white shadow-neon scale-105 z-10'
                                            : isUnlocked
                                                ? 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-primary/50 hover:bg-slate-800/60 hover:text-white'
                                                : 'border-slate-900 bg-slate-950/40 text-slate-700 grayscale opacity-40'}`}
                                >
                                    <span className={`material-symbols-outlined text-2xl mb-1 ${isSelected ? 'animate-bounce' : 'group-hover:translate-y-[-2px] transition-transform'}`}>
                                        {isUnlocked ? icon : 'lock'}
                                    </span>
                                    <span className="text-lg font-display font-black leading-none">{lvl.level}</span>
                                    <div className={`text-[7px] uppercase font-display font-bold tracking-widest mt-1 max-w-[80%] truncate ${isSelected ? 'text-primary' : 'text-slate-500'}`}>
                                        {lvl.name}
                                    </div>

                                    {/* Status Indicators */}
                                    {isUnlocked ? (
                                        isSelected ? (
                                            <div className="absolute -top-1 -right-1 flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                                            </div>
                                        ) : (
                                            <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary/30 rounded-full" />
                                        )
                                    ) : (
                                        <div className="absolute top-2 right-2 w-1 h-1 bg-white/5 rounded-full" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
});
