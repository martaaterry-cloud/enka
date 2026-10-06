export interface DbCategory {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon_name: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbLocation {
  id: string;
  user_id: string;
  name: string;
  address: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  provider: string | null;
  provider_place_id: string | null;
  is_private: boolean;
  is_home_base: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbProject {
  id: string;
  user_id: string;
  title: string;
  target_year: number | null;
  target_month: number | null;
  target_day: number | null;
  target_precision: string;
  target_label: string | null;
  target_date_exact: string | null;
  status: string;
  description: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbPlanningGoal {
  id: string;
  user_id: string;
  title: string;
  period: string;
  target_count: number;
  min_duration_minutes: number | null;
  preferred_duration_minutes: number | null;
  max_duration_minutes: number | null;
  category_id: string | null;
  project_id: string | null;
  routine_structure: any[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbRecurrenceRule {
  id: string;
  user_id: string;
  title: string;
  frequency: string;
  interval_count: number;
  by_month: number | null;
  by_month_day: number | null;
  by_weekdays: number[] | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbRecurrenceSlot {
  id: string;
  user_id: string;
  recurrence_rule_id: string;
  weekday: number;
  start_time: string | null;
  end_time: string | null;
  is_end_time_unknown: boolean;
  location_id: string | null;
  prep_before_minutes: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbActivity {
  id: string;
  user_id: string;
  title: string;
  category_id: string | null;
  location_id: string | null;
  project_id: string | null;
  recurrence_rule_id: string | null;
  planning_goal_id: string | null;
  start_date: string | null;
  end_date: string | null;
  start_window_start_date: string | null;
  start_window_end_date: string | null;
  end_window_start_date: string | null;
  end_window_end_date: string | null;
  is_date_pending: boolean;
  start_time: string | null;
  end_time: string | null;
  window_start_time: string | null;
  window_end_time: string | null;
  is_all_day: boolean;
  is_end_time_unknown: boolean;
  is_time_pending: boolean;
  time_note: string | null;
  certainty: string;
  certainty_note: string | null;
  status: string;
  prep_before_minutes: number;
  metadata: Record<string, any>;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbRouteEstimate {
  id: string;
  user_id: string;
  origin_location_id: string;
  destination_location_id: string;
  travel_mode: string;
  duration_seconds: number | null;
  duration_min_seconds: number | null;
  duration_max_seconds: number | null;
  distance_meters: number | null;
  provider: string;
  calculated_at: string;
  created_at: string;
  updated_at: string;
}

export interface DbTransition {
  id: string;
  user_id: string;
  from_activity_id: string | null;
  to_activity_id: string | null;
  origin_location_id: string | null;
  destination_location_id: string | null;
  route_estimate_id: string | null;
  travel_mode: string;
  departure_offset_minutes: number;
  duration_estimated_minutes: number | null;
  duration_min_minutes: number | null;
  duration_max_minutes: number | null;
  arrival_estimate_time: string | null;
  buffer_after_minutes: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbOccurrenceException {
  id: string;
  user_id: string;
  recurrence_rule_id: string;
  recurrence_slot_id: string | null;
  original_date: string;
  exception_type: string;
  override_start_date: string | null;
  override_start_time: string | null;
  override_end_time: string | null;
  override_location_id: string | null;
  reason: string | null;
  overlap_plan_note: string | null;
  custom_metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DbActivityRelation {
  id: string;
  user_id: string;
  source_activity_id: string;
  target_activity_id: string;
  relation_type: string;
  resolution_strategy: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
