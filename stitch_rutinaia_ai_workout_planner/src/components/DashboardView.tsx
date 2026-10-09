import { Dumbbell, Zap, Flame, CheckCircle, Clock, PlayCircle, BarChart3, TrendingUp, Settings } from 'lucide-react';
import { UserProfile, Routine, StatsHistory } from '../types';

interface DashboardViewProps {
  profile: UserProfile;
  routines: Routine[];
  stats: StatsHistory;
  onSelectRoutine: (routineId: string) => void;
  onTriggerGenerate: () => void;
  onChangeTab: (tab: 'dashboard' | 'routines' | 'stats' | 'profile') => void;
}

export default function DashboardView({
  profile,
  routines,
  stats,
  onSelectRoutine,
  onTriggerGenerate,
  onChangeTab
}: DashboardViewProps) {
  
  // Find images for default routines or fallbacks
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
    // Default fallback (beautiful kettlebell)
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8kII0g4lrev5wR2d8tN7-iIm9L_fYKp7bW62ioYRAVQVc7NtfRMsVaWVklsAERpSpDrqht6jlaZERGGf0NJ-6xMRAqAQLub8laFiVNCvaX4VCOWE_K-A3WVugJHJJ8PFnS1WQoeZZDCEuutFucr8OBX_aJ9_MURrxK1VprNKvO1cc8VWgIPifg22QIU4I7VBI3LCaeyQq8C0rCy6SMVcYfPo_FLoUNcRtBMjSkqSLZ4Fu94LCY74';
  };

  const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <div className="space-y-6">
      {/* Welcome Banner Card */}
      <section className="glass-card rounded-[24px] p-6 relative overflow-hidden flex flex-col justify-between min-h-[160px]">
        {/* Glow */}
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#00ff88]/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 space-y-2">
          <h2 className="font-display text-2xl md:text-3xl font-extrabold text-[#f1ffef] leading-tight">
            ¡Hola, {profile.name}!
          </h2>
          <p className="text-[#b9cbb9] text-sm md:text-base max-w-[280px] md:max-w-md leading-relaxed">
            Es hora de superar tus límites. Tu rutina personalizada de alto rendimiento está lista para ser iniciada.
          </p>
        </div>
      </section>

      {/* Main AI CTA Banner */}
      <section>
        <button 
          onClick={onTriggerGenerate}
          className="w-full relative group transition-transform active:scale-[0.98] duration-200 cursor-pointer text-left block"
        >
          {/* Neon back blur */}
          <div className="absolute inset-0 bg-[#00ff88] rounded-2xl neon-shadow-primary blur-sm group-hover:neon-shadow-strong transition-all duration-300"></div>
          
          <div className="relative flex items-center justify-between bg-[#00ff88] text-black p-5 md:p-6 rounded-2xl">
            <div className="space-y-1">
              <span className="font-mono text-[10px] uppercase tracking-widest font-black opacity-80 block">
                IA de Alto Rendimiento
              </span>
              <h3 className="font-display text-lg md:text-2xl font-black leading-tight">
                Generar nueva rutina
              </h3>
            </div>
            <div className="bg-black/10 p-3.5 rounded-full">
              <Zap className="w-8 h-8 text-black fill-black" />
            </div>
          </div>
        </button>
      </section>

      {/* Stats Bento Grid */}
      <section className="grid grid-cols-3 gap-4">
        {/* Workouts completed */}
        <div className="glass-card rounded-2xl p-4 flex flex-col justify-between aspect-square">
          <div className="flex justify-between items-start">
            <CheckCircle className="text-[#b3c5ff] w-5 h-5 shrink-0" />
            <span className="text-[10px] font-mono font-bold text-[#b9cbb9] bg-white/5 px-2 py-0.5 rounded-full shrink-0">
              +12%
            </span>
          </div>
          <div>
            <p className="font-mono text-2xl md:text-3xl font-extrabold text-white leading-none">
              {stats.totalWorkoutsCompleted}
            </p>
            <p className="text-[10px] text-[#b9cbb9] font-medium leading-tight mt-1">
              Rutinas completadas
            </p>
          </div>
        </div>

        {/* Streak days */}
        <div className="glass-card rounded-2xl p-4 flex flex-col justify-between aspect-square">
          <div className="flex justify-between items-start">
            <Flame className="text-[#00ff88] w-5 h-5 shrink-0 fill-[#00ff88]/20" />
            <span className="text-[10px] font-mono font-bold text-[#00ff88] bg-[#00ff88]/5 px-2 py-0.5 rounded-full shrink-0 animate-pulse">
              FUEGO
            </span>
          </div>
          <div>
            <p className="font-mono text-2xl md:text-3xl font-extrabold text-[#00ff88] leading-none">
              {stats.streakDays}
            </p>
            <p className="text-[10px] text-[#b9cbb9] font-medium leading-tight mt-1">
              Racha actual (días)
            </p>
          </div>
        </div>

        {/* Total minutes */}
        <div className="glass-card rounded-2xl p-4 flex flex-col justify-between aspect-square">
          <div className="flex justify-between items-start">
            <Clock className="text-[#ffdb79] w-5 h-5 shrink-0" />
          </div>
          <div>
            <p className="font-mono text-2xl md:text-3xl font-extrabold text-white leading-none">
              {stats.totalMinutes}
            </p>
            <p className="text-[10px] text-[#b9cbb9] font-medium leading-tight mt-1">
              Minutos entrenados
            </p>
          </div>
        </div>
      </section>

      {/* Recent Routines List */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <h4 className="font-display text-lg font-bold text-white tracking-tight">
            Rutinas recomendadas
          </h4>
          <button 
            onClick={() => onChangeTab('routines')}
            className="text-[#00ff88] text-xs font-semibold hover:underline cursor-pointer"
          >
            Ver todas
          </button>
        </div>

        <div className="space-y-3">
          {routines.slice(0, 3).map((routine) => (
            <div 
              key={routine.id}
              onClick={() => onSelectRoutine(routine.id)}
              className="glass-card p-3 rounded-xl flex items-center gap-4 group hover:bg-white/5 cursor-pointer transition-all duration-300 border-white/5 hover:border-[#00ff88]/30"
            >
              <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-white/10 relative">
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  alt={routine.name} 
                  src={getRoutineImage(routine.id)}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-1 left-1 bg-black/60 px-1 py-0.5 rounded text-[8px] font-mono text-white">
                  {routine.tag}
                </div>
              </div>
              
              <div className="flex-grow min-w-0">
                <h5 className="font-display font-bold text-sm text-[#f1ffef] truncate group-hover:text-[#00ff88] transition-colors">
                  {routine.name}
                </h5>
                <p className="text-xs text-[#b9cbb9] mt-0.5 flex items-center gap-1.5 font-mono">
                  <span>{routine.durationMinutes} min</span>
                  <span>•</span>
                  <span>{routine.exercises.length} ejercicios</span>
                </p>
              </div>

              <PlayCircle className="w-6 h-6 text-[#b9cbb9] group-hover:text-[#00ff88] group-hover:scale-110 transition-all duration-200 shrink-0" />
            </div>
          ))}
        </div>
      </section>

      {/* Weekly Progress bar visualization */}
      <section className="glass-card rounded-[24px] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-display font-bold text-sm text-white">Rendimiento semanal</p>
          <span className="text-[10px] font-mono text-[#00ff88] bg-[#00ff88]/5 px-2 py-0.5 rounded-full flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Consistencia activa</span>
          </span>
        </div>

        <div className="flex items-end justify-between gap-2 h-20 pt-2 px-1">
          {stats.weeklyProgress.map((val, idx) => {
            const isHighest = val === Math.max(...stats.weeklyProgress) && val > 0;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full relative h-16 flex items-end">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-[#00ff88] text-[9px] font-mono py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {val}% int
                  </div>
                  <div 
                    style={{ height: `${val || 10}%` }}
                    className={`w-full rounded-t-md transition-all duration-500 ${
                      isHighest 
                        ? 'bg-[#00ff88] neon-shadow-primary' 
                        : 'bg-[#00ff88]/20 group-hover:bg-[#00ff88]/40'
                    }`}
                  />
                </div>
                <span className="text-[10px] font-mono text-[#b9cbb9]/70 font-semibold uppercase">
                  {daysOfWeek[idx]}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
