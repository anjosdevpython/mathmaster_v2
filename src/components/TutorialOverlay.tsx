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
        "Bem-vindo ao MathMaster! Prepare sua mente para desafios de alta performance.",
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-slate-950/80 backdrop-blur-2xl animate-pop-in">
            <div className="relative w-full max-w-5xl h-fit max-h-[90vh] flex flex-col md:flex-row bg-slate-900/60 border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]">

                {/* Visual Section */}
                <div className="w-full md:w-[40%] bg-slate-950/40 p-8 flex flex-col items-center justify-center relative overflow-hidden shrink-0">
                    <div className="absolute top-6 left-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-sm animate-pulse">
                            {aiExplanation ? 'psychology' : 'analytics'}
                        </span>
                        <span className="text-[10px] font-display font-black text-primary uppercase tracking-[0.2em]">
                            {aiExplanation ? 'Análise do Mestre' : 'Simulação Neural'}
                        </span>
                    </div>

                    <div className="scale-100 transform transition-all duration-700">
                        {question?.opType === 'power' && <PowerVisual value={question.values[0]} />}
                        {question?.opType === 'sqrt' && <SqrtVisual target={question.values[0]} answer={question.answer} />}
                        {(!question || !['power', 'sqrt'].includes(question.opType)) && (
                            <div className="flex flex-col items-center gap-4">
                                <div className="text-7xl font-display font-black text-white/10 glow-text select-none">
                                    {question?.text.split(' ')[1] || '?'}
                                </div>
                                <div className="w-16 h-1 bg-primary/20 rounded-full animate-pulse" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 p-6 sm:p-10 flex flex-col relative bg-gradient-to-br from-slate-900/40 to-transparent min-w-0">
                    <header className="flex justify-between items-start mb-6 shrink-0">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-display font-black text-white tracking-tighter uppercase">
                                {aiExplanation ? 'ALLAN ANJOS' : 'TREINAMENTO'}
                            </h2>
                            <p className="text-[10px] font-display font-bold text-slate-500 tracking-wider">
                                {aiExplanation ? 'MENTORIA DE ALTA PERFORMANCE' : 'PROTOCOLO DE APRENDIZADO'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all shadow-xl"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </header>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-6">
                        <div key={stepIndex} className="animate-pop-in space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-display font-black text-lg">
                                    {stepIndex + 1}
                                </div>
                                <div className="h-[2px] flex-1 bg-gradient-to-r from-primary/30 to-transparent rounded-full" />
                            </div>

                            <div className={`font-display leading-relaxed text-white whitespace-pre-wrap ${aiExplanation ? 'text-lg font-medium' : 'text-xl font-medium'}`}>
                                {steps[stepIndex]}
                            </div>

                            {aiExplanation && (
                                <div className="mt-6 p-4 bg-primary/5 border border-primary/10 rounded-2xl flex gap-3 items-start">
                                    <span className="material-symbols-outlined text-primary text-xl">lightbulb</span>
                                    <div>
                                        <p className="text-[10px] font-display font-black text-primary uppercase tracking-widest mb-1">Dica de Maestria</p>
                                        <p className="text-xs text-slate-300">Pressione <span className="text-white border border-white/20 px-1 py-0.5 rounded text-[10px] font-mono">ENTER</span> para prosseguir.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 space-y-4 shrink-0">
                        {/* Progress Bar */}
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-700 shadow-[0_0_10px_#10B981]"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        <button
                            onClick={handleNext}
                            className="w-full h-14 stitch-btn stitch-btn-primary"
                        >
                            <span className="font-display font-bold tracking-[0.2em] text-xs">
                                {isLastStep ? (aiExplanation ? 'RECEBIDO, PRÓXIMO' : 'FECHAR PROTOCOLO') : 'PRÓXIMO PASSO'}
                            </span>
                            <span className="material-symbols-outlined text-base">
                                {isLastStep ? 'check_circle' : 'arrow_forward'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
