import React from 'react';
import { GameState } from '../types';

interface HomeViewProps {
    setGameState: (state: GameState) => void;
    startLevel: (level: number, reset?: boolean, isTraining?: boolean) => void;
    selectedOps: string[];
    setSelectedOps: React.Dispatch<React.SetStateAction<string[]>>;
}

export const HomeView: React.FC<HomeViewProps> = ({ setGameState, startLevel, selectedOps, setSelectedOps }) => {
    const ops = [
        { id: '+', icon: 'fa-plus', label: 'SOMA' },
        { id: '-', icon: 'fa-minus', label: 'SUB' },
        { id: '*', icon: 'fa-times', label: 'MULT' },
        { id: '/', icon: 'fa-divide', label: 'DIV' },
        { id: 'power', icon: 'fa-superscript', label: 'POT' },
        { id: 'sqrt', icon: 'fa-square-root-alt', label: 'RAIZ' },
        { id: 'percentage', icon: 'fa-percentage', label: '%PERCENT' }
    ];

    const toggleOp = (id: string) => {
        setSelectedOps(prev => prev.includes(id) ? prev.filter(o => o !== id) : [...prev, id]);
    };

    return (
        <div className="flex flex-col items-center justify-evenly h-full w-full max-w-7xl mx-auto px-6 py-4 animate-pop-in relative z-10">

            {/* Header Compacto */}
            <div className="flex flex-col items-center mt-4 md:mt-10 mb-8 md:mb-16">
                <h1 className="text-5xl md:text-8xl font-black font-display tracking-tight text-white drop-shadow-2xl mb-2">
                    MATH<span className="text-primary">MASTER</span>
                </h1>
                <p className="text-white/40 font-mono text-[10px] md:text-xs uppercase tracking-[0.4em] md:tracking-[0.6em]">
                    Matemática Mental de Alta Performance
                </p>
            </div>

            {/* Config Panel - Mais integrado */}
            <div className="w-full max-w-3xl">
                <div className="panel-glass p-6 md:p-8 border border-white/5 bg-surface/50 backdrop-blur-xl">
                    <div className="grid grid-cols-4 md:grid-cols-7 gap-3 md:gap-4">
                        {ops.map(op => (
                            <button
                                key={op.id}
                                onClick={() => toggleOp(op.id)}
                                className={`aspect-square flex flex-col items-center justify-center rounded-tech border-2 transition-all duration-200 group relative overflow-hidden
                  ${selectedOps.includes(op.id)
                                        ? 'bg-primary/10 border-primary text-primary shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                                        : 'bg-surfaceLight/30 border-transparent text-white/20 hover:bg-surfaceLight hover:text-white/60'}`}
                            >
                                <div className={`absolute inset-0 bg-primary/10 opacity-0 transition-opacity ${selectedOps.includes(op.id) ? 'opacity-100' : ''}`} />
                                <i className={`fas ${op.icon} text-xl md:text-2xl mb-1 relative z-10 ${selectedOps.includes(op.id) ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
                                <span className="text-[9px] font-mono font-bold relative z-10">{op.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Action Buttons - Mais destaque */}
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl mb-auto mt-8">
                <button
                    onClick={() => setGameState(GameState.LEVEL_SELECT)}
                    className="btn-primary flex-[2] py-6 text-lg group shadow-[0_10px_40px_-10px_rgba(16,185,129,0.5)]"
                >
                    COMEÇAR JOGO
                    <i className="fas fa-play ml-3 group-hover:translate-x-1 transition-transform text-xs" />
                </button>

                <button
                    onClick={() => startLevel(1, true, true)}
                    className="btn-secondary flex-1 py-6 group text-white/50 hover:text-white"
                >
                    Modo Treino
                    <i className="fas fa-dumbbell ml-2 group-hover:rotate-12 transition-transform text-xs" />
                </button>
            </div>

            <footer className="w-full flex flex-col items-center justify-center border-t border-white/5 pt-6 pb-2 mt-8 space-y-4">
                <div className="flex gap-4">
                    <button
                        onClick={() => {
                            // Dynamic import to avoid circular dependency issues if any, or just use direct usage if imported
                            // Assuming PersistenceService is available or passed as prop. 
                            // Since HomeView is a component, let's allow it to handle this via props or direct import if clean.
                            // Better: Implement the logic directly here importing the service.
                            import('../services/persistence').then(({ PersistenceService }) => {
                                const json = PersistenceService.exportData();
                                const blob = new Blob([json], { type: 'application/json' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `mathmaster_save_${new Date().toISOString().split('T')[0]}.json`;
                                a.click();
                            });
                        }}
                        className="text-[10px] font-mono text-white/30 hover:text-white transition-colors uppercase tracking-wider"
                    >
                        <i className="fas fa-download mr-1"></i> Exportar Dados
                    </button>

                    <label className="text-[10px] font-mono text-white/30 hover:text-white transition-colors uppercase tracking-wider cursor-pointer">
                        <i className="fas fa-upload mr-1"></i> Importar Dados
                        <input
                            type="file"
                            accept=".json"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    import('../services/persistence').then(({ PersistenceService }) => {
                                        const reader = new FileReader();
                                        reader.onload = (ev) => {
                                            const content = ev.target?.result as string;
                                            if (PersistenceService.importData(content)) {
                                                alert('Dados importados com sucesso! O sistema será reiniciado.');
                                                window.location.reload();
                                            } else {
                                                alert('Erro ao importar dados. Arquivo inválido.');
                                            }
                                        };
                                        reader.readAsText(file);
                                    });
                                }
                            }}
                        />
                    </label>
                </div>

                <div className="text-[10px] font-mono text-white/20 tracking-widest uppercase">
                    Desenvolvido por <a href="https://allananjos.dev.br" target="_blank" rel="noreferrer" className="text-accent hover:text-white transition-colors">Allan Anjos</a>
                </div>
            </footer>
        </div>
    );
};
