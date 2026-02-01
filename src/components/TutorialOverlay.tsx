import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import { PowerVisual } from './visuals/PowerVisual';
import { SqrtVisual } from './visuals/SqrtVisual';

interface TutorialOverlayProps {
    question: Question;
    onClose: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ question, onClose }) => {
    const [stepIndex, setStepIndex] = useState(0);
    const steps = question.explanation?.split('|') || [];
    const isLastStep = stepIndex >= steps.length - 1;

    // Progress bar calculations
    const progress = ((stepIndex + 1) / steps.length) * 100;

    const handleNext = () => {
        if (isLastStep) {
            onClose();
        } else {
            setStepIndex(p => p + 1);
        }
    };

    // Keyboard navigation
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-pop-in">
            {/* Background Decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
            </div>

            <div className="relative w-full max-w-4xl mx-4 flex flex-col md:flex-row bg-surface border border-white/10 rounded-panel overflow-hidden shadow-2xl">

                {/* Lado Esquerdo: Visual Interativo (Simulação) */}
                <div className="w-full md:w-1/2 p-8 bg-black/40 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/5 relative min-h-[300px]">
                    <div className="absolute top-4 left-4 text-[10px] font-mono text-primary uppercase tracking-widest">
                        <i className="fas fa-microchip mr-2 animate-pulse" />
                        Simulação Visual
                    </div>

                    <div className="scale-125 transform transition-all duration-500">
                        {question.opType === 'power' && <PowerVisual value={question.values[0]} />}
                        {question.opType === 'sqrt' && <SqrtVisual target={question.values[0]} answer={question.answer} />}

                        {/* Generic Visual for other ops - Simple Blocks for now */}
                        {!['power', 'sqrt'].includes(question.opType) && (
                            <div className="flex flex-col items-center gap-4">
                                <div className="text-6xl font-black font-display text-white/20 animate-float">
                                    {question.text}
                                </div>
                                <div className="flex gap-2">
                                    {/* Abstract representation of numbers */}
                                    <div className="h-2 w-16 bg-primary/50 rounded-full animate-pulse"></div>
                                    <div className="h-2 w-16 bg-accent/50 rounded-full animate-pulse delay-75"></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Lado Direito: Instruções Passo a Passo */}
                <div className="w-full md:w-1/2 p-8 flex flex-col relative">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="text-2xl font-bold font-display text-white">PROTOCOLO DE TREINO</h2>
                            <div className="text-xs font-mono text-white/40 mt-1">Siga as instruções para assimilar o padrão.</div>
                        </div>
                        <button onClick={onClose} className="text-white/20 hover:text-white transition-colors">
                            <i className="fas fa-times text-xl" />
                        </button>
                    </div>

                    {/* Step Card */}
                    <div className="flex-1 flex flex-col justify-center mb-8">
                        <div key={stepIndex} className="animate-pop-in">
                            <div className="text-4xl font-black text-primary/20 mb-4 font-display">
                                0{stepIndex + 1}
                            </div>
                            <p className="text-xl md:text-2xl font-medium leading-relaxed text-white">
                                {steps[stepIndex]}
                            </p>
                        </div>
                    </div>

                    {/* Navigation & Progress */}
                    <div className="mt-auto">
                        <div className="w-full h-1 bg-white/10 rounded-full mb-6 relative overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-500 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        <button
                            onClick={handleNext}
                            className={`w-full py-4 rounded-tech font-bold uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-3
                            ${isLastStep
                                    ? 'bg-primary text-background hover:shadow-glow-primary hover:scale-[1.02]'
                                    : 'bg-surfaceLight hover:bg-white/10 text-white border border-white/10'}`}
                        >
                            {isLastStep ? 'CONCLUIR TREINAMENTO' : 'PRÓXIMO PASSO'}
                            <i className={`fas ${isLastStep ? 'fa-check' : 'fa-arrow-right'}`} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
