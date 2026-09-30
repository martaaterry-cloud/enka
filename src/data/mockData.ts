import type { Activity } from '../models/activity';
import type { FlexibleGymSession, PlanningProject, WeeklyPlanningSummary } from '../models/planning';

export const MOCK_ACTIVITIES: Activity[] = [
  // ==========================================
  // HOY: Martes 29 de septiembre
  // (Trabajo + Peluquería. Los martes NO hay entrenamiento)
  // ==========================================
  {
    id: 'act-today-1',
    title: 'Trabajo',
    categoryId: 'trabajo',
    date: '2026-09-29',
    startTime: '07:00',
    endTime: '15:00',
    locationId: 'syte-alcantarilla',
    locationName: 'SYTE Automation SL',
    locationCity: 'Alcantarilla',
    travelBeforeMinutes: 30,
    travelAfterMinutes: 30,
    returnTravelTransition: {
      fromLocation: 'SYTE Automation SL',
      toLocation: 'Bullas',
      departureEstimate: '~15:05',
      arrivalEstimate: '~15:40–15:45',
      notes: 'Regreso habitual en coche (~30–40 min según tráfico)'
    },
    certainty: 'confirmed',
    isRecurrent: true,
    recurrencePattern: 'Lunes a Viernes',
    notes: 'Jornada habitual.',
    createdAt: '2026-09-25T08:00:00Z'
  },
  {
    id: 'act-today-2',
    title: 'Peluquería',
    categoryId: 'personal',
    date: '2026-09-29',
    startTime: '17:00',
    isEndTimeUnknown: true,
    locationName: 'Peluquería',
    locationCity: 'Bullas',
    certainty: 'confirmed',
    notes: 'Cita reservada a las 17:00. Hora de fin por determinar según servicio.',
    createdAt: '2026-09-26T10:00:00Z'
  },

  // ==========================================
  // MIÉRCOLES 30 DE SEPTIEMBRE
  // ==========================================
  {
    id: 'act-sep-30-1',
    title: 'Trabajo',
    categoryId: 'trabajo',
    date: '2026-09-30',
    startTime: '07:00',
    endTime: '15:00',
    locationId: 'syte-alcantarilla',
    locationName: 'SYTE Automation SL',
    locationCity: 'Alcantarilla',
    travelBeforeMinutes: 30,
    returnTravelTransition: {
      departureEstimate: '~15:05',
      arrivalEstimate: '~15:40–15:45',
      toLocation: 'Bullas'
    },
    certainty: 'confirmed',
    isRecurrent: true,
    createdAt: '2026-09-25T08:00:00Z'
  },
  {
    id: 'act-sep-30-entreno',
    title: 'Entrenamiento',
    categoryId: 'balonmano',
    date: '2026-09-30',
    startTime: '20:30',
    endTime: '21:50',
    locationId: 'pabellon-bullas',
    locationName: 'Pabellón Juan Valera',
    locationCity: 'Bullas',
    certainty: 'confirmed',
    isRecurrent: true,
    recurrencePattern: 'Miércoles 20:30–21:50',
    notes: 'Senior Femenino.',
    createdAt: '2026-09-20T12:00:00Z'
  },

  // ==========================================
  // JUEVES 1 DE OCTUBRE
  // ==========================================
  {
    id: 'act-oct-01-1',
    title: 'Trabajo',
    categoryId: 'trabajo',
    date: '2026-10-01',
    startTime: '07:00',
    endTime: '15:00',
    locationId: 'syte-alcantarilla',
    locationName: 'SYTE Automation SL',
    locationCity: 'Alcantarilla',
    travelBeforeMinutes: 30,
    returnTravelTransition: {
      departureEstimate: '~15:05',
      arrivalEstimate: '~15:40–15:45',
      toLocation: 'Bullas'
    },
    certainty: 'confirmed',
    createdAt: '2026-09-25T08:00:00Z'
  },

  // ==========================================
  // VIERNES 2 DE OCTUBRE
  // ==========================================
  {
    id: 'act-oct-02-1',
    title: 'Trabajo',
    categoryId: 'trabajo',
    date: '2026-10-02',
    startTime: '07:00',
    endTime: '15:00',
    locationId: 'syte-alcantarilla',
    locationName: 'SYTE Automation SL',
    locationCity: 'Alcantarilla',
    travelBeforeMinutes: 30,
    returnTravelTransition: {
      departureEstimate: '~15:05',
      arrivalEstimate: '~15:40–15:45',
      toLocation: 'Bullas'
    },
    certainty: 'confirmed',
    createdAt: '2026-09-25T08:00:00Z'
  },
  {
    id: 'act-oct-02-2',
    title: 'Entrenamiento',
    categoryId: 'balonmano',
    date: '2026-10-02',
    startTime: '19:15',
    endTime: '21:00',
    locationId: 'pabellon-bullas',
    locationName: 'Pabellón Juan Valera',
    locationCity: 'Bullas',
    certainty: 'confirmed',
    isRecurrent: true,
    recurrencePattern: 'Viernes 19:15–21:00',
    notes: 'Senior Femenino.',
    createdAt: '2026-09-20T12:00:00Z'
  },

  // ==========================================
  // FORMACIÓN DE EMPRESA (6, 7, 9, 12 Octubre)
  // ==========================================
  {
    id: 'act-oct-06-formacion',
    title: 'Formación Empresa (1/4)',
    categoryId: 'trabajo',
    date: '2026-10-06',
    startTime: '16:00',
    endTime: '21:00',
    isTimePending: true,
    timeNote: '16:00–21:00 aprox. (provisional)',
    locationName: 'SYTE Automation SL',
    locationCity: 'Alcantarilla',
    certainty: 'pending_time',
    certaintyNote: 'Horario provisional',
    createdAt: '2026-09-24T09:00:00Z'
  },
  {
    id: 'act-oct-07-formacion',
    title: 'Formación Empresa (2/4)',
    categoryId: 'trabajo',
    date: '2026-10-07',
    startTime: '16:00',
    endTime: '21:00',
    isTimePending: true,
    timeNote: '16:00–21:00 aprox. (provisional)',
    locationName: 'SYTE Automation SL',
    locationCity: 'Alcantarilla',
    certainty: 'pending_time',
    createdAt: '2026-09-24T09:00:00Z'
  },
  {
    id: 'act-oct-09-formacion',
    title: 'Formación Empresa (3/4)',
    categoryId: 'trabajo',
    date: '2026-10-09',
    startTime: '16:00',
    endTime: '21:00',
    isTimePending: true,
    timeNote: '16:00–21:00 aprox. (provisional)',
    locationName: 'SYTE Automation SL',
    locationCity: 'Alcantarilla',
    certainty: 'pending_time',
    createdAt: '2026-09-24T09:00:00Z'
  },

  // ==========================================
  // PARTIDO BULLENSE VS SAN LORENZO (10 de Octubre)
  // ==========================================
  {
    id: 'act-oct-10-partido',
    title: 'Bullense - San Lorenzo',
    categoryId: 'balonmano',
    date: '2026-10-10',
    startTime: '18:00',
    endTime: '19:45',
    isSportMatch: true,
    teamCode: 'BUL',
    isHomeMatch: true,
    opponent: 'San Lorenzo',
    locationId: 'pabellon-bullas',
    locationName: 'Pabellón Juan Valera',
    locationCity: 'Bullas',
    preparationMinutes: 60,
    certainty: 'confirmed',
    notes: 'Liga Senior Femenina. Convocatoria a las 17:00.',
    createdAt: '2026-09-22T11:00:00Z'
  },

  // ==========================================
  // FORMACIÓN EMPRESA (12 Octubre)
  // ==========================================
  {
    id: 'act-oct-12-formacion',
    title: 'Formación Empresa (4/4)',
    categoryId: 'trabajo',
    date: '2026-10-12',
    startTime: '16:00',
    endTime: '21:00',
    isTimePending: true,
    timeNote: '16:00–21:00 aprox. (provisional)',
    locationName: 'SYTE Automation SL',
    locationCity: 'Alcantarilla',
    certainty: 'pending_time',
    createdAt: '2026-09-24T09:00:00Z'
  },

  // ==========================================
  // INGLÉS B2 + SOLAPE ACEPTADO CON ENTRENAMIENTO (14 de Octubre)
  // ==========================================
  {
    id: 'act-oct-14-ingles',
    title: 'Inglés B2',
    categoryId: 'ingles',
    date: '2026-10-14',
    startTime: '19:30',
    endTime: '21:00',
    locationId: 'academia-bullas',
    locationName: 'Academia Método',
    locationCity: 'Bullas',
    certainty: 'confirmed',
    isRecurrent: true,
    recurrencePattern: 'Lunes y Miércoles 19:30–21:00',
    knownOverlap: {
      withActivityTitle: 'Entrenamiento (20:30–22:00)',
      accepted: true,
      planNote: 'Salir a las 20:45 vestida para entrenar. <5 min a Pabellón Juan Valera, llegada ~20:50.'
    },
    notes: 'Inicio B2 en Academia Método.',
    createdAt: '2026-09-25T15:00:00Z'
  },
  {
    id: 'act-oct-14-entreno',
    title: 'Entrenamiento',
    categoryId: 'balonmano',
    date: '2026-10-14',
    startTime: '20:30',
    endTime: '22:00',
    locationId: 'pabellon-bullas',
    locationName: 'Pabellón Juan Valera',
    locationCity: 'Bullas',
    certainty: 'confirmed',
    isRecurrent: true,
    recurrencePattern: 'Lunes 20:30–22:00',
    knownOverlap: {
      withActivityTitle: 'Inglés B2 (19:30–21:00)',
      accepted: true,
      planNote: 'Incorporación a las 20:50 tras salir de Academia Método a las 20:45.'
    },
    createdAt: '2026-09-25T15:00:00Z'
  },

  // ==========================================
  // DENTISTA (15 de Octubre)
  // ==========================================
  {
    id: 'act-oct-15-dentista',
    title: 'Dentista (Limpieza)',
    categoryId: 'personal',
    date: '2026-10-15',
    isTimePending: true,
    timeNote: 'Hora por concretar',
    locationName: 'Clínica Dental',
    locationCity: 'Bullas',
    certainty: 'probable',
    certaintyNote: 'Día probable. Pendiente de confirmar hora.',
    createdAt: '2026-09-26T18:00:00Z'
  },

  // ==========================================
  // VIAJE DE TRABAJO GALICIA / JEALSA (19 - 31 Octubre)
  // ==========================================
  {
    id: 'act-oct-19-viaje',
    title: 'Viaje Galicia (JEALSA)',
    categoryId: 'viaje',
    date: '2026-10-19',
    endDate: '2026-10-31',
    isAllDay: true,
    isTrip: true,
    certainty: 'probable',
    certaintyNote: 'Probable. Puesta en marcha pendiente de validación de fechas por el cliente.',
    tripImpacts: [
      'Entrenamientos (L/X/V): marcar excepción en fechas de viaje',
      'Inglés B2 (L/X): clases presenciales no asistidas',
      'Gimnasio: adaptar según disponibilidad'
    ],
    locationName: 'JEALSA',
    locationCity: 'Boiro',
    createdAt: '2026-09-28T09:00:00Z'
  },

  // ==========================================
  // CUMPLEAÑOS (1 de Diciembre)
  // ==========================================
  {
    id: 'act-dec-01-cumple',
    title: 'Cumpleaños',
    categoryId: 'personal',
    date: '2026-12-01',
    isAllDay: true,
    isRecurrent: true,
    recurrencePattern: 'Anual (1 de Diciembre)',
    certainty: 'confirmed',
    createdAt: '2026-09-01T00:00:00Z'
  }
];

// ==========================================
// GIMNASIO: 4 SESIONES FLEXIBLES (Torso/Pierna F2)
// Sin imposición de días u horas fijas
// ==========================================
export const INITIAL_GYM_SESSIONS: FlexibleGymSession[] = [
  {
    id: 'gym-s1',
    split: 'Torso 1',
    sequenceNumber: 1,
    preferredDurationMinutes: 90,
    completed: true,
    completedAt: '2026-09-28T18:00:00',
    notes: 'Realizada el lunes.'
  },
  {
    id: 'gym-s2',
    split: 'Pierna 1',
    sequenceNumber: 2,
    preferredDurationMinutes: 90,
    completed: false,
    notes: 'Por encajar en la semana (~1h – 1h 30 min)'
  },
  {
    id: 'gym-s3',
    split: 'Torso 2',
    sequenceNumber: 3,
    preferredDurationMinutes: 90,
    completed: false,
    notes: 'Por encajar en la semana (~1h – 1h 30 min)'
  },
  {
    id: 'gym-s4',
    split: 'Pierna 2',
    sequenceNumber: 4,
    preferredDurationMinutes: 75,
    completed: false,
    notes: 'Por encajar en la semana (~1h – 1h 30 min)'
  }
];

// ==========================================
// PROYECTOS: TFG
// Proyecto pendiente sin horarios ni horas forzadas
// ==========================================
export const INITIAL_PROJECTS: PlanningProject[] = [
  {
    id: 'proj-tfg',
    title: 'TFG',
    category: 'Estudios',
    targetDate: 'Junio 2027 (aproximada)',
    statusDescription: 'Proyecto pendiente en definición conceptual (relacionado con la empresa). Sin planificación fija.',
    notes: 'Más adelante se decidirá la organización y se crearán bloques temporales cuando se decida avanzar.'
  }
];

export const INITIAL_WEEKLY_SUMMARY: WeeklyPlanningSummary = {
  weekNumber: 40,
  weekStart: '2026-09-28',
  weekEnd: '2026-10-04',
  totalAvailableFreeHours: 18.5,
  gymSessionsTarget: 4,
  gymSessionsPlanned: 1,
  gymSessionsCompleted: 1
};
