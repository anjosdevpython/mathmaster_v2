
import React, { useState, useEffect, useCallback } from 'react';
import { GameState, GameStats, Question } from './types';
import { LEVELS, INITIAL_LIVES, BASE_CORRECT_POINTS } from './constants';
import { generateQuestion } from './services/mathGenerator';
import { audioService } from './services/audioService';
import ParticleBackground from './components/ParticleBackground';
import { HomeView } from './views/HomeView';
import { LevelSelectView } from './views/LevelSelectView';
import { GameView } from './views/GameView';
import { supabase } from './lib/supabase';
import { PersistenceService } from './services/persistence';

const App: React.FC = () => {
  useEffect(() => { console.log("MathMaster v2.2.1 - Force Sync Fix"); }, []);
  const [gameState, setGameState] = useState<GameState>(GameState.HOME);
  const [unlockedLevel, setUnlockedLevel] = useState<number>(1);
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    lives: INITIAL_LIVES,
    currentLevel: 1,
    currentQuestionIndex: 0,
    correctInLevel: 0,
    perfectLevel: true,
  });

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [visibleSteps, setVisibleSteps] = useState<number>(0);
  const [isFlashing, setIsFlashing] = useState(false);
  const [selectedOps, setSelectedOps] = useState<string[]>(['+', '-', '*', '/']);

  useEffect(() => {
    const data = PersistenceService.load();
    setUnlockedLevel(Math.max(1, data.unlockedLevel));
  }, []);

  const startLevel = useCallback((levelNum: number, reset = false, isTraining = false) => {
    const config = LEVELS[levelNum - 1] || LEVELS[0];
    const q = generateQuestion(config, selectedOps);

    setStats({
      score: reset ? 0 : stats.score,
      lives: isTraining ? Infinity : INITIAL_LIVES,
      currentLevel: levelNum,
      currentQuestionIndex: 0,
      correctInLevel: 0,
      perfectLevel: true,
    });

    setCurrentQuestion(q);
    setTimeLeft(isTraining ? Infinity : config.timePerQuestion);
    setGameState(isTraining ? GameState.TRAINING : GameState.PLAYING);
    setUserInput('');
    setFeedback(null);
    setShowExplanation(false);
    setVisibleSteps(0);
  }, [selectedOps, stats.score]);

  const nextQ = useCallback(() => {
    const isTraining = gameState === GameState.TRAINING;
    const config = LEVELS[stats.currentLevel - 1] || LEVELS[0];

    if (!isTraining && stats.currentQuestionIndex + 1 >= config.totalQuestions) {
      // Level Complete
      const nextLevel = stats.currentLevel + 1;

      // Persist Progress
      PersistenceService.updateLevel(nextLevel);
      PersistenceService.updateScore(stats.currentLevel, stats.score);

      setUnlockedLevel(p => Math.max(p, nextLevel));
      setGameState(GameState.LEVEL_COMPLETE);
    } else {
      const q = generateQuestion(config, selectedOps);
      setCurrentQuestion(q);
      if (!isTraining) setTimeLeft(config.timePerQuestion);
      setStats(p => ({ ...p, currentQuestionIndex: p.currentQuestionIndex + 1 }));
      setUserInput('');
      setFeedback(null);
      setShowExplanation(false);
      setVisibleSteps(0);
    }
  }, [stats, gameState, selectedOps]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentQuestion || feedback) return;

    if (parseFloat(userInput) === currentQuestion.answer) {
      audioService.playSuccess();
      setFeedback('correct');
      if (gameState !== GameState.TRAINING) {
        setStats(p => ({ ...p, score: p.score + BASE_CORRECT_POINTS, correctInLevel: p.correctInLevel + 1 }));
      } else {
        setStats(p => ({ ...p, correctInLevel: p.correctInLevel + 1 }));
      }
      setTimeout(nextQ, 800);
    } else {
      audioService.playError();
      setFeedback('wrong');
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 500);

      if (gameState !== GameState.TRAINING) {
        setStats(p => ({ ...p, lives: p.lives - 1, perfectLevel: false }));
        if (stats.lives <= 1) setGameState(GameState.GAME_OVER);
        else setTimeout(nextQ, 1500);
      }
    }
  };

  useEffect(() => {
    if (showExplanation && currentQuestion) {
      const steps = currentQuestion.explanation?.split('|') || [];
      setVisibleSteps(1);
      const timer = setInterval(() => {
        setVisibleSteps(v => v < steps.length ? v + 1 : v);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showExplanation, currentQuestion]);

  useEffect(() => {
    // Inicializa persistência
    PersistenceService.init();

    // Atualiza título com nome do usuário
    const updateTitle = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.user_metadata?.username) {
        document.title = `MathMaster | ${user.user_metadata.username}`;
      } else {
        document.title = `MathMaster`;
      }
    };

    // Chama inicialmente e ouve mudanças de auth
    updateTitle();
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      updateTitle();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (gameState === GameState.PLAYING && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(p => {
          if (p <= 0.1) { setGameState(GameState.GAME_OVER); return 0; }
          return p - 0.1;
        });
      }, 100);
      return () => clearInterval(timer);
    }
  }, [gameState, timeLeft]);

  return (
    <div className="h-full bg-background flex flex-col relative overflow-hidden font-sans text-white">
      <ParticleBackground />
      <main className="relative z-10 w-full h-full flex flex-col">
        {gameState === GameState.HOME && (
          <HomeView
            setGameState={setGameState}
            startLevel={startLevel}
            selectedOps={selectedOps}
            setSelectedOps={setSelectedOps}
          />
        )}

        {gameState === GameState.LEVEL_SELECT && (
          <LevelSelectView
            setGameState={setGameState}
            startLevel={startLevel}
            unlockedLevel={unlockedLevel}
          />
        )}

        {(gameState === GameState.PLAYING || gameState === GameState.TRAINING) && (
          <GameView
            gameState={gameState} stats={stats} currentQuestion={currentQuestion}
            timeLeft={timeLeft} userInput={userInput} setUserInput={setUserInput}
            handleSubmit={handleSubmit} feedback={feedback} setGameState={setGameState}
            showExplanation={showExplanation} setShowExplanation={setShowExplanation}
            visibleSteps={visibleSteps} isFlashing={isFlashing} nextQ={nextQ}
          />
        )}

        {/* Telas de GameOver e LevelComplete ainda inline mas estilizadas com classes novas */}
        {gameState === GameState.GAME_OVER && (
          <div className="flex flex-col items-center justify-center h-full animate-pop-in px-6 text-center z-10">
            <div className="panel-glass p-16 max-w-md w-full border border-danger/30 shadow-glow-danger">
              <i className="fas fa-skull-crossbones text-7xl text-danger mb-8 animate-pulse" />
              <h1 className="text-6xl font-black font-display text-white mb-2">FALHA NO SISTEMA</h1>
              <p className="text-white/40 mb-12 font-mono text-sm uppercase">Capacidade Neural Excedida</p>
              <button onClick={() => setGameState(GameState.HOME)} className="w-full btn-secondary uppercase tracking-widest text-xs">Reiniciar Sistema</button>
            </div>
          </div>
        )}

        {gameState === GameState.LEVEL_COMPLETE && (
          <div className="flex flex-col items-center justify-center h-full animate-pop-in px-6 z-10">
            <div className="panel-glass p-16 text-center space-y-10 max-w-md w-full border border-secondary/30 relative">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                <i className="fas fa-crown text-8xl text-secondary animate-bounce drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]" />
              </div>
              <div className="pt-4">
                <h2 className="text-5xl font-black font-display text-white mb-2">OTIMIZADO</h2>
                <p className="text-primary text-[10px] font-mono font-bold uppercase tracking-[0.4em]">Capacidade Aumentada</p>
              </div>
              <button
                onClick={() => setGameState(GameState.LEVEL_SELECT)}
                className="w-full btn-primary"
              >
                Próximo Setor <i className="fas fa-chevron-right ml-2" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
