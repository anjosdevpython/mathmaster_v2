import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import { PowerVisual } from './visuals/PowerVisual';
import { SqrtVisual } from './visuals/SqrtVisual';

interface TutorialOverlayProps {
    question?: Question;
    aiExplanation?: string | null;
    onClose: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ question, aiExplanation, onClose }) => {
    const [stepIndex, setStepIndex] = useState(0);

    const defaultSteps = [
        "Bem-vindo ao Vektra Mind! Prepare sua mente para desafios de alta performance.",
        "Escolha as operações que deseja praticar no painel frontal.",
        "Complete os níveis para desbloquear novos setores e aumentar sua capacidade.",
        "Dica: No Modo Treino, você tem tempo infinito para aprender as técnicas."
    ];

    const steps = aiExplanation ? [aiExplanation] : (question?.explanation?.split('|') || defaultSteps);
    const isLastStep = stepIndex >= steps.length - 1;
    const progress = ((stepIndex + 1) / steps.length) * 100;

    const handleNext = () => {
        if (isLastStep) {
            onClose();
        } else {
            setStepIndex(p => p + 1);
        }
    };

    useEffect(() => {
        const handleKeys = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
                handleNext();
            }
        };
        window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    }, [stepIndex, steps.length]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-3xl animate-pop-in">
            <div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <header className="flex justify-between items-center p-6 border-b border-white/5 bg-slate-950/30 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-xl">{aiExplanation ? 'psychology' : 'school'}</span>
                        </div>
                        <div>
                            <h2 className="text-sm font-display font-black text-white uppercase tracking-wider leading-none">
                                {aiExplanation ? 'Mestre Allan Anjos' : 'Protocolo de Treino'}
                            </h2>
                            <p className="text-[9px] font-display font-bold text-slate-500 uppercase tracking-widest mt-1">
                                {aiExplanation ? 'Mentoria Neural Ativa' : 'Aprimoramento de Habilidades'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col min-h-0">
                    {/* Optional Visual Section - Only if enough space or not AI */}
                    {!aiExplanation && question && (
                        <div className="p-8 bg-slate-950/20 flex items-center justify-center border-b border-white/5 shrink-0">
                            <div className="scale-100">
                                {question.opType === 'power' && <PowerVisual value={question.values[0]} />}
                                {question.opType === 'sqrt' && <SqrtVisual target={question.values[0]} answer={question.answer} />}
                            </div>
                        </div>
                    )}

                    {/* Content Section */}
                    <div className="p-8 flex flex-col gap-6">
                        <div key={stepIndex} className="animate-pop-in space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-display font-black text-primary px-2 py-1 rounded bg-primary/10 border border-primary/20">PASSO {stepIndex + 1}</span>
                                <div className="h-px flex-1 bg-white/5" />
                            </div>

                            <div className={`font-sans leading-relaxed text-slate-100 ${aiExplanation ? 'text-base' : 'text-lg font-semibold'}`}>
                                {aiExplanation ? (
                                    <div className="space-y-4 whitespace-pre-wrap">
                                        {steps[stepIndex].split(/(\[[^\]]+\])/g).map((part, i) => {
                                            if (part.startsWith('[') && part.endsWith(']')) {
                                                return (
                                                    <div key={i} className="text-primary font-display font-black text-xs tracking-[0.2em] uppercase mt-6 mb-2 first:mt-0 pb-1 border-b border-primary/10">
                                                        {part.slice(1, -1)}
                                                    </div>
                                                );
                                            }
                                            return <span key={i} className="text-slate-200">{part}</span>;
                                        })}
                                    </div>
                                ) : (
                                    steps[stepIndex]
                                )}
                            </div>

                            {aiExplanation && (
                                <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex gap-3 items-start mt-8">
                                    <span className="material-symbols-outlined text-primary text-lg">lightbulb</span>
                                    <div>
                                        <p className="text-[9px] font-display font-black text-primary uppercase tracking-widest mb-0.5">Dica Pro</p>
                                        <p className="text-[11px] text-slate-400">Use <span className="text-white bg-white/10 px-1 rounded font-mono">ENTER</span> para acelerar seu treino.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Controls */}
                <footer className="p-6 bg-slate-950/30 border-t border-white/5 shrink-0 space-y-4">
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>

                    <button
                        onClick={handleNext}
                        className="w-full h-14 gradient-button rounded-xl text-white font-display font-bold text-xs uppercase tracking-[0.2em] shadow-neon flex items-center justify-center gap-3 active:scale-95 transition-all"
                    >
                        {isLastStep ? (aiExplanation ? 'ENTENDIDO, PRÓXIMO' : 'FECHAR TREINAMENTO') : 'PRÓXIMO PASSO'}
                        <span className="material-symbols-outlined text-sm">{isLastStep ? 'check_circle' : 'arrow_forward'}</span>
                    </button>
                </footer>
            </div>
        </div>
    );
};
