export interface Exercise {
  id: string;
  name: string;
  body_part: string;
  equipment: string;
  target: string;
  category?: string;
  instructions?: Record<string, string>;
  instruction_steps?: Record<string, string[]>;
  media_id?: string | null;
}

export interface RutinaEjercicio {
  exercise: Exercise;
  sets: number;
  reps: number;
  restSeconds: number;
  order: number;
}

export interface RutinaDia {
  nombre: string;
  duracion_minutos: number;
  ejercicios: RutinaEjercicio[];
}

export interface Rutina {
  id: string;
  user_id: string;
  nombre: string;
  objetivo: string;
  nivel: string;
  ejercicios: RutinaEjercicio[];
  dias?: RutinaDia[];
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
  lugar: "gimnasio" | "casa" | "ambos";
  objetivo: "perder_peso" | "mejorar_condicion" | "ganar_muscular" | "mantener";
  nivel: "principiante" | "intermedio" | "avanzado";
  experiencia: "ninguna" | "basica" | "intermedia" | "avanzada";
  conocimiento: "poco" | "bueno" | "muy_bueno";
  edad: "menor_18" | "18_25" | "26_35" | "36_45" | "46_55" | "mayor_55";
  peso: "menos_60" | "60_75" | "76_90" | "91_110" | "mas_110";
  altura: "bajo" | "medio" | "alto" | "muy_alto";
  genero: "masculino" | "femenino" | "otro";
  condicion_fisica: "mala" | "regular" | "buena" | "excelente";
  lesiones: "ninguna" | "espalda" | "rodillas" | "hombros" | "muñecas" | "tobillos" | "multiple";
  condiciones_medicas: "ninguna" | "hipertension" | "diabetes" | "corazon" | "asthma" | "multiple";
  frecuencia_semanal: "1_2" | "3_4" | "5_6" | "7";
  duracion_minutos: "15_20" | "25_30" | "35_45" | "45_60" | "60_90";
  horario_preferido: "mañana" | "tarde" | "noche";
  equipo_disponible: ("mancuernas" | "barra" | "bandas" | "maquina" | "peso_corporal")[];
  grupos_musculares: ("todo" | "pecho" | "espalda" | "piernas" | "hombros" | "brazos" | "core")[];
  prioridad_muscular: "ninguna" | "pecho" | "espalda" | "piernas" | "hombros" | "brazos" | "core";
}
