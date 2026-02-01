
import React from 'react';

interface TimerProps {
  current: number;
  total: number;
}

const Timer: React.FC<TimerProps> = ({ current, total }) => {
  const percentage = (current / total) * 100;
  const strokeDashoffset = 283 - (283 * percentage) / 100;
  
  const colorClass = percentage < 25 ? 'stroke-red-500' : percentage < 50 ? 'stroke-yellow-500' : 'stroke-indigo-400';

  return (
    <div className="relative flex items-center justify-center w-20 h-20 md:w-32 md:h-32 transition-transform duration-500">
      <div className={`absolute inset-0 rounded-full blur-xl opacity-20 ${colorClass.replace('stroke', 'bg')}`}></div>
      <svg className="w-full h-full timer-svg relative z-10" viewBox="0 0 100 100">
        <circle
          className="stroke-white/5"
          strokeWidth="6"
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
        />
        <circle
          className={`${colorClass} transition-all duration-300 ease-linear shadow-lg`}
          strokeWidth="6"
          strokeDasharray="283"
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <span className="text-2xl md:text-4xl font-black heading-font text-white leading-none">
          {Math.ceil(current)}
        </span>
        <span className="text-[6px] md:text-[8px] uppercase font-black tracking-widest text-white/30">seg</span>
      </div>
    </div>
  );
};

export default Timer;
