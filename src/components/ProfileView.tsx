import { useState, FormEvent } from 'react';
import { UserCircle, Shield, Dumbbell, Award, HelpCircle, Save, Loader2, LogOut, Heart } from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileViewProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onLogout: () => void;
}

export default function ProfileView({ profile, onUpdateProfile, onLogout }: ProfileViewProps) {
  const [name, setName] = useState(profile.name);
  const [weight, setWeight] = useState(profile.weightKg);
  const [height, setHeight] = useState(profile.heightCm);
  const [age, setAge] = useState(profile.age);
  const [fitnessLevel, setFitnessLevel] = useState(profile.fitnessLevel);
  const [objective, setObjective] = useState(profile.objective);
  const [environment, setEnvironment] = useState(profile.workoutEnvironment);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSavedSuccess(true);
      onUpdateProfile({
        ...profile,
        name,
        weightKg: weight,
        heightCm: height,
        age,
        fitnessLevel,
        objective,
        workoutEnvironment: environment
      });
      setTimeout(() => setSavedSuccess(false), 2000);
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Profile Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <span className="text-xs text-[#00ff88] font-mono font-black uppercase tracking-widest">AJUSTES DE ATLETA</span>
          <h2 className="font-display text-2xl font-black text-white">Perfil Digital</h2>
        </div>
      </div>

      {/* Avatar & Card Details */}
      <section className="glass-card rounded-[24px] p-6 flex flex-col sm:flex-row items-center gap-5 border-white/10 relative overflow-hidden">
        <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#00ff88] shrink-0 relative bg-black/40">
          <img 
            className="w-full h-full object-cover" 
            alt="User avatar" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1yrVczHF0AeIEAEd8gL8MPoZ5TSNaC3xnr58GNm_jxW-QqJst06mUYF_5eTtBQcbYb6z_AD5pnMot-5e8r-XXiQ-v_CE3pHp7rrPMsW_YXUfNS0xxNbiU9YSbtseMhU0z7yMnY-723KwTL75R9W02lmEzaONc35Y4X8BBlc-aBVUb3XCfaUJuhQI3gvOfOOwLdYMXjkAh76-XvWmmRe6L4K4daZP5WwMVoIsYBIVJykfb2Nu9zPM"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="text-center sm:text-left space-y-1 flex-grow">
          <h3 className="font-display text-xl font-black text-[#f1ffef]">{profile.name}</h3>
          <p className="text-xs text-[#b9cbb9] font-mono">ID: RT-82390 • Suscripción: Atleta Pro</p>
          <div className="flex justify-center sm:justify-start gap-2 pt-1">
            <span className="px-2.5 py-0.5 rounded bg-[#00ff88]/15 border border-[#00ff88]/20 text-[9px] font-bold text-[#00ff88] font-mono uppercase">
              {profile.fitnessLevel}
            </span>
            <span className="px-2.5 py-0.5 rounded bg-white/5 text-[9px] font-bold text-[#b9cbb9] font-mono uppercase">
              {profile.workoutEnvironment}
            </span>
          </div>
        </div>
      </section>

      {/* Profile form customization */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-card rounded-[24px] p-6 space-y-5 border-white/10">
          <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider mb-2">
            Editar Datos Biométricos
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-[#b9cbb9] font-semibold">Nombre de Atleta</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#00ff88]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-[#b9cbb9] font-semibold">Edad (Años)</label>
              <input 
                type="number" 
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#00ff88]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-[#b9cbb9] font-semibold">Peso Actual (kg)</label>
              <input 
                type="number" 
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#00ff88]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-[#b9cbb9] font-semibold">Estatura (cm)</label>
              <input 
                type="number" 
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#00ff88]"
              />
            </div>
          </div>
        </div>

        {/* Goals selection customization */}
        <div className="glass-card rounded-[24px] p-6 space-y-5 border-white/10">
          <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider mb-2">
            Objetivos y Nivel de Condición
          </h4>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-[#b9cbb9] font-semibold">Nivel de Condición Física</label>
              <select 
                value={fitnessLevel}
                onChange={(e) => setFitnessLevel(e.target.value)}
                className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#00ff88]"
              >
                <option value="Principiante">Principiante (Nivel 1)</option>
                <option value="Intermedio">Intermedio (Nivel 2)</option>
                <option value="Avanzado">Avanzado (Nivel 3)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-[#b9cbb9] font-semibold">Objetivo Primario</label>
              <select 
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#00ff88]"
              >
                <option value="Hipertrofia (Ganar músculo)">Hipertrofia (Ganar músculo)</option>
                <option value="Pérdida de grasa">Pérdida de grasa</option>
                <option value="Fuerza funcional">Fuerza funcional</option>
                <option value="Resistencia muscular">Resistencia muscular</option>
              </select>
            </div>
          </div>
        </div>

        {/* Smart integrations simulation */}
        <div className="glass-card rounded-[24px] p-6 space-y-4 border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <Heart className="text-[#00ff88] w-5 h-5 shrink-0" />
            <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider">
              Integraciones de Salud
            </h4>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <div>
              <p className="text-xs font-bold text-white">Apple Health / Google Fit</p>
              <p className="text-[10px] text-[#b9cbb9]">Sincroniza calorías quemadas de forma automática</p>
            </div>
            <span className="text-[10px] font-mono text-[#00ff88] bg-[#00ff88]/5 border border-[#00ff88]/20 px-2 py-0.5 rounded-full">
              Sincronizado
            </span>
          </div>

          <div className="flex justify-between items-center py-2">
            <div>
              <p className="text-xs font-bold text-white">Smart Bands (Garmin / Fitbit)</p>
              <p className="text-[10px] text-[#b9cbb9]">Medición de frecuencia cardíaca durante el entreno</p>
            </div>
            <button 
              type="button" 
              className="text-[10px] font-mono text-[#0066ff] hover:underline"
              onClick={() => alert('Integración en vivo con pulseras inteligentes iniciada.')}
            >
              Vincular
            </button>
          </div>
        </div>

        {/* Form controls */}
        <div className="flex flex-col gap-3">
          {savedSuccess && (
            <div className="bg-[#00ff88]/10 border border-[#00ff88]/20 rounded-xl p-3 text-center text-xs font-bold text-[#00ff88]">
              ✓ Datos de atleta actualizados con éxito
            </div>
          )}

          <button 
            type="submit"
            disabled={saving}
            className="w-full bg-[#00ff88] hover:bg-[#00e479] text-black font-display font-black uppercase py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Guardar Cambios</span>
          </button>

          <button 
            type="button"
            onClick={onLogout}
            className="w-full border border-red-500/30 hover:bg-red-500/10 text-red-400 py-3 rounded-xl font-bold text-xs font-mono uppercase transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </form>
    </div>
  );
}
