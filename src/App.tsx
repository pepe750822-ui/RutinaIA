import { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  Home, 
  Dumbbell as DumbbellIcon, 
  TrendingUp, 
  User, 
  CheckCircle, 
  Award,
  Sparkles,
  Flame,
  ArrowRight,
  ChevronRight,
  LogOut
} from 'lucide-react';

import { UserProfile, Routine, StatsHistory, RecentWorkoutLog } from './types';
import { defaultRoutines } from './data/defaultRoutines';

// Importing Views
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import OnboardingWizard from './components/OnboardingWizard';
import DashboardView from './components/DashboardView';
import RoutineDetailView from './components/RoutineDetailView';
import ActiveWorkoutView from './components/ActiveWorkoutView';
import StatsView from './components/StatsView';
import ProfileView from './components/ProfileView';

// Initial state helpers
const initialProfile: UserProfile = {
  name: 'José Luis',
  email: 'jlg.cyberdumx@gmail.com',
  gender: 'Masculino',
  age: 28,
  weightKg: 75,
  heightCm: 178,
  fitnessLevel: 'Intermedio',
  objective: 'Hipertrofia (Ganar músculo)',
  workoutEnvironment: 'Gimnasio',
  frequencyDaysPerWeek: 3,
  onboarded: true
};

const initialStats: StatsHistory = {
  totalWorkoutsCompleted: 24,
  streakDays: 7,
  totalMinutes: 480,
  recentLogs: [
    { id: 'log-1', date: 'Ayer', routineName: 'Cardio HIIT Explosivo', durationMinutes: 20, caloriesKcal: 320, tag: 'Cardio' },
    { id: 'log-2', date: 'Lunes', routineName: 'Hipertrofia de Pecho', durationMinutes: 45, caloriesKcal: 380, tag: 'Hipertrofia' },
    { id: 'log-3', date: '29 Oct', routineName: 'Fuerza Funcional IA', durationMinutes: 60, caloriesKcal: 480, tag: 'Fuerza' }
  ],
  weeklyProgress: [60, 40, 80, 50, 100, 10, 0]
};

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [routines, setRoutines] = useState<Routine[]>(defaultRoutines);
  const [stats, setStats] = useState<StatsHistory>(initialStats);
  
  // Navigation states
  const [currentScreen, setCurrentScreen] = useState<'landing' | 'login' | 'onboarding' | 'dashboard' | 'routine-detail' | 'active-workout'>('landing');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'routines' | 'stats' | 'profile'>('dashboard');
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(null);

  // Completion overlays
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionDetails, setCompletionDetails] = useState<{ minutes: number; calories: number; name: string } | null>(null);

  // Enter directly in Demo Mode
  const handleEnterDemo = () => {
    setProfile(initialProfile);
    setCurrentScreen('dashboard');
    setActiveTab('dashboard');
  };

  // Login handler
  const handleLoginSuccess = (userEmail: string, userName?: string) => {
    setProfile(prev => ({
      ...prev,
      email: userEmail,
      name: userName || prev.name,
      onboarded: true
    }));
    setCurrentScreen('dashboard');
  };

  // Onboarding completion
  const handleOnboardingComplete = (newProfile: UserProfile, generatedRoutine: Routine) => {
    setProfile(newProfile);
    
    // Check if the generated routine already exists, otherwise add it to routines list
    setRoutines(prev => {
      const filtered = prev.filter(r => r.id !== 'generated_ia_routine');
      return [generatedRoutine, ...filtered];
    });

    setCurrentScreen('dashboard');
    setActiveTab('dashboard');
  };

  // Select routine handler
  const handleSelectRoutine = (routineId: string) => {
    setSelectedRoutineId(routineId);
    setCurrentScreen('routine-detail');
  };

  // Start training
  const handleStartTraining = (routineId: string) => {
    setSelectedRoutineId(routineId);
    setCurrentScreen('active-workout');
  };

  // Completion workout logs accumulator
  const handleFinishWorkout = (minutes: number, calories: number) => {
    const routine = routines.find(r => r.id === selectedRoutineId) || routines[0];
    
    // Accumulate metrics
    const newLog: RecentWorkoutLog = {
      id: `log-${Date.now()}`,
      date: 'Hoy',
      routineName: routine.name,
      durationMinutes: minutes,
      caloriesKcal: calories,
      tag: routine.tag
    };

    setStats(prev => ({
      ...prev,
      totalWorkoutsCompleted: prev.totalWorkoutsCompleted + 1,
      streakDays: prev.streakDays + 1,
      totalMinutes: prev.totalMinutes + minutes,
      recentLogs: [newLog, ...prev.recentLogs],
      weeklyProgress: prev.weeklyProgress.map((v, i) => i === new Date().getDay() - 1 ? Math.min(100, v + 40) : v)
    }));

    // Show celebratory popup
    setCompletionDetails({
      minutes,
      calories,
      name: routine.name
    });
    setShowCompletionModal(true);

    // Redirect to Dashboard
    setCurrentScreen('dashboard');
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setProfile({ ...initialProfile, onboarded: false });
    setStats(initialStats);
    setRoutines(defaultRoutines);
    setCurrentScreen('landing');
  };

  const selectedRoutine = routines.find(r => r.id === selectedRoutineId);

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-[#dee1f7] font-body flex flex-col antialiased">
      
      {/* Global Background Grid */}
      <div className="fixed inset-0 dot-grid -z-20"></div>

      {/* Main Screens router */}
      <div className="flex-grow">
        
        {/* LANDING PAGE */}
        {currentScreen === 'landing' && (
          <LandingPage 
            onNavigate={(scr) => setCurrentScreen(scr)} 
            onEnterDemo={handleEnterDemo} 
          />
        )}

        {/* LOGIN SCREEN */}
        {currentScreen === 'login' && (
          <LoginPage 
            onLoginSuccess={handleLoginSuccess}
            onNavigateBack={() => setCurrentScreen('landing')}
          />
        )}

        {/* ONBOARDING WIZARD */}
        {currentScreen === 'onboarding' && (
          <OnboardingWizard 
            onComplete={handleOnboardingComplete}
            onCancel={() => setCurrentScreen('landing')}
          />
        )}

        {/* CORE APP VIEW (DASHBOARD OR NAV TABS) */}
        {currentScreen === 'dashboard' && (
          <div className="max-w-xl mx-auto w-full px-4 pt-6 pb-32">
            
            {/* Top Minimal Navigation Bar */}
            <header className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2" onClick={() => setCurrentScreen('landing')}>
                <Dumbbell className="text-[#00ff88] w-6 h-6" />
                <span className="font-display text-lg font-extrabold text-[#00ff88] tracking-tighter cursor-pointer">
                  RutinaIA
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-[#b9cbb9] font-bold">PRO LEVEL</span>
                <div 
                  className="w-10 h-10 rounded-xl overflow-hidden border border-[#00ff88]/40 shadow-[0_0_10px_rgba(0,255,136,0.1)] cursor-pointer"
                  onClick={() => setActiveTab('profile')}
                >
                  <img 
                    className="w-full h-full object-cover" 
                    alt="User Avatar" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1yrVczHF0AeIEAEd8gL8MPoZ5TSNaC3xnr58GNm_jxW-QqJst06mUYF_5eTtBQcbYb6z_AD5pnMot-5e8r-XXiQ-v_CE3pHp7rrPMsW_YXUfNS0xxNbiU9YSbtseMhU0z7yMnY-723KwTL75R9W02lmEzaONc35Y4X8BBlc-aBVUb3XCfaUJuhQI3gvOfOOwLdYMXjkAh76-XvWmmRe6L4K4daZP5WwMVoIsYBIVJykfb2Nu9zPM"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </header>

            {/* Render selected active Tab panel */}
            {activeTab === 'dashboard' && (
              <DashboardView 
                profile={profile}
                routines={routines}
                stats={stats}
                onSelectRoutine={handleSelectRoutine}
                onTriggerGenerate={() => setCurrentScreen('onboarding')}
                onChangeTab={setActiveTab}
              />
            )}

            {/* ROUTINES LISTING TAB */}
            {activeTab === 'routines' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <div>
                    <span className="text-xs text-[#00ff88] font-mono font-black uppercase tracking-widest">CATÁLOGO</span>
                    <h2 className="font-display text-2xl font-black text-white">Tus Rutinas</h2>
                  </div>
                  <button 
                    onClick={() => setCurrentScreen('onboarding')}
                    className="bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20 hover:bg-[#00ff88]/20 px-3 py-1.5 rounded-xl text-xs font-bold font-display transition-colors"
                  >
                    + Generar Nueva
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {routines.map((routine) => (
                    <div 
                      key={routine.id}
                      onClick={() => handleSelectRoutine(routine.id)}
                      className="glass-card p-5 rounded-2xl flex flex-col justify-between hover:border-[#00ff88]/30 transition-all cursor-pointer group border-white/10"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <span className="px-2 py-0.5 rounded bg-[#00ff88]/15 border border-[#00ff88]/20 text-[9px] font-bold text-[#00ff88] uppercase tracking-wider">
                            {routine.tag}
                          </span>
                          <h3 className="font-display font-black text-lg text-[#f1ffef] group-hover:text-[#00ff88] transition-colors leading-tight pt-1">
                            {routine.name}
                          </h3>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[#b9cbb9] group-hover:text-[#00ff88] transition-colors shrink-0" />
                      </div>

                      <p className="text-xs text-[#b9cbb9] mt-2 line-clamp-2">
                        {routine.description}
                      </p>

                      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/5 text-xs text-[#b9cbb9]/80 font-mono">
                        <span>{routine.durationMinutes} minutos</span>
                        <span>•</span>
                        <span>{routine.exercises.length} ejercicios</span>
                        <span>•</span>
                        <span className="capitalize">{routine.difficulty}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* METRICS TAB */}
            {activeTab === 'stats' && (
              <StatsView stats={stats} />
            )}

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <ProfileView 
                profile={profile}
                onUpdateProfile={setProfile}
                onLogout={handleLogout}
              />
            )}

          </div>
        )}

        {/* ROUTINE DETAIL VIEW */}
        {currentScreen === 'routine-detail' && selectedRoutine && (
          <div className="max-w-xl mx-auto w-full px-4 pt-6">
            <RoutineDetailView 
              routine={selectedRoutine}
              onBack={() => setCurrentScreen('dashboard')}
              onStartTraining={handleStartTraining}
            />
          </div>
        )}

        {/* ACTIVE WORKOUT SESSION TRACKER */}
        {currentScreen === 'active-workout' && selectedRoutine && (
          <div className="max-w-xl mx-auto w-full px-4 pt-6">
            <ActiveWorkoutView 
              routine={selectedRoutine}
              onFinishWorkout={handleFinishWorkout}
              onCancelWorkout={() => setCurrentScreen('dashboard')}
            />
          </div>
        )}

      </div>

      {/* Global Bottom Tab Bar Navigation (Shown on Dashboard sub-views) */}
      {currentScreen === 'dashboard' && (
        <nav className="fixed bottom-0 left-0 w-full z-40 bg-[#0a0f1e]/85 backdrop-blur-xl border-t border-white/10 h-20 shadow-[0_-5px_15px_rgba(0,255,136,0.05)]">
          <div className="max-w-xl mx-auto h-full flex items-center justify-around px-2">
            
            {/* Tab: Dashboard */}
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors cursor-pointer ${
                activeTab === 'dashboard' ? 'text-[#00ff88]' : 'text-[#b9cbb9]/60 hover:text-[#b9cbb9]'
              }`}
            >
              <Home className="w-5 h-5 shrink-0" />
              <span className="text-[10px] font-medium font-mono uppercase tracking-wider">Inicio</span>
            </button>

            {/* Tab: Routines */}
            <button 
              onClick={() => setActiveTab('routines')}
              className={`flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors cursor-pointer ${
                activeTab === 'routines' ? 'text-[#00ff88]' : 'text-[#b9cbb9]/60 hover:text-[#b9cbb9]'
              }`}
            >
              <DumbbellIcon className="w-5 h-5 shrink-0" />
              <span className="text-[10px] font-medium font-mono uppercase tracking-wider">Rutinas</span>
            </button>

            {/* Tab: Stats */}
            <button 
              onClick={() => setActiveTab('stats')}
              className={`flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors cursor-pointer ${
                activeTab === 'stats' ? 'text-[#00ff88]' : 'text-[#b9cbb9]/60 hover:text-[#b9cbb9]'
              }`}
            >
              <TrendingUp className="w-5 h-5 shrink-0" />
              <span className="text-[10px] font-medium font-mono uppercase tracking-wider">Métricas</span>
            </button>

            {/* Tab: Profile */}
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors cursor-pointer ${
                activeTab === 'profile' ? 'text-[#00ff88]' : 'text-[#b9cbb9]/60 hover:text-[#b9cbb9]'
              }`}
            >
              <User className="w-5 h-5 shrink-0" />
              <span className="text-[10px] font-medium font-mono uppercase tracking-wider">Perfil</span>
            </button>

          </div>
        </nav>
      )}

      {/* Celebratory Workout Completion Modal */}
      {showCompletionModal && completionDetails && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
          <div className="glass-card max-w-sm w-full rounded-[2rem] p-8 text-center border-[#00ff88]/30 shadow-[0_0_40px_rgba(0,255,136,0.2)] space-y-6 relative overflow-hidden">
            
            {/* Decorative sparklers */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0066ff] via-[#00ff88] to-[#0066ff]"></div>
            
            <div className="w-20 h-20 bg-[#00ff88]/15 rounded-full flex items-center justify-center mx-auto border border-[#00ff88]/30">
              <Award className="text-[#00ff88] w-10 h-10 animate-pulse" />
            </div>

            <div className="space-y-2">
              <span className="text-[#00ff88] font-mono text-xs font-bold uppercase tracking-widest block">
                ¡Misión Completada!
              </span>
              <h3 className="font-display text-2xl font-black text-white leading-tight">
                Sesión Finalizada
              </h3>
              <p className="text-xs text-[#b9cbb9]">
                Has completado la rutina <strong className="text-white">"{completionDetails.name}"</strong>. ¡Tu rendimiento ha sido excepcional!
              </p>
            </div>

            {/* Quick Metrics display */}
            <div className="grid grid-cols-2 gap-4 py-1">
              <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                <span className="text-[10px] text-[#b9cbb9] font-mono uppercase block">Tiempo</span>
                <span className="font-mono text-lg font-extrabold text-[#00ff88]">
                  {completionDetails.minutes} min
                </span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                <span className="text-[10px] text-[#b9cbb9] font-mono uppercase block">Quemado</span>
                <span className="font-mono text-lg font-extrabold text-[#ff6b00]">
                  {completionDetails.calories} kcal
                </span>
              </div>
            </div>

            <button 
              onClick={() => {
                setShowCompletionModal(false);
                setCompletionDetails(null);
              }}
              className="w-full bg-[#00ff88] hover:bg-[#00e479] text-black font-display font-black uppercase py-3.5 rounded-xl transition-all duration-300 neon-shadow-primary"
            >
              Cerrar y Compartir
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
