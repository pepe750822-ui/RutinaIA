export interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  gifUrl: string;
  target: string;
  secondaryMuscles: string[];
  instructions: string[];
}

export interface RutinaEjercicio {
  exercise: Exercise;
  sets: number;
  reps: number;
  restSeconds: number;
  order: number;
}

export interface Rutina {
  id: string;
  user_id: string;
  nombre: string;
  objetivo: string;
  nivel: string;
  ejercicios: RutinaEjercicio[];
  created_at: string;
  completada: boolean;
  duracion_minutos: number;
}

export interface Profile {
  id: string;
  email: string;
  nombre: string;
  plan: "gratis" | "premium";
  rutinas_semana: number;
  created_at: string;
}

export interface EjercicioCompletado {
  id: string;
  user_id: string;
  rutina_id: string;
  fecha: string;
  duracion_min: number;
}
