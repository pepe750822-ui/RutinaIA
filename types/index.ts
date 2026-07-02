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

export interface RutinaGeneratorForm {
  objetivo: "perder_peso" | "mejorar_condicion" | "ganar_muscular" | "mantener";
  nivel: "principiante" | "intermedio" | "avanzado";
  experiencia: "ninguna" | "basica" | "intermedia" | "avanzada";
  conocimiento: "poco" | "bueno" | "muy_bueno";
  edad: number;
  peso: number;
  altura: number;
  genero: "masculino" | "femenino" | "otro";
  condicion_fisica: "mala" | "regular" | "buena" | "excelente";
  lesiones: string;
  condiciones_medicas: string;
  frecuencia_semanal: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  duracion_minutos: 15 | 30 | 45 | 60 | 90;
  horario_preferido: "mañana" | "tarde" | "noche";
  equipo_disponible: string[];
  grupos_musculares: string[];
  prioridad_muscular: string;
}
