import React, { useState, useEffect, useCallback } from 'react';
import { GameState, GameStats, Question } from './types';
import { LEVELS, INITIAL_LIVES, BASE_CORRECT_POINTS } from './constants';
import { generateQuestion, clearQuestionHistory } from './services/mathGenerator';
import { audioService } from './services/audioService';
import { HomeView } from './views/HomeView';
import { LevelSelectView } from './views/LevelSelectView';
import { GameView } from './views/GameView';
import { PersistenceService } from './services/persistence';
import { aiService } from './services/aiService';
import { supabase } from './lib/supabase';
import confetti from 'canvas-confetti';

const App: React.FC = () => {
  useEffect(() => { console.log("Vektra Mind Redesign v4.0.0 - Neural Sync"); }, []);

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
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [trainingQuestionCount, setTrainingQuestionCount] = useState(0);
  const [timedTraining, setTimedTraining] = useState(false);

  useEffect(() => {
    const data = PersistenceService.load();
    setUnlockedLevel(Math.max(1, data.unlockedLevel));
  }, []);

  const startLevel = useCallback((levelNum: number, reset = false, isTraining = false, withTime = false) => {
    const config = LEVELS[levelNum - 1] || LEVELS[0];

    // Limpa o histórico de questões ao iniciar um novo nível
    clearQuestionHistory();

    const q = generateQuestion(config, selectedOps, isTraining ? 0 : undefined);

    setStats({
      score: reset ? 0 : stats.score,
      lives: isTraining ? Infinity : INITIAL_LIVES,
      currentLevel: levelNum,
      currentQuestionIndex: 0,
      correctInLevel: 0,
      perfectLevel: true,
      streak: 0,
    });

    setCurrentQuestion(q);
    setTimedTraining(withTime);
    setTimeLeft(isTraining ? (withTime ? config.timePerQuestion : Infinity) : config.timePerQuestion);
    setGameState(isTraining ? GameState.TRAINING : GameState.PLAYING);
    setUserInput('');
    setFeedback(null);
    setShowExplanation(false);
    setAiExplanation(null);
    setIsLoadingAI(false);
    setVisibleSteps(0);
    setTrainingQuestionCount(0);
  }, [selectedOps, stats.score]);

  const nextQ = useCallback(() => {
    const isTraining = gameState === GameState.TRAINING;
    const config = LEVELS[stats.currentLevel - 1] || LEVELS[0];

    if (!isTraining && stats.currentQuestionIndex + 1 >= config.totalQuestions) {
      const nextLevel = stats.currentLevel + 1;
      PersistenceService.updateLevel(nextLevel);
      PersistenceService.updateScore(stats.currentLevel, stats.score);
      setUnlockedLevel(p => Math.max(p, nextLevel));
      setGameState(GameState.LEVEL_COMPLETE);
    } else {
      const q = generateQuestion(config, selectedOps, isTraining ? trainingQuestionCount : undefined);
      setCurrentQuestion(q);
      if (!isTraining) {
        setTimeLeft(config.timePerQuestion);
      } else {
        setTimeLeft(timedTraining ? config.timePerQuestion : Infinity);
      }
      setStats(p => ({ ...p, currentQuestionIndex: p.currentQuestionIndex + 1 }));
      setUserInput('');
      setFeedback(null);
      setShowExplanation(false);
      setAiExplanation(null);
      setIsLoadingAI(false);
      setVisibleSteps(0);
    }
  }, [stats, gameState, selectedOps, trainingQuestionCount, timedTraining]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentQuestion || feedback) return;

    if (parseFloat(userInput) === currentQuestion.answer) {
      const streakBonus = Math.floor(stats.streak / 3) * 50;
      const totalPoints = BASE_CORRECT_POINTS + streakBonus;

      audioService.playSuccess(stats.streak);
      const messages = ["EXCELENTE!", "INCRÍVEL!", "CÁLCULO PERFEITO!", "MANDOU BEM!", "FANTÁSTICO!", "GÊNIO!", "ESTRATÉGICO!", "PRECISO!"];
      setSuccessMessage(stats.streak >= 2 ? `${messages[Math.floor(Math.random() * messages.length)]} COMBO x${stats.streak + 1}` : messages[Math.floor(Math.random() * messages.length)]);
      setFeedback('correct');

      confetti({
        particleCount: 150 + (stats.streak * 20),
        spread: 70 + (stats.streak * 5),
        origin: { y: 0.6 },
        colors: stats.streak >= 5 ? ['#facc15', '#22d3ee', '#ffffff'] : ['#10b981', '#22d3ee', '#ffffff']
      });

      if (gameState !== GameState.TRAINING) {
        setStats(p => ({
          ...p,
          score: p.score + totalPoints,
          correctInLevel: p.correctInLevel + 1,
          streak: p.streak + 1
        }));
      } else {
        setStats(p => ({
          ...p,
          correctInLevel: p.correctInLevel + 1,
          streak: p.streak + 1
        }));
        setTrainingQuestionCount(prev => prev + 1);
      }

      setTimeout(() => {
        setSuccessMessage(null);
        nextQ();
      }, 1000);
    } else {
      audioService.playError();
      setFeedback('wrong');
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 500);

      setIsLoadingAI(true);
      aiService.explainError(currentQuestion.text, currentQuestion.answer, userInput)
        .then(explanation => {
          setAiExplanation(explanation);
          setIsLoadingAI(false);
        });

      if (gameState !== GameState.TRAINING) {
        setStats(p => ({ ...p, lives: p.lives - 1, perfectLevel: false, streak: 0 }));
        if (stats.lives <= 1) setGameState(GameState.GAME_OVER);
      }
    }
  };

  useEffect(() => {
    PersistenceService.init();
    const updateTitle = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      document.title = user?.user_metadata?.username ? `Vektra Mind | ${user.user_metadata.username}` : `Vektra Mind`;
    };
    updateTitle();
    const { data: authListener } = supabase.auth.onAuthStateChange(() => updateTitle());
    return () => authListener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Timer para modo jogo normal ou modo treino com tempo
    const isTimedMode = gameState === GameState.PLAYING || (gameState === GameState.TRAINING && timedTraining);

    // Pausa o timer se a explicação estiver aberta
    if (isTimedMode && timeLeft > 0 && !showExplanation) {
      const timer = setInterval(() => {
        setTimeLeft(p => {
          if (p <= 0.1) {
            if (gameState === GameState.PLAYING) {
              setGameState(GameState.GAME_OVER);
            }
            return 0;
          }
          return p - 0.1;
        });
      }, 100);
      return () => clearInterval(timer);
    }
  }, [gameState, timeLeft, showExplanation, timedTraining]);

  return (
    <div className="h-[100dvh] w-screen bg-background text-slate-100 flex flex-col items-center justify-center relative overflow-hidden selection:bg-primary/30">
      {/* Redesign Background Layers */}
      <div className="fixed inset-0 pointer-events-none star-bg z-0 opacity-40"></div>
      <div className="fixed inset-0 pointer-events-none cyber-grid z-0 opacity-20"></div>
      <div className="fixed top-1/4 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-1/4 -right-20 w-64 h-64 bg-accent/10 rounded-full blur-[120px] pointer-events-none"></div>

      <main className={`relative z-10 w-full h-full flex flex-col items-center justify-center border-white/5 ${gameState === GameState.LEVEL_SELECT || gameState === GameState.HOME ? 'max-w-7xl' : 'max-w-[430px] border-x'
        } mx-auto transition-all duration-500`}>
        {gameState === GameState.HOME && (
          <HomeView
            setGameState={setGameState}
            startLevel={startLevel}
            selectedOps={selectedOps}
            setSelectedOps={setSelectedOps}
          />
        )}

        {gameState === GameState.LEVEL_SELECT && (
          <div className="w-full h-full px-4 overflow-hidden">
            <LevelSelectView
              setGameState={setGameState}
              startLevel={startLevel}
              unlockedLevel={unlockedLevel}
            />
          </div>
        )}

        {(gameState === GameState.PLAYING || gameState === GameState.TRAINING) && (
          <GameView
            gameState={gameState} stats={stats} currentQuestion={currentQuestion}
            timeLeft={timeLeft} userInput={userInput} setUserInput={setUserInput}
            handleSubmit={handleSubmit} feedback={feedback} setGameState={setGameState}
            showExplanation={showExplanation} setShowExplanation={setShowExplanation}
            visibleSteps={visibleSteps} isFlashing={isFlashing} nextQ={nextQ}
            aiExplanation={aiExplanation} isLoadingAI={isLoadingAI}
            successMessage={successMessage}
          />
        )}

        {gameState === GameState.GAME_OVER && (
          <div className="flex flex-col items-center justify-center h-full w-full px-8 text-center gap-12 animate-pop-in">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 blur-[80px] rounded-full" />
              <span className="material-symbols-outlined text-9xl text-red-500 relative z-10 animate-pulse">skull</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl font-display font-black tracking-tighter text-white">FALHA NO SISTEMA</h1>
              <p className="text-[10px] tracking-[0.4em] font-display font-medium text-slate-500 uppercase">Neural Sync Interrompido</p>
            </div>

            <div className="w-full space-y-4">
              <button
                onClick={() => setGameState(GameState.HOME)}
                className="w-full h-16 stitch-btn stitch-btn-primary !gradient-button !bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.4)]"
              >
                REINICIAR PROTOCOLO
              </button>
            </div>
          </div>
        )}

        {gameState === GameState.LEVEL_COMPLETE && (
          <div className="flex flex-col items-center justify-center h-full w-full px-8 text-center gap-8 animate-pop-in">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
                <span className="material-symbols-outlined text-primary text-4xl">emoji_events</span>
              </div>
              <h1 className="text-3xl font-display font-black tracking-tighter text-white uppercase">Setor Concluído</h1>
              <p className="text-xs text-slate-400 font-medium">Excelente performance neural!</p>
            </div>

            <div className="w-full bg-slate-950/40 backdrop-blur-xl border border-slate-800/50 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-5">
                <span className="material-symbols-outlined text-6xl">insights</span>
              </div>
              <div className="grid grid-cols-2 gap-4 relative z-10 font-display">
                <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl text-left">
                  <p className="text-[8px] uppercase font-black text-slate-500 tracking-wider mb-1">Pontuação</p>
                  <p className="text-xl font-black text-white">{stats.score.toLocaleString()}</p>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl text-left">
                  <p className="text-[8px] uppercase font-black text-slate-500 tracking-wider mb-1">Precisão</p>
                  <p className="text-xl font-black text-primary">{stats.perfectLevel ? '100%' : '80%+'}</p>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl text-left">
                  <p className="text-[8px] uppercase font-black text-slate-500 tracking-wider mb-1">Status</p>
                  <p className="text-sm font-black text-success uppercase">Otimizado</p>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl text-left">
                  <p className="text-[8px] uppercase font-black text-slate-500 tracking-wider mb-1">Eficiência</p>
                  <p className="text-xl font-black text-white">Alta</p>
                </div>
              </div>
            </div>

            <div className="w-full space-y-4">
              <button
                onClick={() => setGameState(GameState.LEVEL_SELECT)}
                className="w-full h-16 stitch-btn stitch-btn-primary"
              >
                PRÓXIMO SETOR <span className="material-symbols-outlined">fast_forward</span>
              </button>
              <button
                onClick={() => setGameState(GameState.HOME)}
                className="w-full h-14 bg-transparent border border-slate-800 text-slate-400 font-display font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-800/20"
              >
                DASHBOARD CENTRAL
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Decorative Home Indicator Area */}
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 opacity-20 hidden md:block">
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 bg-primary"></div>
          <span className="text-[8px] tracking-[0.5em] uppercase font-bold text-primary">Vektra Mind Protocol v4.0.0</span>
          <div className="w-1 h-1 bg-primary"></div>
        </div>
      </div>
    </div>
  );
};

export default App;
