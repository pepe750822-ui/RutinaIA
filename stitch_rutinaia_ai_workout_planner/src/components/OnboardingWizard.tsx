import { useState } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Dumbbell, 
  Home, 
  Compass, 
  Target, 
  Flame, 
  Zap, 
  TrendingUp, 
  CheckCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { UserProfile, Routine, Exercise } from '../types';
import { defaultRoutines } from '../data/defaultRoutines';

interface OnboardingWizardProps {
  onComplete: (profile: UserProfile, generatedRoutine: Routine) => void;
  onCancel: () => void;
}

export default function OnboardingWizard({ onComplete, onCancel }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  
  // Selections state
  const [environment, setEnvironment] = useState<'Gimnasio' | 'Casa' | 'Ambos'>('Gimnasio');
  const [objective, setObjective] = useState<string>('Hipertrofia (Ganar músculo)');
  const [fitnessLevel, setFitnessLevel] = useState<'Principiante' | 'Intermedio' | 'Avanzado'>('Intermedio');
  const [frequency, setFrequency] = useState<number>(3);
  
  // Biometrics
  const [gender, setGender] = useState<string>('Masculino');
  const [age, setAge] = useState<number>(28);
  const [weight, setWeight] = useState<number>(75);
  const [height, setHeight] = useState<number>(178);
  
  // Name
  const [name, setName] = useState<string>('José Luis');
  
  // Generation loader state
  const [generating, setGenerating] = useState(false);
  const [genMessageIndex, setGenMessageIndex] = useState(0);

  const generationMessages = [
    'Analizando perfil biométrico...',
    'Evaluando entorno de entrenamiento (' + environment + ')...',
    'Modelando curvas de fatiga óptimas para ' + objective + '...',
    'Consultando catálogo de 1,324 ejercicios con IA...',
    'Estructurando series de calentamiento y aproximación...',
    'Sincronizando tiempos de descanso (' + (fitnessLevel === 'Avanzado' ? '90s' : '120s') + ')...',
    '¡Tu rutina de alto rendimiento está lista!'
  ];

  const handleNext = () => {
    if (step < 6) {
      setStep(prev => prev + 1);
    } else if (step === 6) {
      // Trigger AI generation simulation
      setStep(7);
      setGenerating(true);
      
      let msgIdx = 0;
      const interval = setInterval(() => {
        if (msgIdx < generationMessages.length - 1) {
          msgIdx++;
          setGenMessageIndex(msgIdx);
        } else {
          clearInterval(interval);
          setGenerating(false);
        }
      }, 700);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    } else {
      onCancel();
    }
  };

  const handleFinish = () => {
    // Generate Routine locally based on selections
    const userProfile: UserProfile = {
      name: name || 'Usuario',
      email: 'user@rutinaia.com',
      gender,
      age,
      weightKg: weight,
      heightCm: height,
      fitnessLevel,
      objective,
      workoutEnvironment: environment,
      frequencyDaysPerWeek: frequency,
      onboarded: true
    };

    // Create a personalized routine dynamically
    const exercisesList: Exercise[] = [];
    let routineName = 'Full Body Explosivo';
    let routineDesc = 'Rutina de cuerpo completo diseñada con IA para adaptabilidad máxima.';
    let duration = 45;
    let calories = 350;
    let tag = 'AI-Generated';

    if (objective.includes('Hipertrofia')) {
      routineName = `Hipertrofia de ${environment === 'Gimnasio' ? 'Pecho y Espalda' : 'Cuerpo Completo'}`;
      routineDesc = 'Enfoque de alto volumen mecánico para estimular síntesis de proteínas y crecimiento de masa magra.';
      duration = 55;
      calories = 410;
      tag = 'Hipertrofia';
      
      exercisesList.push({
        id: 'gen-bench',
        name: environment === 'Casa' ? 'Flexiones De Pecho Pesadas' : 'Press de Banca con Barra',
        description: 'Enfoque en pectoral mayor y tríceps con alta tensión excéntrica.',
        series: 4,
        reps: '12',
        weightKg: environment === 'Casa' ? 0 : 60,
        restSeconds: 90,
        targetMuscle: 'Pectorales',
        demoImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBw6D0VvR1lsQ1KdjUcVG6o3EUZIG0ivBSexitwbb9Hza6EGDIowpyM7nvDmu6Y7ysbAiqWJ0gptlDva_75Twymn7Ros5_dZZHZE4MmSOTEjqM3v-2JnT_asKrRFooWmkGhU8ngoHxzfnVUdiPXXmnAImDBPnH317NK_j61oI7RMOMlp9pzX1iClRGOR5yu2hUY9fmsCV91P2l16t1rU9z8etO9Udk1Ez68tljl5PYYrREOu71Mzd0'
      });
      exercisesList.push({
        id: 'gen-row',
        name: environment === 'Casa' ? 'Remo con Mochila / Bandas' : 'Remo en Polea con Cable',
        description: 'Tracción horizontal para potenciar dorsales y bíceps.',
        series: 4,
        reps: '12',
        weightKg: environment === 'Casa' ? 15 : 55,
        restSeconds: 90,
        targetMuscle: 'Espalda',
        demoImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8kII0g4lrev5wR2d8tN7-iIm9L_fYKp7bW62ioYRAVQVc7NtfRMsVaWVklsAERpSpDrqht6jlaZERGGf0NJ-6xMRAqAQLub8laFiVNCvaX4VCOWE_K-A3WVugJHJJ8PFnS1WQoeZZDCEuutFucr8OBX_aJ9_MURrxK1VprNKvO1cc8VWgIPifg22QIU4I7VBI3LCaeyQq8C0rCy6SMVcYfPo_FLoUNcRtBMjSkqSLZ4Fu94LCY74'
      });
    } else if (objective.includes('Pérdida')) {
      routineName = 'HIIT Metabólico Adaptativo';
      routineDesc = 'Intervalos intensos que disparan el EPOC (consumo de oxígeno post-ejercicio) para quemar grasa por 24 horas.';
      duration = 30;
      calories = 450;
      tag = 'Cardio';

      exercisesList.push({
        id: 'gen-hiit',
        name: 'Sprints de Caminadora / Burpees',
        description: 'Intervalos de esfuerzo al 90% seguidos de recuperación activa.',
        series: 6,
        reps: '45s',
        weightKg: 0,
        restSeconds: 45,
        targetMuscle: 'Cardio',
        demoImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDLtS6EipWRh0vgdltNTjnZ1cszOioJ2I7BewLVrjJGJEaf0zlgHlnN6rM-yRw4F2qlp9n20Du3nGuBBI21OHoWYY0DR4GWdTmQLtv_799eYxPLMTugBaiR1TYL-DpsbhvbxYpjg4lOhqxK4fddALlZWZ8yDhNZX3_1FK0YXGpSwKYuKaoT7yr7Ix7RH4Iva3V1MsiPAFxOEEs_1-_eVSIDPpMWLonAy3o307Lr8d2LwUE_UF6eiFI'
      });
    } else {
      routineName = 'Fuerza Funcional Integrada';
      routineDesc = 'Movimientos compuestos diseñados para mejorar transferencias de fuerza y estabilidad en el core.';
      duration = 50;
      calories = 380;
      tag = 'Fuerza';

      exercisesList.push({
        id: 'gen-squat',
        name: 'Sentadilla Profunda con Carga',
        description: 'Extensión pesada con barra para reclutar toda la musculatura del tren inferior.',
        series: 4,
        reps: '8',
        weightKg: environment === 'Casa' ? 30 : 80,
        restSeconds: 120,
        targetMuscle: 'Piernas',
        demoImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAiEv3jshKQmM8dDkFcCRTP--9IueG8DelvzaVf4ruRwvPqbIxafJKSpLi1jQP5uPtOLzlYrHS-QDpeD2vUN2lHhFUWQdqBABgQ4pnV3qzg64LLhVgDCyZf0mvXEAy54SzqibaPC4_w5QWgMUb3_JkyI3nvQWam4BgvD0KKzHPrHJvYvJbx9eYRNj_kP8LbYCtuWD_ARWRFX9Fc4VFrSwb_5qD6-vfthuZMUArDemO7nXECGrfbzKw'
      });
    }

    // Always add a base core exercise
    exercisesList.push({
      id: 'gen-core',
      name: 'Plancha Abdominal con IA',
      description: 'Isométrico estricto con activación neural de transverso abdominal.',
      series: 3,
      reps: '60s',
      weightKg: 0,
      restSeconds: 60,
      targetMuscle: 'Abdomen',
      demoImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDcti61_ZG2eQgUimBKKwxMrbCLD-ZxSEbOMebKkSnquenEN5WpkQpEC_dtP3-jbZ_vdJs2DviHA6Jcc4lkfyXsnCgkpx2lj_JWK98gextS3_Pu7JqLCaD4FtdXOF3wJOrOBKySo6wMojVpiKqQiDBwz4bhve9ZsEjpqmtq4gCjk1Mn8GUlGB2Yvwkp0QsUXVzxLZdRU0yNtBr-YelG2IQ-gDjMVm-S5Yy7TuE3lmgC8LrFGfnVYJ0'
    });

    const generatedRoutine: Routine = {
      id: 'generated_ia_routine',
      name: routineName,
      description: routineDesc,
      durationMinutes: duration,
      caloriesKcal: calories,
      exercises: exercisesList,
      tag: tag,
      difficulty: fitnessLevel,
      isCustom: true
    };

    onComplete(userProfile, generatedRoutine);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-[#dee1f7] flex flex-col font-body pb-24 relative overflow-hidden">
      
      {/* Background accents */}
      <div className="fixed top-1/4 -right-20 w-80 h-80 bg-[#00ff88]/10 blur-[120px] rounded-full -z-10"></div>
      <div className="fixed bottom-1/4 -left-20 w-96 h-96 bg-[#0066ff]/5 blur-[120px] rounded-full -z-10 animate-breathe"></div>

      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-[#0a0f1e]/80 backdrop-blur-xl border-b border-white/10 shadow-[0_0_15px_rgba(0,255,136,0.1)]">
        <div className="flex items-center gap-2">
          <Dumbbell className="text-[#00ff88] w-6 h-6" />
          <span className="font-display text-xl font-extrabold text-[#00ff88] tracking-tighter">RutinaIA</span>
        </div>
        <div className="flex items-center gap-2 bg-[#00ff88]/10 border border-[#00ff88]/20 px-3 py-1 rounded-full text-xs font-mono text-[#00ff88]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Configuración Inicial</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow pt-24 px-4 max-w-4xl mx-auto w-full flex flex-col justify-center">
        
        {/* Step Indicator (Progress bar) */}
        <div className="mb-8 max-w-xl mx-auto w-full">
          <div className="flex justify-between items-center mb-3">
            <span className="font-mono text-xs font-bold text-[#00ff88] uppercase tracking-widest">
              Paso {step} de 7
            </span>
            <span className="text-xs text-[#b9cbb9] font-medium">
              {step === 7 ? 'Generación Inteligente' : 'Configuración de Perfil'}
            </span>
          </div>
          
          {/* Progress bar tracks */}
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex gap-1">
            {[1, 2, 3, 4, 5, 6, 7].map((s) => (
              <div 
                key={s} 
                className={`h-full flex-1 rounded-full transition-all duration-300 ${
                  s <= step 
                    ? 'bg-gradient-to-r from-[#0066ff] to-[#00ff88] neon-shadow-primary' 
                    : 'bg-white/5'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Dynamic Step Content */}
        <div className="glass-card rounded-[24px] p-6 md:p-8 shadow-2xl border-white/10 max-w-2xl mx-auto w-full relative">
          
          {/* Step 1: Entorno de entrenamiento */}
          {step === 1 && (
            <div className="space-y-8 animate-fade-in">
              <div className="text-center space-y-2">
                <h1 className="font-display text-2xl md:text-3xl font-extrabold text-white">¿Dónde vas a entrenar?</h1>
                <p className="text-sm text-[#b9cbb9] max-w-md mx-auto">
                  Selecciona tu entorno principal para que la IA adapte los ejercicios y las cargas a tu equipamiento disponible.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button 
                  onClick={() => setEnvironment('Gimnasio')}
                  className={`group p-6 rounded-2xl border transition-all flex flex-col items-center justify-center text-center gap-3 cursor-pointer ${
                    environment === 'Gimnasio' 
                      ? 'border-[#00ff88] bg-[#00ff88]/5 neon-shadow-primary' 
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className={`p-4 rounded-full transition-colors ${
                    environment === 'Gimnasio' ? 'bg-[#00ff88]/20' : 'bg-white/5 group-hover:bg-[#00ff88]/10'
                  }`}>
                    <Dumbbell className={`w-8 h-8 ${environment === 'Gimnasio' ? 'text-[#00ff88]' : 'text-white'}`} />
                  </div>
                  <span className="font-display text-lg font-bold text-white">Gimnasio</span>
                  <span className="text-[11px] text-[#b9cbb9]">Acceso a máquinas y pesas olímpicas</span>
                </button>

                <button 
                  onClick={() => setEnvironment('Casa')}
                  className={`group p-6 rounded-2xl border transition-all flex flex-col items-center justify-center text-center gap-3 cursor-pointer ${
                    environment === 'Casa' 
                      ? 'border-[#00ff88] bg-[#00ff88]/5 neon-shadow-primary' 
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className={`p-4 rounded-full transition-colors ${
                    environment === 'Casa' ? 'bg-[#00ff88]/20' : 'bg-white/5 group-hover:bg-[#00ff88]/10'
                  }`}>
                    <Home className={`w-8 h-8 ${environment === 'Casa' ? 'text-[#00ff88]' : 'text-white'}`} />
                  </div>
                  <span className="font-display text-lg font-bold text-white">Casa</span>
                  <span className="text-[11px] text-[#b9cbb9]">Sin equipo o mancuernas ligeras</span>
                </button>

                <button 
                  onClick={() => setEnvironment('Ambos')}
                  className={`group p-6 rounded-2xl border transition-all flex flex-col items-center justify-center text-center gap-3 cursor-pointer ${
                    environment === 'Ambos' 
                      ? 'border-[#00ff88] bg-[#00ff88]/5 neon-shadow-primary' 
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className={`p-4 rounded-full transition-colors ${
                    environment === 'Ambos' ? 'bg-[#00ff88]/20' : 'bg-white/5 group-hover:bg-[#00ff88]/10'
                  }`}>
                    <Compass className={`w-8 h-8 ${environment === 'Ambos' ? 'text-[#00ff88]' : 'text-white'}`} />
                  </div>
                  <span className="font-display text-lg font-bold text-white">Ambos</span>
                  <span className="text-[11px] text-[#b9cbb9]">Entrenamiento híbrido y flexible</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Objetivo principal */}
          {step === 2 && (
            <div className="space-y-8 animate-fade-in">
              <div className="text-center space-y-2">
                <h1 className="font-display text-2xl md:text-3xl font-extrabold text-white">¿Cuál es tu objetivo?</h1>
                <p className="text-sm text-[#b9cbb9] max-w-md mx-auto">
                  La IA estructurará el volumen, los rangos de repeticiones y la intensidad según esta meta.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: 'Hipertrofia (Ganar músculo)', desc: 'Desarrollo muscular magro mediante tensión mecánica', icon: Target },
                  { title: 'Pérdida de grasa', desc: 'Maximizar quema de calorías post-entrenamiento (EPOC)', icon: Flame },
                  { title: 'Fuerza funcional', desc: 'Aumentar potencia, coordinación motora y estabilidad core', icon: Zap },
                  { title: 'Resistencia muscular', desc: 'Fortalecimiento de tendones y capacidad aeróbica general', icon: TrendingUp }
                ].map((item) => {
                  const IconComp = item.icon;
                  const isSelected = objective === item.title;
                  return (
                    <button 
                      key={item.title}
                      onClick={() => setObjective(item.title)}
                      className={`p-5 rounded-2xl border text-left flex gap-4 items-start cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-[#00ff88] bg-[#00ff88]/5 neon-shadow-primary' 
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className={`p-2.5 rounded-lg shrink-0 ${isSelected ? 'bg-[#00ff88]/20 text-[#00ff88]' : 'bg-white/5 text-[#dee1f7]'}`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-display font-bold text-sm text-white">{item.title}</p>
                        <p className="text-xs text-[#b9cbb9] leading-relaxed">{item.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Nivel de condición física */}
          {step === 3 && (
            <div className="space-y-8 animate-fade-in">
              <div className="text-center space-y-2">
                <h1 className="font-display text-2xl md:text-3xl font-extrabold text-white">¿Tu nivel actual?</h1>
                <p className="text-sm text-[#b9cbb9] max-w-md mx-auto">
                  Esto define el rango de progresión y la complejidad técnica de las rutinas generadas.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { level: 'Principiante', desc: 'No he entrenado antes o estoy retomando tras un descanso de meses. Busco aprender técnicas seguras sin lesionarme.', rating: 'Principiante (Nivel 1)' },
                  { level: 'Intermedio', desc: 'Entreno regularmente con pesas o peso libre (1-2 años). Domino sentadillas y press básicos y busco programaciones efectivas.', rating: 'Intermedio (Nivel 2)' },
                  { level: 'Avanzado', desc: 'Entreno pesado con consistencia (+3 años). Busco optimización avanzada de volumen, series al fallo y división especializada.', rating: 'Avanzado (Nivel 3)' }
                ].map((item) => {
                  const isSelected = fitnessLevel === item.level;
                  return (
                    <button 
                      key={item.level}
                      onClick={() => setFitnessLevel(item.level as any)}
                      className={`w-full p-5 rounded-2xl border text-left flex justify-between items-center cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-[#00ff88] bg-[#00ff88]/5 neon-shadow-primary' 
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="space-y-1 pr-4">
                        <p className="font-display font-bold text-base text-white">{item.level}</p>
                        <p className="text-xs text-[#b9cbb9] leading-relaxed">{item.desc}</p>
                      </div>
                      <span className={`shrink-0 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full ${
                        isSelected ? 'bg-[#00ff88]/20 text-[#00ff88]' : 'bg-white/5 text-[#b9cbb9]'
                      }`}>
                        {item.level === 'Avanzado' ? 'PRO' : item.level === 'Intermedio' ? 'MID' : 'FIT'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Frecuencia semanal */}
          {step === 4 && (
            <div className="space-y-8 animate-fade-in">
              <div className="text-center space-y-2">
                <h1 className="font-display text-2xl md:text-3xl font-extrabold text-white">¿Frecuencia de entrenamiento?</h1>
                <p className="text-sm text-[#b9cbb9] max-w-md mx-auto">
                  La IA distribuirá el volumen óptimo total en los días que elijas.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                {[2, 3, 4, 5].map((days) => {
                  const isSelected = frequency === days;
                  return (
                    <button 
                      key={days}
                      onClick={() => setFrequency(days)}
                      className={`p-6 rounded-2xl border transition-all text-center flex flex-col gap-2 justify-center cursor-pointer ${
                        isSelected 
                          ? 'border-[#00ff88] bg-[#00ff88]/5 neon-shadow-primary' 
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <span className="font-display text-3xl font-extrabold text-white">{days}</span>
                      <span className="text-xs text-[#b9cbb9] font-medium font-mono uppercase">Días por semana</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 5: Biometría */}
          {step === 5 && (
            <div className="space-y-8 animate-fade-in">
              <div className="text-center space-y-2">
                <h1 className="font-display text-2xl md:text-3xl font-extrabold text-white">Tus datos biométricos</h1>
                <p className="text-sm text-[#b9cbb9] max-w-sm mx-auto">
                  Esenciales para calcular tu gasto metabólico y dosificar el esfuerzo óptimo.
                </p>
              </div>

              <div className="space-y-5 max-w-md mx-auto">
                {/* Gender */}
                <div className="grid grid-cols-3 gap-2">
                  {['Masculino', 'Femenino', 'Otro'].map((g) => (
                    <button 
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                        gender === g 
                          ? 'border-[#00ff88] bg-[#00ff88]/10 text-[#00ff88]' 
                          : 'border-white/10 bg-white/5 text-[#dee1f7]'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>

                {/* Age, Weight, Height Inputs */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-[#b9cbb9] font-semibold">Edad (años)</label>
                    <input 
                      type="number" 
                      min="12"
                      max="100"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ff88]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-[#b9cbb9] font-semibold">Peso (kg)</label>
                    <input 
                      type="number" 
                      min="30"
                      max="200"
                      value={weight}
                      onChange={(e) => setWeight(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ff88]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-[#b9cbb9] font-semibold">Altura (cm)</label>
                    <input 
                      type="number" 
                      min="100"
                      max="250"
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ff88]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Nombre de usuario */}
          {step === 6 && (
            <div className="space-y-8 animate-fade-in">
              <div className="text-center space-y-2">
                <h1 className="font-display text-2xl md:text-3xl font-extrabold text-white">¿Cómo te llamas?</h1>
                <p className="text-sm text-[#b9cbb9] max-w-sm mx-auto">
                  La IA te saludará y adaptará el coaching de voz con tu nombre.
                </p>
              </div>

              <div className="max-w-xs mx-auto space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-[#b9cbb9] font-semibold">Tu nombre de atleta</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] text-center font-bold"
                    placeholder="Ej. José Luis"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 7: Loader AI Generation */}
          {step === 7 && (
            <div className="space-y-8 py-8 animate-fade-in text-center flex flex-col items-center">
              {generating ? (
                <>
                  {/* Glowing processing animation */}
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-dashed border-[#00ff88] animate-spin"></div>
                    <div className="absolute w-16 h-16 rounded-full bg-[#00ff88]/10 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-[#00ff88] animate-pulse" />
                    </div>
                  </div>

                  <div className="space-y-2 max-w-sm">
                    <h3 className="font-display text-lg font-bold text-white">Generando con IA...</h3>
                    {/* Animated current status message */}
                    <p className="text-sm text-[#00ff88] font-mono min-h-[40px] transition-all duration-300">
                      &gt; {generationMessages[genMessageIndex]}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-20 h-24 bg-gradient-to-br from-[#0066ff]/20 to-[#00ff88]/20 rounded-2xl flex items-center justify-center shadow-lg border border-[#00ff88]/30">
                    <CheckCircle className="w-12 h-12 text-[#00ff88] shrink-0" />
                  </div>

                  <div className="space-y-2 max-w-sm">
                    <h3 className="font-display text-2xl font-black text-white">¡Rutina Lista!</h3>
                    <p className="text-sm text-[#b9cbb9]">
                      Tu entrenador digital ha analizado con éxito tus datos biométricos y de entorno. ¿Listo para dar el siguiente paso?
                    </p>
                  </div>

                  <button 
                    onClick={handleFinish}
                    className="bg-[#00ff88] hover:bg-[#00e479] text-black font-display font-black uppercase px-8 py-4 rounded-xl transition-all duration-300 neon-shadow-strong"
                  >
                    Entrar al Dashboard
                  </button>
                </>
              )}
            </div>
          )}

        </div>

        {/* Action Controls (Footer style buttons) */}
        {step < 7 && (
          <div className="fixed bottom-0 left-0 w-full z-40 bg-[#0a0f1e]/80 backdrop-blur-md border-t border-white/10 px-6 h-24 flex items-center justify-center">
            <div className="max-w-xl w-full flex justify-between items-center">
              <button 
                onClick={handlePrev}
                className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider text-[#b9cbb9] hover:text-[#00ff88] transition-all active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>

              <button 
                onClick={handleNext}
                className="px-6 py-3.5 rounded-full bg-[#00ff88] hover:bg-[#00e479] text-black font-display font-bold text-sm hover:neon-shadow-primary transition-all active:scale-95 flex items-center gap-1 shadow-lg"
              >
                <span>{step === 6 ? 'Generar rutina' : 'Siguiente'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
