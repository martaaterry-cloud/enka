export type CertaintyLevel = 'confirmed' | 'pending_time' | 'probable' | 'conditional';

export interface TravelTransition {
  fromLocation?: string;
  toLocation?: string;
  departureEstimate?: string; // e.g. "~15:05"
  arrivalEstimate?: string;   // e.g. "~15:40–15:45"
  durationEstimateMinutes?: number;
  mode?: 'car' | 'walk';
  notes?: string;
}

export interface Activity {
  id: string;
  title: string;
  categoryId: string;
  date: string; // Format: YYYY-MM-DD
  endDate?: string; // Multi-day trips
  startTime?: string; // Format: HH:mm (e.g. "07:00")
  endTime?: string;   // Format: HH:mm (e.g. "15:00")
  isAllDay?: boolean;
  isTimePending?: boolean; // When date is known but time is unknown/approximate
  isEndTimeUnknown?: boolean; // When start is known (e.g. Peluquería 17:00) but end is uncertain
  timeNote?: string;

  // Location
  locationId?: string;
  locationName?: string;
  locationCity?: string;
  
  // Real logistics & margins (Not false precision)
  travelBeforeMinutes?: number;
  travelAfterMinutes?: number;
  returnTravelTransition?: TravelTransition;
  preparationMinutes?: number;

  // Certainty State
  certainty: CertaintyLevel;
  certaintyNote?: string;

  // Known / Accepted Overlaps
  knownOverlap?: {
    withActivityTitle: string;
    accepted: boolean;
    planNote: string;
  };

  // Sport Specifics
  isSportMatch?: boolean;
  teamCode?: 'BUL' | string;
  isHomeMatch?: boolean;
  opponent?: string;

  // Trips & Impacts
  isTrip?: boolean;
  tripImpacts?: string[];

  // Recurrence
  isRecurrent?: boolean;
  recurrencePattern?: string;

  notes?: string;
  createdAt: string;
}

export interface TimeGap {
  id: string;
  approximateStart: string; // e.g. "aprox. 15:45"
  approximateEnd?: string;   // e.g. "17:00"
  durationDescription: string; // e.g. "~1 h 15 min disponible"
  locationCity?: string;
  notes?: string;
}
