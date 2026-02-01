import React from 'react';

export const PowerVisual: React.FC<{ value: number }> = ({ value }) => (
    <div className="flex flex-col items-center gap-6 animate-pop-in">
        <div
            className="grid gap-1.5 p-5 rounded-panel border border-white/10 bg-surfaceLight/30 backdrop-blur-sm"
            style={{ gridTemplateColumns: `repeat(${value}, minmax(0, 1fr))` }}
        >
            {Array.from({ length: value * value }).map((_, i) => (
                <div
                    key={i}
                    className="w-5 h-5 md:w-7 md:h-7 bg-primary rounded-sm shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse"
                    style={{ animationDelay: `${i * 0.02}s` }}
                />
            ))}
        </div>
        <div className="text-center px-6 py-3 bg-surfaceLight rounded-full border border-white/5">
            <span className="text-primary font-display font-bold text-xl">{value} x {value} = {value * value}</span>
        </div>
    </div>
);
