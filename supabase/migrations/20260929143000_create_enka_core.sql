-- ==============================================================================
-- MIGRATION: 20260929143000_create_enka_core.sql (v2.1.1)
-- DESCRIPTION: Core Data Model for ENKA (Personal Time & Availability Organizer)
-- CONTEXT: Shared Supabase instance with PocketFlow.
-- REVISION v2.1.1 HIGHLIGHTS:
--   1. Nullable start_date strictly representing "fecha exacta de inicio conocida".
--   2. Date presence constraint ensuring an activity has either exact start_date OR full start window.
--   3. Adapted date comparison constraints for nullable start_date.
--   4. Zero artificial "reference dates".
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 0. UTILITY FUNCTION FOR UPDATED_AT (ENKA SCOPED & SECURE)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enka_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ------------------------------------------------------------------------------
-- 1. CATEGORIES (enka_categories)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.enka_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text NOT NULL,
  icon_name text NOT NULL DEFAULT 'Tag',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_enka_categories_user_id_id UNIQUE (user_id, id)
);

ALTER TABLE public.enka_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own enka categories"
  ON public.enka_categories
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER set_enka_categories_updated_at
  BEFORE UPDATE ON public.enka_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.enka_set_updated_at();

-- ------------------------------------------------------------------------------
-- 2. LOCATIONS (enka_locations)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.enka_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text,
  city text,
  region text,
  country text DEFAULT 'España',
  latitude double precision,
  longitude double precision,
  provider text, -- e.g. 'google', 'osm', 'manual'
  provider_place_id text,
  is_private boolean NOT NULL DEFAULT false, -- e.g. Casa (exact address hidden from casual display)
  is_home_base boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_enka_locations_user_id_id UNIQUE (user_id, id),
  CONSTRAINT chk_enka_locations_latitude CHECK (latitude IS NULL OR (latitude >= -90.0 AND latitude <= 90.0)),
  CONSTRAINT chk_enka_locations_longitude CHECK (longitude IS NULL OR (longitude >= -180.0 AND longitude <= 180.0))
);

ALTER TABLE public.enka_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own enka locations"
  ON public.enka_locations
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER set_enka_locations_updated_at
  BEFORE UPDATE ON public.enka_locations
  FOR EACH ROW
  EXECUTE FUNCTION public.enka_set_updated_at();

-- ------------------------------------------------------------------------------
-- 3. PROJECTS (enka_projects)
-- Structured target date (e.g. target_year=2027, target_month=6 -> "Junio 2027")
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.enka_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  target_year integer,
  target_month integer,
  target_day integer,
  target_precision text NOT NULL DEFAULT 'month', -- 'year', 'quarter', 'month', 'exact', 'none'
  target_label text, -- e.g. 'Junio 2027' (display text)
  target_date_exact date, -- Optional formal calendar date
  status text NOT NULL DEFAULT 'backlog',
  description text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_enka_projects_user_id_id UNIQUE (user_id, id),
  CONSTRAINT chk_enka_projects_status CHECK (status IN ('backlog', 'active', 'paused', 'completed')),
  CONSTRAINT chk_enka_projects_precision CHECK (target_precision IN ('year', 'quarter', 'month', 'exact', 'none')),
  CONSTRAINT chk_enka_projects_month CHECK (target_month IS NULL OR (target_month >= 1 AND target_month <= 12)),
  CONSTRAINT chk_enka_projects_day CHECK (target_day IS NULL OR (target_day >= 1 AND target_day <= 31))
);

ALTER TABLE public.enka_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own enka projects"
  ON public.enka_projects
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER set_enka_projects_updated_at
  BEFORE UPDATE ON public.enka_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.enka_set_updated_at();

-- ------------------------------------------------------------------------------
-- 4. PLANNING GOALS (enka_planning_goals)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.enka_planning_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL, -- e.g. 'Gimnasio'
  period text NOT NULL DEFAULT 'weekly',
  target_count integer NOT NULL DEFAULT 4,
  min_duration_minutes integer, -- e.g. 60 min (~1h)
  preferred_duration_minutes integer, -- e.g. 90 min (~1.5h)
  max_duration_minutes integer, -- e.g. 120 min (~2h)
  category_id uuid,
  project_id uuid,
  routine_structure jsonb DEFAULT '[]'::jsonb, -- e.g. ["Torso 1", "Pierna 1", "Torso 2", "Pierna 2"]
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_enka_planning_goals_user_id_id UNIQUE (user_id, id),
  CONSTRAINT fk_enka_goals_category FOREIGN KEY (user_id, category_id) REFERENCES public.enka_categories(user_id, id) ON DELETE SET NULL (category_id),
  CONSTRAINT fk_enka_goals_project FOREIGN KEY (user_id, project_id) REFERENCES public.enka_projects(user_id, id) ON DELETE SET NULL (project_id),
  CONSTRAINT chk_enka_planning_goals_period CHECK (period IN ('weekly', 'monthly', 'custom')),
  CONSTRAINT chk_enka_planning_goals_target_count CHECK (target_count > 0),
  CONSTRAINT chk_enka_planning_goals_durations CHECK (
    (min_duration_minutes IS NULL OR min_duration_minutes >= 0) AND
    (preferred_duration_minutes IS NULL OR preferred_duration_minutes >= 0) AND
    (max_duration_minutes IS NULL OR max_duration_minutes >= 0) AND
    (min_duration_minutes IS NULL OR preferred_duration_minutes IS NULL OR min_duration_minutes <= preferred_duration_minutes) AND
    (preferred_duration_minutes IS NULL OR max_duration_minutes IS NULL OR preferred_duration_minutes <= max_duration_minutes)
  )
);

ALTER TABLE public.enka_planning_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own enka planning goals"
  ON public.enka_planning_goals
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER set_enka_planning_goals_updated_at
  BEFORE UPDATE ON public.enka_planning_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.enka_set_updated_at();

-- ------------------------------------------------------------------------------
-- 5. RECURRENCE RULES (enka_recurrence_rules)
-- Supports Weekly, Daily, Monthly (day of month) and Yearly (e.g. Birthday 1 Dec)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.enka_recurrence_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL, -- e.g. 'Entrenamientos Senior Femenino', 'Trabajo SYTE', 'Cumpleaños'
  frequency text NOT NULL, -- 'daily', 'weekly', 'monthly', 'yearly'
  interval_count integer NOT NULL DEFAULT 1,
  by_month integer, -- 1..12 (for yearly recurrence, e.g. 12 = December)
  by_month_day integer, -- 1..31 (for monthly / yearly recurrence, e.g. 1 = 1st of month)
  by_weekdays integer[], -- Optional shorthand for simple weekly rules [1..7]
  start_date date NOT NULL,
  end_date date, -- Nullable for ongoing commitments
  is_active boolean NOT NULL DEFAULT true, -- Soft toggle to preserve historical exceptions
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_enka_recurrence_rules_user_id_id UNIQUE (user_id, id),
  CONSTRAINT chk_enka_recurrence_rules_freq CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  CONSTRAINT chk_enka_recurrence_rules_interval CHECK (interval_count > 0),
  CONSTRAINT chk_enka_recurrence_rules_dates CHECK (end_date IS NULL OR end_date >= start_date),
  CONSTRAINT chk_enka_recurrence_rules_month CHECK (by_month IS NULL OR (by_month >= 1 AND by_month <= 12)),
  CONSTRAINT chk_enka_recurrence_rules_month_day CHECK (by_month_day IS NULL OR (by_month_day >= 1 AND by_month_day <= 31))
);

ALTER TABLE public.enka_recurrence_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own enka recurrence rules"
  ON public.enka_recurrence_rules
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER set_enka_recurrence_rules_updated_at
  BEFORE UPDATE ON public.enka_recurrence_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.enka_set_updated_at();

-- ------------------------------------------------------------------------------
-- 6. RECURRENCE SLOTS (enka_recurrence_slots)
-- Allows a single weekly rule (e.g. Entrenamientos) to have DIFFERENT times per day:
-- Lunes 20:30–22:00, Miércoles 20:30–21:50, Viernes 19:15–21:00.
-- Composite UNIQUE (user_id, recurrence_rule_id, id) guarantees slot-to-rule integrity.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.enka_recurrence_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recurrence_rule_id uuid NOT NULL,
  weekday integer NOT NULL, -- 1=Lunes .. 7=Domingo
  start_time time without time zone,
  end_time time without time zone,
  is_end_time_unknown boolean NOT NULL DEFAULT false,
  location_id uuid,
  prep_before_minutes integer DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_enka_recurrence_slots_user_id_id UNIQUE (user_id, id),
  CONSTRAINT uq_enka_recurrence_slots_rule_slot UNIQUE (user_id, recurrence_rule_id, id),
  CONSTRAINT fk_enka_slots_rule FOREIGN KEY (user_id, recurrence_rule_id) REFERENCES public.enka_recurrence_rules(user_id, id) ON DELETE RESTRICT,
  CONSTRAINT fk_enka_slots_location FOREIGN KEY (user_id, location_id) REFERENCES public.enka_locations(user_id, id) ON DELETE SET NULL (location_id),
  CONSTRAINT chk_enka_slots_weekday CHECK (weekday >= 1 AND weekday <= 7),
  CONSTRAINT chk_enka_slots_prep CHECK (prep_before_minutes >= 0),
  CONSTRAINT chk_enka_slots_times CHECK (
    is_end_time_unknown = true OR
    start_time IS NULL OR
    end_time IS NULL OR
    end_time >= start_time
  )
);

ALTER TABLE public.enka_recurrence_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own enka recurrence slots"
  ON public.enka_recurrence_slots
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER set_enka_recurrence_slots_updated_at
  BEFORE UPDATE ON public.enka_recurrence_slots
  FOR EACH ROW
  EXECUTE FUNCTION public.enka_set_updated_at();

-- ------------------------------------------------------------------------------
-- 7. ACTIVITIES (enka_activities)
-- Clean core representing events, single occurrences, templates and trips.
-- start_date is NULLABLE: represents exclusively "fecha exacta de inicio conocida".
-- chk_enka_activities_date_presence ensures either exact start_date OR complete start window.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.enka_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  category_id uuid,
  location_id uuid,
  project_id uuid,
  recurrence_rule_id uuid,
  planning_goal_id uuid,

  -- Date & Date Uncertainty representation
  start_date date,          -- Exact start date when known (nullable)
  end_date date,            -- Exact multi-day end date when known (nullable)
  start_window_start_date date, -- Start window uncertainty lower bound (e.g. Sábado)
  start_window_end_date date,   -- Start window uncertainty upper bound (e.g. Domingo)
  end_window_start_date date,   -- End window uncertainty lower bound (e.g. 30 Oct en viaje Galicia)
  end_window_end_date date,     -- End window uncertainty upper bound (e.g. 31 Oct en viaje Galicia)
  is_date_pending boolean NOT NULL DEFAULT false, -- True when exact date is not yet fixed

  -- Time & Time Uncertainty representation
  start_time time without time zone,
  end_time time without time zone,
  window_start_time time without time zone,
  window_end_time time without time zone,
  is_all_day boolean NOT NULL DEFAULT false,
  is_end_time_unknown boolean NOT NULL DEFAULT false, -- Start known, end unknown (Peluquería 17:00)
  is_time_pending boolean NOT NULL DEFAULT false, -- Date known, exact hour pending (Partido federativo)
  time_note text, -- e.g. "Horario aproximado", "Fin no cerrado"

  -- Certainty & Status
  certainty text NOT NULL DEFAULT 'confirmed',
  certainty_note text,
  status text NOT NULL DEFAULT 'scheduled',

  -- Activity-intrinsic logistics (e.g. call time before match)
  prep_before_minutes integer DEFAULT 0,

  -- Domain Metadata (e.g. Sports match details, opponent, travel notes)
  metadata jsonb DEFAULT '{}'::jsonb,
  notes text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT uq_enka_activities_user_id_id UNIQUE (user_id, id),
  CONSTRAINT fk_enka_activities_category FOREIGN KEY (user_id, category_id) REFERENCES public.enka_categories(user_id, id) ON DELETE SET NULL (category_id),
  CONSTRAINT fk_enka_activities_location FOREIGN KEY (user_id, location_id) REFERENCES public.enka_locations(user_id, id) ON DELETE SET NULL (location_id),
  CONSTRAINT fk_enka_activities_project FOREIGN KEY (user_id, project_id) REFERENCES public.enka_projects(user_id, id) ON DELETE SET NULL (project_id),
  CONSTRAINT fk_enka_activities_rule FOREIGN KEY (user_id, recurrence_rule_id) REFERENCES public.enka_recurrence_rules(user_id, id) ON DELETE SET NULL (recurrence_rule_id),
  CONSTRAINT fk_enka_activities_goal FOREIGN KEY (user_id, planning_goal_id) REFERENCES public.enka_planning_goals(user_id, id) ON DELETE SET NULL (planning_goal_id),
  CONSTRAINT chk_enka_activities_certainty CHECK (certainty IN ('confirmed', 'probable', 'pending', 'conditional')),
  CONSTRAINT chk_enka_activities_status CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),

  -- Date Presence: Must have exact start_date OR a full start window (start_window_start + start_window_end)
  CONSTRAINT chk_enka_activities_date_presence CHECK (
    start_date IS NOT NULL OR (start_window_start_date IS NOT NULL AND start_window_end_date IS NOT NULL)
  ),

  -- Date Bounds Consistency (safely handles start_date IS NULL)
  CONSTRAINT chk_enka_activities_dates CHECK (
    start_date IS NULL OR end_date IS NULL OR end_date >= start_date
  ),
  CONSTRAINT chk_enka_activities_start_window CHECK (
    start_window_start_date IS NULL OR start_window_end_date IS NULL OR start_window_end_date >= start_window_start_date
  ),
  CONSTRAINT chk_enka_activities_end_window CHECK (
    end_window_start_date IS NULL OR end_window_end_date IS NULL OR end_window_end_date >= end_window_start_date
  ),
  CONSTRAINT chk_enka_activities_end_window_after_start CHECK (
    (start_date IS NULL OR end_window_start_date IS NULL OR end_window_start_date >= start_date) AND
    (start_window_start_date IS NULL OR end_window_start_date IS NULL OR end_window_start_date >= start_window_start_date)
  ),

  -- Times Consistency
  CONSTRAINT chk_enka_activities_times CHECK (
    is_end_time_unknown = true OR
    start_time IS NULL OR
    end_time IS NULL OR
    end_time >= start_time
  ),
  CONSTRAINT chk_enka_activities_time_window CHECK (
    window_start_time IS NULL OR window_end_time IS NULL OR window_end_time >= window_start_time
  ),
  CONSTRAINT chk_enka_activities_prep CHECK (prep_before_minutes >= 0)
);

ALTER TABLE public.enka_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own enka activities"
  ON public.enka_activities
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER set_enka_activities_updated_at
  BEFORE UPDATE ON public.enka_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.enka_set_updated_at();

-- ------------------------------------------------------------------------------
-- 8. ROUTE ESTIMATES CACHE (enka_route_estimates)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.enka_route_estimates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  origin_location_id uuid NOT NULL,
  destination_location_id uuid NOT NULL,
  travel_mode text NOT NULL DEFAULT 'driving', -- 'driving', 'walking', 'transit', 'bicycling'
  duration_seconds integer, -- Nullable when only range is known
  duration_min_seconds integer,
  duration_max_seconds integer,
  distance_meters integer,
  provider text NOT NULL DEFAULT 'manual', -- 'google', 'osm', 'manual'
  calculated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_enka_route_estimates_user_id_id UNIQUE (user_id, id),
  CONSTRAINT uq_enka_route_pair UNIQUE (user_id, origin_location_id, destination_location_id, travel_mode),
  CONSTRAINT fk_enka_routes_origin FOREIGN KEY (user_id, origin_location_id) REFERENCES public.enka_locations(user_id, id) ON DELETE CASCADE,
  CONSTRAINT fk_enka_routes_destination FOREIGN KEY (user_id, destination_location_id) REFERENCES public.enka_locations(user_id, id) ON DELETE CASCADE,
  CONSTRAINT chk_enka_route_distinct_locations CHECK (origin_location_id <> destination_location_id),
  CONSTRAINT chk_enka_route_mode CHECK (travel_mode IN ('driving', 'walking', 'transit', 'bicycling')),
  CONSTRAINT chk_enka_route_durations CHECK (
    (duration_seconds IS NULL OR duration_seconds >= 0) AND
    (duration_min_seconds IS NULL OR duration_min_seconds >= 0) AND
    (duration_max_seconds IS NULL OR duration_max_seconds >= 0) AND
    (duration_min_seconds IS NULL OR duration_max_seconds IS NULL OR duration_min_seconds <= duration_max_seconds) AND
    (duration_seconds IS NULL OR duration_min_seconds IS NULL OR duration_min_seconds <= duration_seconds) AND
    (duration_seconds IS NULL OR duration_max_seconds IS NULL OR duration_seconds <= duration_max_seconds)
  ),
  CONSTRAINT chk_enka_route_distance CHECK (distance_meters IS NULL OR distance_meters >= 0)
);

ALTER TABLE public.enka_route_estimates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own enka route estimates"
  ON public.enka_route_estimates
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER set_enka_route_estimates_updated_at
  BEFORE UPDATE ON public.enka_route_estimates
  FOR EACH ROW
  EXECUTE FUNCTION public.enka_set_updated_at();

-- ------------------------------------------------------------------------------
-- 9. TRANSITIONS & COMMUTES (enka_transitions)
-- departure_offset_minutes is SIGNED:
--   < 0 : Early exit before official end (e.g. -15 min from English to reach Handball)
--   = 0 : Exit exactly at official end
--   > 0 : Exit buffer after official end (e.g. +5 min from Work)
-- duration_estimated_minutes is NULLABLE (no false precision when only range is known)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.enka_transitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_activity_id uuid,
  to_activity_id uuid,
  origin_location_id uuid,
  destination_location_id uuid,
  route_estimate_id uuid,
  travel_mode text NOT NULL DEFAULT 'driving',
  departure_offset_minutes integer NOT NULL DEFAULT 0, -- SIGNED integer
  duration_estimated_minutes integer, -- Nullable when only min..max range is known
  duration_min_minutes integer,
  duration_max_minutes integer,
  arrival_estimate_time time without time zone,
  buffer_after_minutes integer NOT NULL DEFAULT 0, -- Time needed to settle (must be >= 0)
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_enka_transitions_user_id_id UNIQUE (user_id, id),
  CONSTRAINT fk_enka_transitions_from_act FOREIGN KEY (user_id, from_activity_id) REFERENCES public.enka_activities(user_id, id) ON DELETE CASCADE,
  CONSTRAINT fk_enka_transitions_to_act FOREIGN KEY (user_id, to_activity_id) REFERENCES public.enka_activities(user_id, id) ON DELETE SET NULL (to_activity_id),
  CONSTRAINT fk_enka_transitions_origin FOREIGN KEY (user_id, origin_location_id) REFERENCES public.enka_locations(user_id, id) ON DELETE SET NULL (origin_location_id),
  CONSTRAINT fk_enka_transitions_destination FOREIGN KEY (user_id, destination_location_id) REFERENCES public.enka_locations(user_id, id) ON DELETE SET NULL (destination_location_id),
  CONSTRAINT fk_enka_transitions_route FOREIGN KEY (user_id, route_estimate_id) REFERENCES public.enka_route_estimates(user_id, id) ON DELETE SET NULL (route_estimate_id),
  CONSTRAINT chk_enka_transitions_mode CHECK (travel_mode IN ('driving', 'walking', 'transit', 'bicycling')),
  CONSTRAINT chk_enka_transitions_buffer_after CHECK (buffer_after_minutes >= 0),
  CONSTRAINT chk_enka_transitions_durations CHECK (
    (duration_estimated_minutes IS NULL OR duration_estimated_minutes >= 0) AND
    (duration_min_minutes IS NULL OR duration_min_minutes >= 0) AND
    (duration_max_minutes IS NULL OR duration_max_minutes >= 0) AND
    (duration_min_minutes IS NULL OR duration_max_minutes IS NULL OR duration_min_minutes <= duration_max_minutes) AND
    (duration_estimated_minutes IS NULL OR duration_min_minutes IS NULL OR duration_min_minutes <= duration_estimated_minutes) AND
    (duration_estimated_minutes IS NULL OR duration_max_minutes IS NULL OR duration_estimated_minutes <= duration_max_minutes)
  )
);

ALTER TABLE public.enka_transitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own enka transitions"
  ON public.enka_transitions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER set_enka_transitions_updated_at
  BEFORE UPDATE ON public.enka_transitions
  FOR EACH ROW
  EXECUTE FUNCTION public.enka_set_updated_at();

-- ------------------------------------------------------------------------------
-- 10. OCCURRENCE EXCEPTIONS (enka_occurrence_exceptions)
-- Modifies or cancels a specific date occurrence of a recurrence rule / slot.
-- 1. NULLS NOT DISTINCT ensures uniqueness even when recurrence_slot_id is NULL.
-- 2. Composite FK (user_id, recurrence_rule_id, recurrence_slot_id) guarantees
--    that the slot belongs to the rule.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.enka_occurrence_exceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recurrence_rule_id uuid NOT NULL,
  recurrence_slot_id uuid, -- Optional reference to specific slot (e.g. Wednesday slot)
  original_date date NOT NULL, -- Date being modified
  exception_type text NOT NULL, -- 'cancelled', 'rescheduled', 'location_changed', 'overlap_accepted', 'skipped'
  override_start_date date,
  override_start_time time without time zone,
  override_end_time time without time zone,
  override_location_id uuid,
  reason text, -- e.g. "Viaje laboral JEALSA", "Entro más tarde a las 10:00"
  overlap_plan_note text, -- Specific agreement/strategy for this date
  custom_metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_enka_exceptions_user_id_id UNIQUE (user_id, id),
  CONSTRAINT uq_enka_exception_occurrence UNIQUE NULLS NOT DISTINCT (
    user_id, recurrence_rule_id, original_date, recurrence_slot_id
  ),
  CONSTRAINT fk_enka_exceptions_rule FOREIGN KEY (user_id, recurrence_rule_id) REFERENCES public.enka_recurrence_rules(user_id, id) ON DELETE RESTRICT,
  CONSTRAINT fk_enka_exceptions_slot FOREIGN KEY (user_id, recurrence_rule_id, recurrence_slot_id) REFERENCES public.enka_recurrence_slots(user_id, recurrence_rule_id, id) ON DELETE SET NULL (recurrence_slot_id),
  CONSTRAINT fk_enka_exceptions_location FOREIGN KEY (user_id, override_location_id) REFERENCES public.enka_locations(user_id, id) ON DELETE SET NULL (override_location_id),
  CONSTRAINT chk_enka_exceptions_type CHECK (exception_type IN ('cancelled', 'rescheduled', 'location_changed', 'overlap_accepted', 'skipped'))
);

ALTER TABLE public.enka_occurrence_exceptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own enka occurrence exceptions"
  ON public.enka_occurrence_exceptions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER set_enka_occurrence_exceptions_updated_at
  BEFORE UPDATE ON public.enka_occurrence_exceptions
  FOR EACH ROW
  EXECUTE FUNCTION public.enka_set_updated_at();

-- ------------------------------------------------------------------------------
-- 11. ACTIVITY RELATIONS & OVERLAPS (enka_activity_relations)
-- Single source of truth for semantic links and recurring intentional overlaps between activities.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.enka_activity_relations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_activity_id uuid NOT NULL,
  target_activity_id uuid NOT NULL,
  relation_type text NOT NULL, -- 'affects', 'blocks', 'overlaps_with', 'sub_activity_of', 'travel_for'
  resolution_strategy text, -- e.g. 'accepted_overlap', 'skip_target', 'reschedule_target'
  notes text, -- e.g. "Salgo a las 20:45 de inglés para llegar al entreno a las 20:50"
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_enka_relations_user_id_id UNIQUE (user_id, id),
  CONSTRAINT uq_enka_relation_pair UNIQUE (user_id, source_activity_id, target_activity_id, relation_type),
  CONSTRAINT fk_enka_relations_source FOREIGN KEY (user_id, source_activity_id) REFERENCES public.enka_activities(user_id, id) ON DELETE CASCADE,
  CONSTRAINT fk_enka_relations_target FOREIGN KEY (user_id, target_activity_id) REFERENCES public.enka_activities(user_id, id) ON DELETE CASCADE,
  CONSTRAINT chk_enka_relations_distinct CHECK (source_activity_id <> target_activity_id),
  CONSTRAINT chk_enka_relations_type CHECK (relation_type IN ('affects', 'blocks', 'overlaps_with', 'sub_activity_of', 'travel_for'))
);

ALTER TABLE public.enka_activity_relations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own enka activity relations"
  ON public.enka_activity_relations
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER set_enka_activity_relations_updated_at
  BEFORE UPDATE ON public.enka_activity_relations
  FOR EACH ROW
  EXECUTE FUNCTION public.enka_set_updated_at();

-- ------------------------------------------------------------------------------
-- 12. STRATEGIC USER-SCOPED INDEXES
-- ------------------------------------------------------------------------------
-- Activities: Date lookups and independent uncertainty windows
CREATE INDEX IF NOT EXISTS idx_enka_activities_user_dates
  ON public.enka_activities (user_id, start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_enka_activities_user_start_window
  ON public.enka_activities (user_id, start_window_start_date, start_window_end_date);

CREATE INDEX IF NOT EXISTS idx_enka_activities_user_end_window
  ON public.enka_activities (user_id, end_window_start_date, end_window_end_date);

CREATE INDEX IF NOT EXISTS idx_enka_activities_user_category
  ON public.enka_activities (user_id, category_id);

CREATE INDEX IF NOT EXISTS idx_enka_activities_user_location
  ON public.enka_activities (user_id, location_id);

CREATE INDEX IF NOT EXISTS idx_enka_activities_user_rule
  ON public.enka_activities (user_id, recurrence_rule_id);

CREATE INDEX IF NOT EXISTS idx_enka_activities_user_project
  ON public.enka_activities (user_id, project_id);

CREATE INDEX IF NOT EXISTS idx_enka_activities_user_goal
  ON public.enka_activities (user_id, planning_goal_id);

-- Recurrence slots lookup by rule
CREATE INDEX IF NOT EXISTS idx_enka_slots_user_rule_weekday
  ON public.enka_recurrence_slots (user_id, recurrence_rule_id, weekday);

-- Exceptions lookup by rule & date
CREATE INDEX IF NOT EXISTS idx_enka_exceptions_user_rule_date
  ON public.enka_occurrence_exceptions (user_id, recurrence_rule_id, original_date);

-- Transitions lookups
CREATE INDEX IF NOT EXISTS idx_enka_transitions_user_from_act
  ON public.enka_transitions (user_id, from_activity_id);

CREATE INDEX IF NOT EXISTS idx_enka_transitions_user_to_act
  ON public.enka_transitions (user_id, to_activity_id);

-- Activity relations graph lookups
CREATE INDEX IF NOT EXISTS idx_enka_relations_user_source
  ON public.enka_activity_relations (user_id, source_activity_id);

CREATE INDEX IF NOT EXISTS idx_enka_relations_user_target
  ON public.enka_activity_relations (user_id, target_activity_id);

-- Route estimates cache lookup
CREATE INDEX IF NOT EXISTS idx_enka_routes_user_lookup
  ON public.enka_route_estimates (user_id, origin_location_id, destination_location_id, travel_mode);
