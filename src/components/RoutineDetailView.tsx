import { Dumbbell, ArrowLeft, Clock, Flame, ShieldAlert, Award, Layers, Play, Info } from 'lucide-react';
import { Routine } from '../types';

interface RoutineDetailViewProps {
  routine: Routine;
  onBack: () => void;
  onStartTraining: (routineId: string) => void;
}

export default function RoutineDetailView({ routine, onBack, onStartTraining }: RoutineDetailViewProps) {
  
  const getRoutineImage = (id: string) => {
    if (id.includes('pecho')) {
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-2qfdkPJoZ3J-lJsVH3Mokwqsx8JmMhOrwWBXsiHkmrSuUZ2D_VUS2GN1LmdUFqFpH-SWYYit6k5WTfFRfraYpXcnNuaNN_3dIO9mYfB-5YsrSVgG_3xmxYb7lKJCxZL8SeX92dx1JChKMDandfBRTO08HgSPmJa8n3gtOjJW3psHydR1QWflYjH0N3iSaGPMKDTCg3hjmNdoQ1N6qKsdYqkRymOzUaKMe1JjdBV6flNcS8eFNcg';
    } else if (id.includes('cardio')) {
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYW3h5ioeNGVpCq_LxGxIuqh6XLAxoWs-STbs6XdMmIdu7BtZSAAaWza2dqch1MKCHXNE1tFnhxU4gywvYsdSf-XI1sJfObmmC3HV9crxEzONo7fcYlXi5HF2uc7o5t-yYgB0EfEMvspzlw6BKYuaA4-hpDnuheK1yfuyzBWHdbcZcjZaSUFUSeMxrhSYo8FSvd9fBV8iNMYoD13L1g2yGv10lt1lw1dPckSVaqIRdPeqcJtvpn3k';
    } else if (id.includes('fuerza')) {
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8kII0g4lrev5wR2d8tN7-iIm9L_fYKp7bW62ioYRAVQVc7NtfRMsVaWVklsAERpSpDrqht6jlaZERGGf0NJ-6xMRAqAQLub8laFiVNCvaX4VCOWE_K-A3WVugJHJJ8PFnS1WQoeZZDCEuutFucr8OBX_aJ9_MURrxK1VprNKvO1cc8VWgIPifg22QIU4I7VBI3LCaeyQq8C0rCy6SMVcYfPo_FLoUNcRtBMjSkqSLZ4Fu94LCY74';
    } else if (id.includes('back')) {
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8kII0g4lrev5wR2d8tN7-iIm9L_fYKp7bW62ioYRAVQVc7NtfRMsVaWVklsAERpSpDrqht6jlaZERGGf0NJ-6xMRAqAQLub8laFiVNCvaX4VCOWE_K-A3WVugJHJJ8PFnS1WQoeZZDCEuutFucr8OBX_aJ9_MURrxK1VprNKvO1cc8VWgIPifg22QIU4I7VBI3LCaeyQq8C0rCy6SMVcYfPo_FLoUNcRtBMjSkqSLZ4Fu94LCY74';
    } else if (id.includes('leg')) {
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuAiEv3jshKQmM8dDkFcCRTP--9IueG8DelvzaVf4ruRwvPqbIxafJKSpLi1jQP5uPtOLzlYrHS-QDpeD2vUN2lHhFUWQdqBABgQ4pnV3qzg64LLhFUWQdqBABgQ4pnV3qzg64LLhVgDCyZf0mvXEAy54SzqibaPC4_w5QWgMUb3_JkyI3nvQWam4BgvD0KKzHPrHJvYvJbx9eYRNj_kP8LbYCtuWD_ARWRFX9Fc4VFrSwb_5qD6-vfthuZMUArDemO7nXECGrfbzKw';
    }
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8kII0g4lrev5wR2d8tN7-iIm9L_fYKp7bW62ioYRAVQVc7NtfRMsVaWVklsAERpSpDrqht6jlaZERGGf0NJ-6xMRAqAQLub8laFiVNCvaX4VCOWE_K-A3WVugJHJJ8PFnS1WQoeZZDCEuutFucr8OBX_aJ9_MURrxK1VprNKvO1cc8VWgIPifg22QIU4I7VBI3LCaeyQq8C0rCy6SMVcYfPo_FLoUNcRtBMjSkqSLZ4Fu94LCY74';
  };

  return (
    <div className="relative pb-32 animate-fade-in">
      {/* Header back button */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center glass-card hover:bg-white/10 active:scale-90 transition-all cursor-pointer border-white/10"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div>
          <span className="text-xs text-[#00ff88] font-mono font-black uppercase tracking-widest">Atrás</span>
          <h2 className="font-display text-lg font-extrabold text-white tracking-tight">Detalles de Rutina</h2>
        </div>
      </div>

      {/* Routine Info Header */}
      <section className="space-y-4 mb-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#00ff88]/10 text-[#00ff88] font-mono text-[10px] uppercase font-black tracking-wider border border-[#00ff88]/20">
            {routine.tag}
          </span>
          <span className="px-3 py-1 rounded-full bg-[#0266ff]/10 text-[#b3c5ff] font-mono text-[10px] uppercase font-black tracking-wider border border-[#0266ff]/20">
            {routine.difficulty}
          </span>
        </div>

        <h1 className="font-display text-2xl md:text-4xl font-extrabold text-[#f1ffef] leading-tight">
          {routine.name}
        </h1>

        <p className="text-sm text-[#b9cbb9] leading-relaxed max-w-2xl">
          {routine.description}
        </p>

        {/* Info stats bar */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-[#b9cbb9] font-mono">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#00ff88]" />
            <span>{routine.durationMinutes} min</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-[#ff6b00]" />
            <span>{routine.caloriesKcal || 350} kcal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#0266ff]" />
            <span>{routine.exercises.length} ejercicios</span>
          </div>
        </div>
      </section>

      {/* Exercise Card List */}
      <section className="space-y-4">
        <h3 className="font-display text-base font-bold text-white uppercase tracking-wider mb-2">
          Estructura de Ejercicios
        </h3>

        <div className="space-y-4">
          {routine.exercises.map((exercise, index) => (
            <div 
              key={exercise.id}
              className="glass-card rounded-xl p-4 flex flex-col md:flex-row gap-5 hover:border-[#00ff88]/40 transition-all duration-300 group border-white/10"
            >
              {/* Exercise demo visual */}
              <div className="w-full md:w-36 h-36 rounded-lg overflow-hidden shrink-0 border border-white/5 relative bg-black/40">
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  alt={exercise.name} 
                  src={exercise.demoImageUrl || getRoutineImage(routine.id)}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[9px] font-bold text-[#00ff88] uppercase tracking-wider">
                  DEMO
                </div>
                <div className="absolute top-2 left-2 bg-black/75 px-1.5 py-0.5 rounded-full w-5 h-5 flex items-center justify-center font-mono text-[10px] font-bold text-[#00ff88]">
                  {index + 1}
                </div>
              </div>

              {/* Exercise description & bento matrix parameters */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-display font-black text-base text-[#f1ffef] group-hover:text-[#00ff88] transition-colors leading-tight">
                      {exercise.name}
                    </h4>
                    <button className="text-[#b9cbb9] hover:text-[#00ff88] transition-colors shrink-0">
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-[#b9cbb9] mt-1 leading-relaxed">
                    {exercise.description}
                  </p>
                </div>

                {/* Bento metrics inside exercise card */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="bg-[#141e16] p-2 rounded-lg border border-white/5 text-center">
                    <p className="text-[9px] text-[#b9cbb9] font-mono font-semibold uppercase">Series</p>
                    <p className="font-mono text-base font-extrabold text-[#00ff88] leading-tight mt-0.5">
                      {exercise.series}
                    </p>
                  </div>
                  <div className="bg-[#141e16] p-2 rounded-lg border border-white/5 text-center">
                    <p className="text-[9px] text-[#b9cbb9] font-mono font-semibold uppercase">Reps</p>
                    <p className="font-mono text-base font-extrabold text-[#00ff88] leading-tight mt-0.5">
                      {exercise.reps}
                    </p>
                  </div>
                  <div className="bg-[#141e16] p-2 rounded-lg border border-white/5 text-center">
                    <p className="text-[9px] text-[#b9cbb9] font-mono font-semibold uppercase">Descanso</p>
                    <p className="font-mono text-base font-extrabold text-[#00ff88] leading-tight mt-0.5">
                      {exercise.restSeconds}s
                    </p>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* Floating Action Button "Iniciar Entrenamiento" */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-40">
        <button 
          onClick={() => onStartTraining(routine.id)}
          className="w-full h-14 bg-[#00ff88] hover:bg-[#00e479] text-black font-display font-black text-base rounded-full shadow-[0_0_25px_rgba(0,255,136,0.4)] hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer"
        >
          <Play className="w-5 h-5 fill-black group-hover:scale-110 transition-transform" />
          <span>Iniciar entrenamiento</span>
        </button>
      </div>

    </div>
  );
}
