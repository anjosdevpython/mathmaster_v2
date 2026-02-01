import React, { useState, useEffect } from 'react';

export const SqrtVisual: React.FC<{ target: number; answer: number }> = ({ target, answer }) => {
    const [current, setCurrent] = useState(1);
    useEffect(() => {
        if (current < answer) {
            const t = setTimeout(() => setCurrent(c => c + 1), 600);
            return () => clearTimeout(t);
        }
    }, [current, answer]);

    return (
        <div className="flex flex-col items-center gap-8 w-full animate-pop-in">
            <div className="flex flex-wrap justify-center gap-4">
                {Array.from({ length: Math.min(answer, 8) }).map((_, i) => {
                    const n = i + 1;
                    const isCurrent = n === current;
                    const isPast = n < current;
                    return (
                        <div key={n} className={`w-20 py-4 rounded-tech border transition-all duration-500 flex flex-col items-center
              ${isCurrent ? 'bg-secondary border-secondary text-black scale-110 shadow-glow-primary' :
                                isPast ? 'bg-surfaceLight border-white/5 text-white/20 opacity-40' : 'bg-surfaceLight border-white/5 text-white/10'}`}>
                            <span className="font-display font-bold text-lg">{n}²</span>
                            <span className="text-[10px] font-mono">{n * n}</span>
                        </div>
                    );
                })}
            </div>
            <div className="text-xl font-display font-bold text-secondary uppercase tracking-widest">
                {current === answer ? `🎯 Perfeito: ${answer}² = ${target}` : `Scanning... ${current}² = ${current * current}`}
            </div>
        </div>
    );
};
