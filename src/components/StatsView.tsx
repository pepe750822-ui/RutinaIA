import { BarChart3, TrendingUp, Flame, Calendar, Award, Target, HelpCircle } from 'lucide-react';
import { StatsHistory } from '../types';

interface StatsViewProps {
  stats: StatsHistory;
}

export default function StatsView({ stats }: StatsViewProps) {
  const muscleGroups = [
    { name: 'Pectorales', percent: 85, color: 'bg-[#00ff88]', border: 'border-[#00ff88]/20' },
    { name: 'Espalda', percent: 70, color: 'bg-[#0066ff]', border: 'border-[#0066ff]/20' },
    { name: 'Tren Inferior (Cuádriceps/Femorales)', percent: 60, color: 'bg-[#ffda79]', border: 'border-[#ffda79]/20' },
    { name: 'Core / Abdomen', percent: 50, color: 'bg-[#ff6b00]', border: 'border-[#ff6b00]/20' },
    { name: 'Hombros & Brazos', percent: 40, color: 'bg-purple-500', border: 'border-purple-500/20' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <span className="text-xs text-[#00ff88] font-mono font-black uppercase tracking-widest">MÉTRICAS</span>
          <h2 className="font-display text-2xl font-black text-white">Tu Rendimiento</h2>
        </div>
        <div className="bg-[#00ff88]/10 border border-[#00ff88]/20 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-[#00ff88]">
          Filtro: Últimos 30 días
        </div>
      </div>

      {/* Overview Stat Rows */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4 text-center">
          <span className="text-[10px] text-[#b9cbb9] font-mono uppercase font-bold">Consistencia</span>
          <p className="font-mono text-3xl font-black text-[#00ff88] mt-1">92%</p>
          <span className="text-[9px] text-[#00ff88] font-mono">Meta: 85%</span>
        </div>

        <div className="glass-card rounded-xl p-4 text-center">
          <span className="text-[10px] text-[#b9cbb9] font-mono uppercase font-bold">Racha Actual</span>
          <p className="font-mono text-3xl font-black text-[#ff6b00] mt-1">{stats.streakDays}d</p>
          <span className="text-[9px] text-[#ff6b00] font-mono">Récord: 14d</span>
        </div>

        <div className="glass-card rounded-xl p-4 text-center">
          <span className="text-[10px] text-[#b9cbb9] font-mono uppercase font-bold">Minutos Totales</span>
          <p className="font-mono text-3xl font-black text-white mt-1">{stats.totalMinutes}</p>
          <span className="text-[9px] text-[#b9cbb9]/60 font-mono">+45 min esta sem.</span>
        </div>

        <div className="glass-card rounded-xl p-4 text-center">
          <span className="text-[10px] text-[#b9cbb9] font-mono uppercase font-bold">Sesiones Totales</span>
          <p className="font-mono text-3xl font-black text-white mt-1">{stats.totalWorkoutsCompleted}</p>
          <span className="text-[9px] text-[#b9cbb9]/60 font-mono">Último: Hoy</span>
        </div>
      </section>

      {/* Muscle Group Activation Meter (Biometrics tracking) */}
      <section className="glass-card rounded-[24px] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="text-[#00ff88] w-5 h-5" />
            <h3 className="font-display font-bold text-sm text-white">Activación Muscular</h3>
          </div>
          <span className="text-[10px] text-[#b9cbb9] font-mono">Proporción de volumen semanal</span>
        </div>

        <div className="space-y-4 pt-1">
          {muscleGroups.map((group) => (
            <div key={group.name} className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[#f1ffef]">{group.name}</span>
                <span className="text-[#b9cbb9] font-mono">{group.percent}%</span>
              </div>
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                  style={{ width: `${group.percent}%` }}
                  className={`h-full rounded-full ${group.color} transition-all duration-700`}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Historical Workout Logs list */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-base text-white">Historial de Sesiones</h3>
          <span className="text-xs text-[#00ff88] font-mono font-bold">Sincronizado</span>
        </div>

        <div className="space-y-3">
          {stats.recentLogs.map((log) => (
            <div 
              key={log.id}
              className="glass-card p-4 rounded-xl flex items-center justify-between gap-4 border-white/5"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-white/5 text-[9px] font-mono font-bold text-[#b9cbb9] uppercase">
                    {log.date}
                  </span>
                  <span className="text-[9px] font-mono text-[#00ff88] font-semibold uppercase">
                    {log.tag}
                  </span>
                </div>
                <h4 className="font-display font-bold text-sm text-[#f1ffef]">
                  {log.routineName}
                </h4>
              </div>

              <div className="text-right font-mono text-xs">
                <p className="font-bold text-white">{log.durationMinutes} min</p>
                <p className="text-[10px] text-[#ff6b00] mt-0.5">{log.caloriesKcal} kcal</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
