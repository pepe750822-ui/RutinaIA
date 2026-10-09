import { Dumbbell, Sparkles, Brain, Apple, TrendingUp, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (screen: 'landing' | 'login' | 'onboarding' | 'dashboard') => void;
  onEnterDemo: () => void;
}

export default function LandingPage({ onNavigate, onEnterDemo }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-[#dee1f7] relative overflow-hidden font-body pb-12">
      {/* Glow circles */}
      <div className="absolute top-1/4 -right-20 w-80 h-80 bg-[#00ff88]/10 blur-[120px] rounded-full -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-[#0066ff]/10 blur-[120px] rounded-full -z-10 animate-pulse"></div>

      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 h-16 bg-[#0a0f1e]/80 backdrop-blur-xl border-b border-white/10 flex justify-between items-center px-6 md:px-12 shadow-[0_0_15px_rgba(0,255,136,0.1)]">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('landing')}>
          <Dumbbell className="text-[#00ff88] w-7 h-7" />
          <span className="font-display text-2xl font-extrabold text-[#00ff88] tracking-tighter">RutinaIA</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigate('login')}
            className="bg-[#00ff88] hover:bg-[#00e479] text-black px-5 py-2 rounded-xl font-display font-bold text-sm transition-all duration-300 neon-shadow-primary active:scale-95"
          >
            Iniciar sesión
          </button>
        </div>
      </header>

      {/* Main Hero */}
      <main className="pt-28 px-4 md:px-12 max-w-6xl mx-auto flex flex-col items-center">
        <section className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 bg-[#00ff88]/10 border border-[#00ff88]/20 px-4 py-1.5 rounded-full text-[#00ff88] mb-2 animate-bounce">
            <Sparkles className="w-4 h-4 text-[#00ff88]" />
            <span className="font-mono text-xs font-semibold uppercase tracking-widest">Impulsado por Inteligencia Artificial</span>
          </div>
          
          <h1 className="font-display text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Tu entrenador <span className="text-[#00ff88]">IA</span> personal
          </h1>
          
          <p className="font-body text-base md:text-lg text-[#b9cbb9] max-w-2xl mx-auto leading-relaxed">
            Algoritmos de vanguardia que diseñan rutinas de entrenamiento adaptativas basadas en tu biometría, objetivos y progreso en tiempo real. Entrena como un profesional de alto rendimiento.
          </p>

          <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => onNavigate('onboarding')}
              className="w-full sm:w-auto bg-[#00ff88] hover:bg-[#00e479] text-black px-8 py-4 rounded-xl font-display font-extrabold uppercase tracking-wide transition-all duration-300 neon-shadow-strong active:scale-95"
            >
              Comenzar gratis
            </button>
            <button 
              onClick={onEnterDemo}
              className="w-full sm:w-auto border-2 border-[#00ff88]/30 hover:border-[#00ff88] text-[#00ff88] backdrop-blur-sm px-8 py-4 rounded-xl font-display font-bold hover:bg-[#00ff88]/10 transition-all active:scale-95"
            >
              Ver Demo Rápida
            </button>
          </div>
        </section>

        {/* Hero image mockup */}
        <section className="mt-16 w-full max-w-4xl rounded-2xl overflow-hidden glass-card p-2 shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e] via-transparent to-transparent z-10 pointer-events-none"></div>
          <div className="aspect-video w-full rounded-xl overflow-hidden relative">
            <img 
              className="w-full h-full object-cover" 
              alt="Futuristic fitness dashboard mockup" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBks2y7sAOGKXi5tg6ar9yDalk3XfhclIFUKMq_ttxZG5GufUtxLGb2E_mcjQEeAynjxNn-6fEIeKSDbwNeGVgrLtXcBKo_TXDXWnJH6ttjik6tf5skyRZDL6276UctDgqMa6LWvqdFy-G84brRS28vGsL-QiMrD9Q_crt2AUCDhaJdUWDt9UoevGnudQoLGmn-rZ8XF1vUc9Z13e5YpQl-2VJgc8rRtWDbKeZjCXgzSIAhiid5w_c"
              referrerPolicy="no-referrer"
            />
          </div>
        </section>

        {/* Features list */}
        <section className="py-20 w-full" id="features">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white">
              Diseñado para el <span className="text-[#00ff88]">Rendimiento</span>
            </h2>
            <p className="text-[#b9cbb9] font-body mt-3">Tecnología de última generación al servicio de tu cuerpo.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-6 rounded-2xl flex flex-col gap-4 hover:border-[#00ff88]/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#00ff88]/10 flex items-center justify-center text-[#00ff88]">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-white group-hover:text-[#00ff88] transition-colors">Algoritmo Adaptativo</h3>
              <p className="text-[#b9cbb9] text-sm leading-relaxed">
                Rutinas inteligentes que evolucionan contigo. RutinaIA analiza tu fatiga y rendimiento anterior para recalcular la carga óptima para tu próxima sesión.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl flex flex-col gap-4 hover:border-[#00ff88]/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#00ff88]/10 flex items-center justify-center text-[#00ff88]">
                <Apple className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-white group-hover:text-[#00ff88] transition-colors">Nutrición Inteligente</h3>
              <p className="text-[#b9cbb9] text-sm leading-relaxed">
                Planes nutricionales sincronizados con tu gasto calórico real medido. Recetas balanceadas optimizadas para ganar músculo magro o quema de grasa.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl flex flex-col gap-4 hover:border-[#00ff88]/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#00ff88]/10 flex items-center justify-center text-[#00ff88]">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-white group-hover:text-[#00ff88] transition-colors">Métricas en Vivo</h3>
              <p className="text-[#b9cbb9] text-sm leading-relaxed">
                Visualiza tus históricos con gráficos interactivos avanzados. Monitorea tu volumen, consistencia semanal, racha de días y récords personales (PRs).
              </p>
            </div>
          </div>
        </section>

        {/* Pricing tier */}
        <section className="py-12 w-full max-w-4xl" id="pricing">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-extrabold text-white">
              Elige tu <span className="text-[#00ff88]">Nivel</span>
            </h2>
            <p className="text-[#b9cbb9] font-body mt-2">Sin contratos de permanencia, cancela cuando quieras.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Esencial Free */}
            <div className="glass-card p-8 rounded-2xl flex flex-col justify-between border-white/5 hover:border-white/20 transition-all">
              <div className="space-y-4">
                <span className="font-mono text-xs text-[#b9cbb9] uppercase tracking-widest block">Esencial</span>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-4xl font-extrabold text-white">$0</span>
                  <span className="text-[#b9cbb9] text-sm">/siempre</span>
                </div>
                <hr className="border-white/10" />
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-[#dee1f7]">
                    <CheckCircle2 className="w-5 h-5 text-[#00ff88] shrink-0" />
                    <span>Rutinas base semanales</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-[#dee1f7]">
                    <CheckCircle2 className="w-5 h-5 text-[#00ff88] shrink-0" />
                    <span>Registro manual de ejercicios</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-white/40">
                    <XCircle className="w-5 h-5 text-white/20 shrink-0" />
                    <span>IA Adaptativa personalizada</span>
                  </li>
                </ul>
              </div>
              <button 
                onClick={() => onNavigate('onboarding')}
                className="w-full mt-8 border border-white/20 hover:border-white/40 text-white hover:bg-white/5 py-3 rounded-xl font-display font-bold text-sm transition-colors"
              >
                Empezar gratis
              </button>
            </div>

            {/* Atleta Pro Premium */}
            <div className="glass-card p-8 rounded-2xl flex flex-col justify-between border-[#00ff88]/30 relative neon-shadow-primary hover:border-[#00ff88]/50 transition-all">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#00ff88] text-black px-4 py-1 rounded-full font-display font-black text-xs uppercase tracking-wider">
                RECOMENDADO
              </div>
              <div className="space-y-4">
                <span className="font-mono text-xs text-[#00ff88] uppercase tracking-widest block">Atleta Pro</span>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-4xl font-extrabold text-white">$99</span>
                  <span className="text-[#b9cbb9] text-sm">/mes</span>
                </div>
                <hr className="border-white/10" />
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-white">
                    <ShieldCheck className="w-5 h-5 text-[#00ff88] shrink-0 animate-pulse" />
                    <span>IA Adaptativa en tiempo real</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-white">
                    <ShieldCheck className="w-5 h-5 text-[#00ff88] shrink-0" />
                    <span>Planes nutricionales dinámicos</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-white">
                    <ShieldCheck className="w-5 h-5 text-[#00ff88] shrink-0" />
                    <span>Soporte prioritario 24/7 con entrenadores</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-white">
                    <ShieldCheck className="w-5 h-5 text-[#00ff88] shrink-0" />
                    <span>Análisis biomecánico por video AI</span>
                  </li>
                </ul>
              </div>
              <button 
                onClick={() => onNavigate('onboarding')}
                className="w-full mt-8 bg-[#00ff88] hover:bg-[#00e479] text-black py-3 rounded-xl font-display font-bold text-sm transition-colors shadow-lg active:scale-95"
              >
                Suscribirme ahora
              </button>
            </div>
          </div>
        </section>

        {/* Final call to action */}
        <section className="py-20 w-full text-center">
          <div className="glass-card p-10 rounded-3xl space-y-6 border-[#00ff88]/20 max-w-3xl mx-auto neon-shadow-primary">
            <h2 className="font-display text-3xl font-extrabold text-white">¿Listo para transformar tu cuerpo?</h2>
            <p className="text-[#b9cbb9] font-body max-w-md mx-auto">
              Únete a más de 50,000 atletas que ya están usando RutinaIA para superar sus límites genéticos.
            </p>
            <div className="flex justify-center pt-2">
              <button 
                onClick={() => onNavigate('onboarding')}
                className="bg-[#00ff88] hover:bg-[#00e479] text-black px-8 py-4 rounded-xl font-display font-extrabold uppercase tracking-wider active:scale-95 transition-all duration-300 shadow-xl"
              >
                Crear mi cuenta gratis
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 pt-8 mt-12 px-6 md:px-12 max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#b9cbb9]/60">
        <div className="flex items-center gap-2">
          <Dumbbell className="text-[#00ff88] w-5 h-5" />
          <span className="font-display text-sm font-extrabold text-[#00ff88]">RutinaIA</span>
          <span>© 2026. Engineered for ultimate athletic performance.</span>
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Privacidad</a>
          <a href="#" className="hover:text-white transition-colors">Términos</a>
          <a href="#" className="hover:text-white transition-colors">Soporte</a>
        </div>
      </footer>
    </div>
  );
}
