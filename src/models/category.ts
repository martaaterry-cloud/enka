export interface Category {
  id: string;
  name: string;
  iconName: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'trabajo',
    name: 'Trabajo',
    iconName: 'Briefcase',
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.12)',
    borderColor: 'rgba(59, 130, 246, 0.28)'
  },
  {
    id: 'balonmano',
    name: 'Balonmano',
    iconName: 'Trophy',
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.28)'
  },
  {
    id: 'gimnasio',
    name: 'Gimnasio',
    iconName: 'Dumbbell',
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.28)'
  },
  {
    id: 'ingles',
    name: 'Inglés B2',
    iconName: 'Languages',
    color: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.12)',
    borderColor: 'rgba(139, 92, 246, 0.28)'
  },
  {
    id: 'estudios',
    name: 'TFG / Estudios',
    iconName: 'GraduationCap',
    color: '#EC4899',
    bgColor: 'rgba(236, 72, 153, 0.12)',
    borderColor: 'rgba(236, 72, 153, 0.28)'
  },
  {
    id: 'personal',
    name: 'Personal & Salud',
    iconName: 'Sparkles',
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.28)'
  },
  {
    id: 'viaje',
    name: 'Viajes / Desplazamientos',
    iconName: 'Plane',
    color: '#06B6D4',
    bgColor: 'rgba(6, 182, 212, 0.12)',
    borderColor: 'rgba(6, 182, 212, 0.28)'
  }
];
