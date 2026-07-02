export interface Exercise {
  id: string;
  name: string;
  description: string;
  series: number;
  reps: string; // e.g., "12", "10", "al fallo"
  weightKg: number;
  restSeconds: number;
  targetMuscle: string;
  demoImageUrl: string;
}

export interface Routine {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  caloriesKcal: number;
  exercises: Exercise[];
  tag: string; // "AI-Generated" | "Hipertrofia" | "Cardio" | "Fuerza" | "Resistencia"
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzado';
  isCustom?: boolean;
  dateCreated?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  gender: string;
  age: number;
  weightKg: number;
  heightCm: number;
  fitnessLevel: string; // "Principiante" | "Intermedio" | "Avanzado"
  objective: string; // "Hipertrofia (Ganar músculo)" | "Pérdida de grasa" | "Fuerza funcional" | "Resistencia muscular"
  workoutEnvironment: string; // "Gimnasio" | "Casa" | "Ambos"
  frequencyDaysPerWeek: number;
  onboarded: boolean;
}

export interface RecentWorkoutLog {
  id: string;
  date: string; // "Lunes", "Ayer", "29 Oct"
  routineName: string;
  durationMinutes: number;
  caloriesKcal: number;
  tag: string;
}

export interface StatsHistory {
  totalWorkoutsCompleted: number;
  streakDays: number;
  totalMinutes: number;
  recentLogs: RecentWorkoutLog[];
  weeklyProgress: number[]; // 7 numbers (Monday-Sunday) representing workout intensity (e.g. [60, 40, 80, 50, 100, 10, 10])
}
