export interface LocationItem {
  id: string;
  name: string;
  city: string;
  defaultTravelFromHomeMinutes: number;
  isHomeBase?: boolean;
  notes?: string;
}

export const INITIAL_LOCATIONS: LocationItem[] = [
  {
    id: 'casa-bullas',
    name: 'Casa',
    city: 'Bullas',
    defaultTravelFromHomeMinutes: 0,
    isHomeBase: true,
    notes: 'Base principal.'
  },
  {
    id: 'syte-alcantarilla',
    name: 'SYTE Automation SL',
    city: 'Alcantarilla',
    defaultTravelFromHomeMinutes: 30,
    notes: 'Trayecto habitual ~30 min en coche.'
  },
  {
    id: 'pabellon-bullas',
    name: 'Pabellón Juan Valera',
    city: 'Bullas',
    defaultTravelFromHomeMinutes: 3,
    notes: 'Pabellón de entrenamientos y partidos locales en Bullas.'
  },
  {
    id: 'academia-bullas',
    name: 'Academia Método',
    city: 'Bullas',
    defaultTravelFromHomeMinutes: 4,
    notes: 'A menos de 5 min en coche de Pabellón Juan Valera.'
  },
  {
    id: 'gimnasio-bullas',
    name: 'Gimnasio Municipal',
    city: 'Bullas',
    defaultTravelFromHomeMinutes: 5,
    notes: 'Ubicación flexible para sesiones de fuerza.'
  }
];
