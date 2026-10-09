import { Routine } from '../types';

export const defaultRoutines: Routine[] = [
  {
    id: 'full-body-explosivo',
    name: 'Full Body Explosivo',
    description: 'Rutina balanceada enfocada en maximizar el reclutamiento de fibras y la potencia corporal completa.',
    durationMinutes: 55,
    caloriesKcal: 420,
    tag: 'AI-Generated',
    difficulty: 'Intermedio',
    exercises: [
      {
        id: 'bench-press-1',
        name: 'Press de Banca',
        description: 'Enfoque en pectoral mayor, deltoides anterior y tríceps con barra olímpica.',
        series: 4,
        reps: '12',
        weightKg: 60,
        restSeconds: 90,
        targetMuscle: 'Pectorales',
        demoImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBw6D0VvR1lsQ1KdjUcVG6o3EUZIG0ivBSexitwbb9Hza6EGDIowpyM7nvDmu6Y7ysbAiqWJ0gptlDva_75Twymn7Ros5_dZZHZE4MmSOTEjqM3v-2JnT_asKrRFooWmkGhU8ngoHxzfnVUdiPXXmnAImDBPnH317NK_j61oI7RMOMlp9pzX1iClRGOR5yu2hUY9fmsCV91P2l16t1rU9z8etO9Udk1Ez68tljl5PYYrREOu71Mzd0'
      },
      {
        id: 'squat-1',
        name: 'Sentadilla con Barra',
        description: 'Cadenas musculares inferiores completas. Estabilización de core.',
        series: 4,
        reps: '10',
        weightKg: 80,
        restSeconds: 120,
        targetMuscle: 'Cuádriceps',
        demoImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-JXm32BQYF01p9AJV_VYPSohmLi0Zy8mU75jkO9uE9xKeckbK7MxM54N4-3T4o3mRCSmbSHIUmzg-LS1hBPsG8Zfg8EzlZ5INhWmudx0Bal0Yn4GVMkJTW8I6BMxLwoSgTihKP44TYcYRICf6rDdtx6jjDN9ZPju1oalkNoBEP-wp2S-Kctm6SzMoMB1dpPlLaX-zQC-k3xS3ApFsxK71scXmmf8cT21mThPida-1kgqALNAxnyU'
      },
      {
        id: 'pullup-1',
        name: 'Dominadas',
        description: 'Tracción vertical para desarrollo de espalda amplia y fuerza en bíceps.',
        series: 3,
        reps: 'al fallo',
        weightKg: 0,
        restSeconds: 90,
        targetMuscle: 'Dorsales',
        demoImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDcti61_ZG2eQgUimBKKwxMrbCLD-ZxSEbOMebKkSnquenEN5WpkQpEC_dtP3-jbZ_vdJs2DviHA6Jcc4lkfyXsnCgkpx2lj_JWK98gextS3_Pu7JqLCaD4FtdXOF3wJOrOBKySo6wMojVpiKqQiDBwz4bhve9ZsEjpqmtq4gCjk1Mn8GUlGB2Yvwkp0QsUXVzxLZdRU0yNtBr-YelG2IQ-gDjMVm-S5Yy7TuE3lmgC8LrFGfnVYJ0'
      }
    ]
  },
  {
    id: 'hipertrofia-pecho',
    name: 'Hipertrofia de Pecho',
    description: 'Enfoque de alto volumen para destrucción y reconstrucción de la zona pectoral.',
    durationMinutes: 45,
    caloriesKcal: 380,
    tag: 'Hipertrofia',
    difficulty: 'Avanzado',
    exercises: [
      {
        id: 'bench-press-incline',
        name: 'Press de Banca Inclinado',
        description: 'Pectoral superior con barra. Estimula el crecimiento de la zona superior.',
        series: 4,
        reps: '12',
        weightKg: 60,
        restSeconds: 90,
        targetMuscle: 'Pecho Superior',
        demoImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBw6D0VvR1lsQ1KdjUcVG6o3EUZIG0ivBSexitwbb9Hza6EGDIowpyM7nvDmu6Y7ysbAiqWJ0gptlDva_75Twymn7Ros5_dZZHZE4MmSOTEjqM3v-2JnT_asKrRFooWmkGhU8ngoHxzfnVUdiPXXmnAImDBPnH317NK_j61oI7RMOMlp9pzX1iClRGOR5yu2hUY9fmsCV91P2l16t1rU9z8etO9Udk1Ez68tljl5PYYrREOu71Mzd0'
      },
      {
        id: 'pushup-chains',
        name: 'Flexiones con Cadena',
        description: 'Flexiones profundas con resistencia añadida. Tensión continua.',
        series: 4,
        reps: '15',
        weightKg: 10,
        restSeconds: 60,
        targetMuscle: 'Pectorales',
        demoImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsmOSwFVc24ClXsaovdQvDx2UCfxrMUahdMuus3wu-rLOa1nyeCm4DLDVr3qjCHLKLG8eU4LygXWqE8QLX11N2B6bYDUhteuIEzoNpOUvqEP2giplQua-FWEgZ3CkWUCVbPRKyjgQGsr9zBxlhZovs-kbcaAz9mmxZIN56DfBQtFw6JLmjwB-vb7-jnKe8sumT2YbHaqroy-AoVwVUqltSjSKhMe6RAIUI1TWsIOJsprSEXYLSgH0'
      }
    ]
  },
  {
    id: 'cardio-hiit-explosivo',
    name: 'Cardio HIIT Explosivo',
    description: 'Protocolo de alta intensidad a intervalos para acelerar el metabolismo y quemar grasa residual.',
    durationMinutes: 20,
    caloriesKcal: 320,
    tag: 'Cardio',
    difficulty: 'Principiante',
    exercises: [
      {
        id: 'treadmill-hiit',
        name: 'Sprints en Caminadora',
        description: 'Intervalos de 30s de sprint máximo seguidos de 30s de recuperación pasiva.',
        series: 10,
        reps: '30s / 30s',
        weightKg: 0,
        restSeconds: 30,
        targetMuscle: 'Cardiovascular',
        demoImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDLtS6EipWRh0vgdltNTjnZ1cszOioJ2I7BewLVrjJGJEaf0zlgHlnN6rM-yRw4F2qlp9n20Du3nGuBBI21OHoWYY0DR4GWdTmQLtv_799eYxPLMTugBaiR1TYL-DpsbhvbxYpjg4lOhqxK4fddALlZWZ8yDhNZX3_1FK0YXGpSwKYuKaoT7yr7Ix7RH4Iva3V1MsiPAFxOEEs_1-_eVSIDPpMWLonAy3o307Lr8d2LwUE_UF6eiFI'
      }
    ]
  },
  {
    id: 'fuerza-funcional-ia',
    name: 'Fuerza Funcional IA',
    description: 'Entrenamiento multiarticular utilizando kettlebells y peso libre para fortalecer el core posterior.',
    durationMinutes: 60,
    caloriesKcal: 480,
    tag: 'Fuerza',
    difficulty: 'Intermedio',
    exercises: [
      {
        id: 'kettlebell-swing',
        name: 'Swings con Kettlebell',
        description: 'Extensión explosiva de cadera con pesas rusas de acero para cadena posterior.',
        series: 4,
        reps: '20',
        weightKg: 24,
        restSeconds: 60,
        targetMuscle: 'Glúteos y Lumbares',
        demoImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8kII0g4lrev5wR2d8tN7-iIm9L_fYKp7bW62ioYRAVQVc7NtfRMsVaWVklsAERpSpDrqht6jlaZERGGf0NJ-6xMRAqAQLub8laFiVNCvaX4VCOWE_K-A3WVugJHJJ8PFnS1WQoeZZDCEuutFucr8OBX_aJ9_MURrxK1VprNKvO1cc8VWgIPifg22QIU4I7VBI3LCaeyQq8C0rCy6SMVcYfPo_FLoUNcRtBMjSkqSLZ4Fu94LCY74'
      }
    ]
  },
  {
    id: 'hypertrophy-back',
    name: 'Hypertrophy Back',
    description: 'Plan de tracción pesada para lograr un desarrollo de espalda denso y balanceado.',
    durationMinutes: 45,
    caloriesKcal: 400,
    tag: 'Hipertrofia',
    difficulty: 'Avanzado',
    exercises: [
      {
        id: 'cable-rows',
        name: 'Remo en Polea Baja',
        description: 'Tracción horizontal enfocada en la parte media de la espalda, redondo mayor y bíceps.',
        series: 4,
        reps: '12',
        weightKg: 55,
        restSeconds: 90,
        targetMuscle: 'Espalda Media',
        demoImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8kII0g4lrev5wR2d8tN7-iIm9L_fYKp7bW62ioYRAVQVc7NtfRMsVaWVklsAERpSpDrqht6jlaZERGGf0NJ-6xMRAqAQLub8laFiVNCvaX4VCOWE_K-A3WVugJHJJ8PFnS1WQoeZZDCEuutFucr8OBX_aJ9_MURrxK1VprNKvO1cc8VWgIPifg22QIU4I7VBI3LCaeyQq8C0rCy6SMVcYfPo_FLoUNcRtBMjSkqSLZ4Fu94LCY74'
      }
    ]
  },
  {
    id: 'leg-destroyer-2',
    name: 'Leg Destroyer 2.0',
    description: 'Protocolo asesino para cuadriceps y femorales usando cargas pesadas progresivas.',
    durationMinutes: 60,
    caloriesKcal: 510,
    tag: 'Fuerza',
    difficulty: 'Avanzado',
    exercises: [
      {
        id: 'barbell-squat-heavy',
        name: 'Sentadillas Pesadas',
        description: 'Sentadilla clásica con barra en espalda baja para potenciar glúteos y piernas.',
        series: 4,
        reps: '8',
        weightKg: 100,
        restSeconds: 120,
        targetMuscle: 'Piernas',
        demoImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAiEv3jshKQmM8dDkFcCRTP--9IueG8DelvzaVf4ruRwvPqbIxafJKSpLi1jQP5uPtOLzlYrHS-QDpeD2vUN2lHhFUWQdqBABgQ4pnV3qzg64LLhVgDCyZf0mvXEAy54SzqibaPC4_w5QWgMUb3_JkyI3nvQWam4BgvD0KKzHPrHJvYvJbx9eYRNj_kP8LbYCtuWD_ARWRFX9Fc4VFrSwb_5qD6-vfthuZMUArDemO7nXECGrfbzKw'
      }
    ]
  }
];
