import { useState, FormEvent } from 'react';
import { Dumbbell, Chrome, Loader2 } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (userEmail: string, userName?: string) => void;
  onNavigateBack: () => void;
}

export default function LoginPage({ onLoginSuccess, onNavigateBack }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess('jlg.cyberdumx@gmail.com', 'José Luis');
    }, 1200);
  };

  const handleMagicLink = (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setMagicSent(true);
      setTimeout(() => {
        // Automatically proceed after simulation
        onLoginSuccess(email, email.split('@')[0]);
      }, 2000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-[#dee1f7] flex items-center justify-center p-6 relative overflow-hidden font-body">
      {/* Decorative spheres */}
      <div className="absolute top-12 left-12 w-64 h-64 bg-[#00ff88]/5 blur-[100px] rounded-full -z-10 animate-pulse"></div>
      <div className="absolute bottom-12 right-12 w-80 h-80 bg-[#0066ff]/5 blur-[100px] rounded-full -z-10 animate-pulse"></div>

      <main className="w-full max-w-[440px] z-10 space-y-6">
        {/* Back navigation option */}
        <button 
          onClick={onNavigateBack}
          className="text-xs text-[#b9cbb9] hover:text-[#00ff88] transition-colors cursor-pointer flex items-center gap-1"
        >
          ← Volver a la página de inicio
        </button>

        {/* Login Card */}
        <div className="glass-card rounded-[2rem] p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden border-white/10">
          
          {/* Logo */}
          <div className="mb-6">
            <div className="w-14 h-14 bg-[#00ff88] rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,255,136,0.4)] mx-auto">
              <Dumbbell className="text-black w-7 h-7" />
            </div>
            <h1 className="font-display text-3xl font-extrabold text-[#00ff88] tracking-tighter">
              RutinaIA
            </h1>
            <p className="text-xs text-[#b9cbb9]/80 mt-1">
              Tu entrenador personal potenciado por IA
            </p>
          </div>

          <div className="w-full space-y-6">
            <div className="space-y-1">
              <h2 className="font-display text-xl font-bold text-white">Bienvenido de nuevo</h2>
              <p className="text-xs text-[#b9cbb9]/70">Ingresa a tu ecosistema de alto rendimiento</p>
            </div>

            {/* Google Login button */}
            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-[#00ff88] hover:bg-[#00e479] text-black font-display font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 active:scale-[0.98] group relative overflow-hidden neon-shadow-primary disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Chrome className="w-5 h-5 text-black" />
              )}
              <span>{loading ? 'Conectando...' : 'Continuar con Google'}</span>
              
              {/* Shine highlight */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 w-full py-1">
              <div className="h-[1px] flex-1 bg-white/10"></div>
              <span className="font-mono text-[10px] text-[#b9cbb9]/60 uppercase tracking-widest">O accede con</span>
              <div className="h-[1px] flex-1 bg-white/10"></div>
            </div>

            {/* Magic Link Form */}
            {magicSent ? (
              <div className="bg-[#00ff88]/10 border border-[#00ff88]/20 rounded-xl p-4 text-left space-y-2 animate-pulse">
                <p className="text-[#00ff88] text-sm font-semibold">¡Enlace de acceso enviado!</p>
                <p className="text-xs text-[#b9cbb9]">Hemos enviado un enlace mágico a su bandeja de entrada. Iniciando sesión automáticamente...</p>
              </div>
            ) : (
              <form onSubmit={handleMagicLink} className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-xs text-[#b9cbb9]/80 font-semibold ml-1">Email</label>
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] transition-all text-sm"
                    placeholder="nombre@ejemplo.com"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={loading || !email}
                  className="w-full border-2 border-[#00ff88]/30 hover:border-[#00ff88] text-[#00ff88] font-bold py-3 rounded-xl transition-all duration-300 bg-transparent hover:bg-[#00ff88]/5 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Recibir enlace mágico</span>
                </button>
              </form>
            )}
          </div>

          {/* Legal micro-footer */}
          <div className="mt-8 pt-4 border-t border-white/5 w-full flex flex-col gap-2">
            <p className="text-[10px] text-[#b9cbb9]/50 leading-relaxed">
              Al continuar, aceptas nuestros 
              <a className="text-[#00ff88] hover:underline mx-1" href="#">Términos de Servicio</a> y 
              <a className="text-[#00ff88] hover:underline" href="#">Política de Privacidad</a>.
            </p>
            <div className="flex justify-center gap-4 text-xs text-[#b9cbb9]/70 pt-1">
              <a className="hover:text-[#00ff88] transition-colors" href="#">¿Necesitas ayuda?</a>
              <span className="opacity-30">|</span>
              <a className="hover:text-[#00ff88] transition-colors cursor-pointer" onClick={() => onNavigateBack()}>Crear cuenta</a>
            </div>
          </div>
        </div>

        {/* Flashing Online Badge */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00ff88] animate-pulse shadow-[0_0_8px_#00ff88]"></div>
          <span className="font-mono text-[10px] text-[#b9cbb9]/60 uppercase tracking-[0.2em]">IA Engine Online</span>
        </div>
      </main>

      {/* Global minimal footer */}
      <footer className="fixed bottom-0 left-0 w-full py-4 px-6 flex flex-col sm:flex-row justify-between items-center gap-2 opacity-40 hover:opacity-100 transition-opacity text-[10px] text-[#b9cbb9]">
        <span>© 2026 RutinaIA. Engineered for elite athletic performance.</span>
        <div className="flex gap-4">
          <a className="hover:text-[#00ff88] transition-colors" href="#">Privacy</a>
          <a className="hover:text-[#00ff88] transition-colors" href="#">Terms</a>
          <a className="hover:text-[#00ff88] transition-colors" href="#">Support</a>
        </div>
      </footer>
    </div>
  );
}
