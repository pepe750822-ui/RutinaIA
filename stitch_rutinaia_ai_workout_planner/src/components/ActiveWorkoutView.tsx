import { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Check, 
  Clock, 
  Flame, 
  Layers, 
  Plus, 
  Minus, 
  Volume2, 
  AlertTriangle,
  Zap
} from 'lucide-react';
import { Routine, Exercise } from '../types';

interface ActiveWorkoutViewProps {
  routine: Routine;
  onFinishWorkout: (minutes: number, calories: number) => void;
  onCancelWorkout: () => void;
}

export default function ActiveWorkoutView({ routine, onFinishWorkout, onCancelWorkout }: ActiveWorkoutViewProps) {
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [currentSeriesIdx, setCurrentSeriesIdx] = useState(1);
  const [weightKg, setWeightKg] = useState(0);

  // Timers state
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [paused, setPaused] = useState(false);
  
  // Rest timer
  const [resting, setResting] = useState(false);
  const [restLeft, setRestLeft] = useState(0);
  const [fastMode, setFastMode] = useState(false); // fast test mode: rest is 5s instead of 90s

  const elapsedTimerRef = useRef<NodeJS.Timeout | null>(null);
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentExercise: Exercise = routine.exercises[currentExerciseIdx];

  // Sync weight on exercise shift
  useEffect(() => {
    if (currentExercise) {
      setWeightKg(currentExercise.weightKg);
    }
  }, [currentExerciseIdx, currentExercise]);

  // Session timer ticker
  useEffect(() => {
    if (!paused && !resting) {
      elapsedTimerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    };
  }, [paused, resting]);

  // Rest timer ticker
  useEffect(() => {
    if (resting && restLeft > 0) {
      restTimerRef.current = setInterval(() => {
        setRestLeft(prev => {
          if (prev <= 1) {
            clearInterval(restTimerRef.current!);
            setResting(false);
            playBeep(); // synth audio trigger
            // Advance to next series
            handleNextSeries();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    };
  }, [resting, restLeft]);

  // Synthesis Beep effect
  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // high note
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.log('AudioContext blocked or unsuppported:', e);
    }
  };

  const handleNextSeries = () => {
    if (currentSeriesIdx < currentExercise.series) {
      setCurrentSeriesIdx(prev => prev + 1);
    } else {
      // Completed last series of current exercise. Move to next exercise
      if (currentExerciseIdx < routine.exercises.length - 1) {
        setCurrentExerciseIdx(prev => prev + 1);
        setCurrentSeriesIdx(1);
      } else {
        // Workout complete!
        handleCompleteWorkout();
      }
    }
  };

  const handleCompleteSeries = () => {
    playBeep();
    const restDuration = fastMode ? 5 : currentExercise.restSeconds;
    setRestLeft(restDuration);
    setResting(true);
  };

  const handleSkipRest = () => {
    setResting(false);
    if (restTimerRef.current) clearInterval(restTimerRef.current);
    handleNextSeries();
  };

  const handlePrevExercise = () => {
    if (currentExerciseIdx > 0) {
      setCurrentExerciseIdx(prev => prev - 1);
      setCurrentSeriesIdx(1);
      setResting(false);
    }
  };

  const handleNextExercise = () => {
    if (currentExerciseIdx < routine.exercises.length - 1) {
      setCurrentExerciseIdx(prev => prev + 1);
      setCurrentSeriesIdx(1);
      setResting(false);
    } else {
      handleCompleteWorkout();
    }
  };

  const handleCompleteWorkout = () => {
    // calculate actual values or fallback to estimates
    const minutes = Math.ceil(elapsedSeconds / 60) || 1;
    const calories = Math.round((minutes / routine.durationMinutes) * (routine.caloriesKcal || 350));
    onFinishWorkout(minutes, calories);
  };

  // Formatting utility
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Percent progress computation
  const totalSets = routine.exercises.reduce((acc, ex) => acc + ex.series, 0);
  let setsCompleted = 0;
  for (let i = 0; i < currentExerciseIdx; i++) {
    setsCompleted += routine.exercises[i].series;
  }
  setsCompleted += (currentSeriesIdx - 1);
  const progressPercent = Math.round((setsCompleted / totalSets) * 100);

  return (
    <div className="space-y-6 pb-24 animate-fade-in relative">
      
      {/* Rest Timer Overlay Panel */}
      {resting && (
        <div className="fixed inset-0 bg-[#0a0f1e]/95 z-50 flex flex-col justify-center items-center p-6 text-center backdrop-blur-md">
          <div className="space-y-1">
            <span className="text-[#00ff88] font-mono text-xs font-black uppercase tracking-widest">
              TIEMPO DE DESCANSO
            </span>
            <h3 className="font-display text-lg font-bold text-[#dee1f7]">
              Prepárate para la siguiente serie
            </h3>
          </div>

          {/* Large Countdown timer circle */}
          <div className="relative w-64 h-64 my-10 flex flex-col items-center justify-center">
            {/* Background ring */}
            <div className="absolute inset-0 rounded-full border-8 border-white/5"></div>
            {/* Active animated gradient border */}
            <div className="absolute inset-0 rounded-full border-8 border-t-[#00ff88] border-r-transparent border-b-transparent border-l-[#00ff88] animate-spin"></div>
            
            <div className="text-center">
              <span className="font-mono text-5xl font-black text-[#00ff88]">
                {formatTime(restLeft)}
              </span>
              <p className="text-xs text-[#b9cbb9] font-mono mt-1">Segundos</p>
            </div>
          </div>

          <div className="space-y-1 max-w-sm mb-8">
            <p className="font-display font-extrabold text-[#f1ffef] text-base truncate">
              Próximo: {currentExercise.name}
            </p>
            <p className="text-xs text-[#b9cbb9]">
              Serie {currentSeriesIdx === currentExercise.series ? currentSeriesIdx : currentSeriesIdx + 1} de {currentExercise.series} • {weightKg}kg • {currentExercise.reps} reps
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button 
              onClick={() => setRestLeft(prev => prev + 15)}
              className="bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl text-xs font-mono uppercase font-bold transition-all border border-white/10"
            >
              +15 Segundos
            </button>
            <button 
              onClick={handleSkipRest}
              className="bg-[#00ff88] hover:bg-[#00e479] text-black py-4 rounded-xl text-sm font-display font-extrabold uppercase tracking-wide transition-all shadow-lg active:scale-95"
            >
              Saltar descanso
            </button>
          </div>
        </div>
      )}

      {/* Top Banner Details */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <span className="text-xs text-[#00ff88] font-mono font-black uppercase tracking-widest">EN SESIÓN ACTIVA</span>
          <h2 className="font-display text-lg font-black text-white">{routine.name}</h2>
        </div>
        
        {/* Rapid testing trigger */}
        <button 
          onClick={() => setFastMode(!fastMode)}
          className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold border transition-all ${
            fastMode 
              ? 'bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/30' 
              : 'bg-white/5 text-[#b9cbb9] border-white/10 hover:border-white/20'
          }`}
          title="Reduce el tiempo de descanso a 5s para pruebas rápidas"
        >
          <Zap className="w-3.5 h-3.5 inline mr-1" />
          <span>Descanso rápido {fastMode ? 'Activo' : 'Inactivo'}</span>
        </button>
      </div>

      {/* Session progress bar indicator */}
      <section className="space-y-1.5">
        <div className="flex justify-between text-xs font-mono font-bold text-[#b9cbb9]">
          <span>Progreso de Sesión</span>
          <span>{progressPercent}% completado</span>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
          <div 
            style={{ width: `${progressPercent}%` }}
            className="h-full bg-gradient-to-r from-[#0066ff] to-[#00ff88] neon-shadow-primary rounded-full transition-all duration-300"
          />
        </div>
      </section>

      {/* Media & Biometrics visualization block */}
      <section className="glass-card rounded-[24px] p-2 border-white/10 overflow-hidden relative shadow-2xl">
        <div className="aspect-video w-full rounded-[18px] overflow-hidden relative bg-black/50">
          <img 
            className="w-full h-full object-cover" 
            alt={currentExercise.name} 
            src={currentExercise.demoImageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGDYlM5hF7Nt0d8x1WPzKQ0K21dyKWoAGUm21THi928ewVrQ-Fia1PnS05mXqCN0o5bX--9gmLEM3ekPqrdFbHl_QjUmMOiIEU2ajKrVOD5tV_gxq1Obhazig4AcAwonZ05gXb9up7EpEN04zPYjgAQrDe2d2hliMDMWMeafabOP3LYI7A6D497Pzg9-rcgSPr3uIPVrmUoaH-_9kLAheOdBBNiUb6vcBMg77QCuELkVCdFz8FtXc'}
            referrerPolicy="no-referrer"
          />
          {/* Active biometric tracker overlay */}
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm border border-[#00ff88]/20 rounded-xl px-3 py-1.5 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
            <span className="font-mono text-[10px] text-white">142 BPM</span>
          </div>

          {/* Time elapsed clock overlay */}
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-1.5 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#00ff88]" />
            <span className="font-mono text-[10px] text-white font-bold">{formatTime(elapsedSeconds)}</span>
          </div>
        </div>
      </section>

      {/* Target exercise parameters metrics */}
      <section className="glass-card rounded-2xl p-5 space-y-4">
        <div className="text-center space-y-1">
          <h3 className="font-display font-extrabold text-xl text-[#f1ffef] leading-tight">
            {currentExercise.name}
          </h3>
          <p className="text-xs text-[#00ff88] font-mono font-bold uppercase tracking-widest">
            Serie {currentSeriesIdx} de {currentExercise.series} • Reps: {currentExercise.reps}
          </p>
        </div>

        {/* Adjust weight parameters interactive on-the-fly */}
        <div className="bg-[#141e16] rounded-xl p-4 flex items-center justify-between border border-white/5">
          <button 
            onClick={() => setWeightKg(prev => Math.max(0, prev - 2.5))}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-[#dee1f7] active:scale-90 transition-all cursor-pointer"
          >
            <Minus className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <span className="font-mono text-3xl font-black text-white">{weightKg}</span>
            <span className="text-xs font-bold text-[#b9cbb9] font-mono ml-1">KG</span>
            <p className="text-[10px] text-[#b9cbb9]/60 font-medium">Ajustar peso de serie</p>
          </div>

          <button 
            onClick={() => setWeightKg(prev => prev + 2.5)}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-[#dee1f7] active:scale-90 transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions detail toggle */}
        <div className="text-center">
          <p className="text-xs text-[#b9cbb9] leading-relaxed max-w-sm mx-auto">
            "{currentExercise.description}"
          </p>
        </div>
      </section>

      {/* Session navigation and Complete exercise controls */}
      <section className="flex items-center justify-between gap-4 pt-4">
        {/* Previous button */}
        <button 
          onClick={handlePrevExercise}
          disabled={currentExerciseIdx === 0}
          className="w-12 h-12 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-white cursor-pointer active:scale-90 transition-all disabled:opacity-20 disabled:pointer-events-none"
        >
          <SkipBack className="w-5 h-5" />
        </button>

        {/* Big Middle button: Complete set (Rest) */}
        <button 
          onClick={handleCompleteSeries}
          className="flex-grow h-14 bg-[#00ff88] hover:bg-[#00e479] text-black font-display font-black uppercase text-sm rounded-full shadow-[0_0_20px_rgba(0,255,136,0.3)] hover:scale-[1.01] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Check className="w-5 h-5 stroke-[3]" />
          <span>Completar serie {currentSeriesIdx}/{currentExercise.series}</span>
        </button>

        {/* Next button */}
        <button 
          onClick={handleNextExercise}
          className="w-12 h-12 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-white cursor-pointer active:scale-90 transition-all"
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </section>

      {/* Secondary Finish Routine Button */}
      <div className="pt-6 border-t border-white/5 flex gap-3">
        <button 
          onClick={() => {
            if (confirm('¿Seguro que deseas salir del entrenamiento actual? Se perderá el progreso de esta sesión.')) {
              onCancelWorkout();
            }
          }}
          className="flex-1 py-3.5 border border-red-500/30 hover:bg-red-500/10 text-red-400 font-bold rounded-xl text-xs font-mono uppercase transition-colors"
        >
          Finalizar sesión
        </button>
      </div>

    </div>
  );
}
