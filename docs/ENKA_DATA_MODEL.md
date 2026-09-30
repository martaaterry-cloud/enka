# Modelo de Datos de ENKA — V2.1.1 (Diseño Técnico & Arquitectura)

Este documento describe el esquema relacional definitivo para la primera fase de datos de **ENKA**, diseñado para convivir en el mismo proyecto Supabase que PocketFlow garantizando **aislamiento absoluto**, **integridad compuesta entre usuarios** y **modelado honesto de la realidad temporal**.

---

## 1. Principios Fundamentales del Modelo V2.1.1

1. **Aislamiento Estricto y Multi-Tenancy Seguro:**
   - Todas las tablas, funciones, triggers e índices están prefijados con `enka_`.
   - Claves foráneas compuestas con `(user_id, foreign_id)` garantizan la imposibilidad matemática de referencias cruzadas entre usuarios (Zero Cross-User References).
2. **`start_date` como Fecha Exacta Conocida (Sin Fechas de Referencia Artificiales):**
   - `start_date` en `enka_activities` es **nullable** y significa exclusivamente: **"fecha exacta de inicio conocida"**.
   - Si la fecha exacta es incierta (ej. un partido que se jugará en algún momento del fin de semana), `start_date = NULL` y se define la ventana completa (`start_window_start_date` y `start_window_end_date`).
   - Restricción `chk_enka_activities_date_presence`: toda actividad debe tener obligatoriamente o bien una `start_date` exacta o bien una ventana de inicio completa.
3. **Offsets de Salida con Signo (Signed Departure Offsets):**
   - `departure_offset_minutes` en `enka_transitions` es un entero con signo:
     - **Negativo ($<0$):** Salida anticipada antes del fin oficial (ej. salir a las 20:45 de una clase de inglés que termina a las 21:00 $\rightarrow$ `departure_offset_minutes = -15`).
     - **Cero ($=0$):** Salida exactamente a la hora oficial.
     - **Positivo ($>0$):** Salida habitual tras finalizar (ej. salir a las 15:05 de un trabajo que concluye a las 15:00 $\rightarrow$ `departure_offset_minutes = 5`).
4. **Incertidumbre Independiente de Inicio y Fin:**
   - Ventana de inicio (`start_window_start_date`, `start_window_end_date`): Para actividades cuya fecha de ocurrencia está en un rango pendiente (ej. Partido sábado–domingo).
   - Ventana de fin (`end_window_start_date`, `end_window_end_date`): Para actividades con inicio exacto conocido pero fecha de término abierta (ej. Viaje a Galicia del 19 al 30/31 de octubre).
5. **Integridad en Cascada de Columnas Específicas (`ON DELETE SET NULL (col)`):**
   - Todas las claves foráneas compuestas que usan `ON DELETE SET NULL` especifican de forma explícita la columna nullable afectada (ej. `ON DELETE SET NULL (category_id)`), preservando intacto `user_id NOT NULL`.
6. **Unicidad e Integridad de Excepciones:**
   - La restricción `UNIQUE NULLS NOT DISTINCT (user_id, recurrence_rule_id, original_date, recurrence_slot_id)` previene duplicidades incluso cuando `recurrence_slot_id` es `NULL`.
   - La clave foránea `(user_id, recurrence_rule_id, recurrence_slot_id)` garantiza que el slot referenciado pertenece forzosamente a la regla indicada.
   - Única fuente de verdad sin identificadores redundantes.
7. **Soporte Real de Recurrencias V1:**
   - Semanal con horarios variables por día (`enka_recurrence_rules` + `enka_recurrence_slots`).
   - Semanal estándar / diaria.
   - Anual / Mensual directa mediante `by_month` y `by_month_day` (ej. Cumpleaños el 1 de diciembre cada año).
8. **Duraciones sin Falsa Precisión:**
   - `duration_estimated_minutes` en `enka_transitions` es nullable. Cuando únicamente se conoce un rango (ej. trayecto de 30 a 45 min), no se fuerza un valor estimado inventado.

---

## 2. Diagrama Textual de Arquitectura Relacional

```text
                                 auth.users
                                     │
     ┌───────────────────┬───────────┴───────────┬───────────────────┬───────────────────┐
     │ 1:N               │ 1:N                   │ 1:N               │ 1:N               │ 1:N
     ▼                   ▼                       ▼                   ▼                   ▼
enka_categories     enka_locations         enka_projects     enka_recurrence     enka_planning_goals
 (user_id, id)       (user_id, id)         (user_id, id)         _rules             (user_id, id)
     │                   │                       │            (user_id, id)              │
     │                   │                       │                   │ 1:N               │
     │                   │                       │                   ▼                   │
     │                   │                       │         enka_recurrence_slots         │
     │                   │                       │      (user_id, rule_id, id)           │
     │                   │                       │                   │                   │
     └─────────────┬─────┴───────────────┬───────┴───────────┬───────┴───────────────────┘
                   │                     │                   │
                   ▼                     ▼                   ▼
              ┌────────────────────────────────────────────────────────┐
              │                    enka_activities                     │
              │                     (user_id, id)                      │
              └───────┬───────────────────┬───────────────────┬────────┘
                      │ 1:N               │ 1:N               │ 1:N
                      ▼                   ▼                   ▼
            enka_transitions     enka_occurrence     enka_activity
             (user_id, id)         _exceptions          _relations
                   │              (user_id, id)       (user_id, id)
                   ▼
         enka_route_estimates
             (user_id, id)
```

---

## 3. Catálogo de Tablas (11 Tablas)

### 3.1. `public.enka_categories`
- `id` (uuid, PK)
- `user_id` (uuid, FK `auth.users`)
- `name` (text), `color` (text), `icon_name` (text), `sort_order` (integer), `is_active` (boolean)
- `CONSTRAINT uq_enka_categories_user_id_id UNIQUE (user_id, id)`

### 3.2. `public.enka_locations`
- `id` (uuid, PK)
- `user_id` (uuid, FK `auth.users`)
- `name` (text), `address` (text, nullable), `city` (text), `region` (text), `country` (text)
- `latitude` / `longitude` (double precision, checks `-90..90` y `-180..180`)
- `provider` / `provider_place_id` (text)
- `is_private` (boolean), `is_home_base` (boolean), `notes` (text)
- `CONSTRAINT uq_enka_locations_user_id_id UNIQUE (user_id, id)`

### 3.3. `public.enka_projects`
- `id` (uuid, PK)
- `user_id` (uuid, FK `auth.users`)
- `title` (text)
- `target_year` (integer), `target_month` (integer), `target_day` (integer, nullable)
- `target_precision` ('year', 'quarter', 'month', 'exact', 'none')
- `target_label` (text, ej. "Junio 2027")
- `target_date_exact` (date, nullable)
- `status` ('backlog', 'active', 'paused', 'completed'), `description` (text), `notes` (text)
- `CONSTRAINT uq_enka_projects_user_id_id UNIQUE (user_id, id)`

### 3.4. `public.enka_planning_goals`
- `id` (uuid, PK)
- `user_id` (uuid, FK `auth.users`)
- `title` (text, ej. "Gimnasio")
- `period` ('weekly', 'monthly', 'custom'), `target_count` (integer)
- `min_duration_minutes`, `preferred_duration_minutes`, `max_duration_minutes` (integer, check `min <= pref <= max`)
- `category_id` (FK a `enka_categories` con `ON DELETE SET NULL (category_id)`)
- `project_id` (FK a `enka_projects` con `ON DELETE SET NULL (project_id)`)
- `routine_structure` (jsonb), `is_active` (boolean)
- `CONSTRAINT uq_enka_planning_goals_user_id_id UNIQUE (user_id, id)`

### 3.5. `public.enka_recurrence_rules`
- `id` (uuid, PK)
- `user_id` (uuid, FK `auth.users`)
- `title` (text)
- `frequency` ('daily', 'weekly', 'monthly', 'yearly'), `interval_count` (integer)
- `by_month` (integer 1..12), `by_month_day` (integer 1..31), `by_weekdays` (integer[])
- `start_date` (date), `end_date` (date, nullable), `is_active` (boolean), `notes` (text)
- `CONSTRAINT uq_enka_recurrence_rules_user_id_id UNIQUE (user_id, id)`

### 3.6. `public.enka_recurrence_slots`
- `id` (uuid, PK)
- `user_id` (uuid, FK `auth.users`)
- `recurrence_rule_id` (uuid)
- `weekday` (integer 1..7)
- `start_time`, `end_time` (time)
- `is_end_time_unknown` (boolean)
- `location_id` (FK a `enka_locations` con `ON DELETE SET NULL (location_id)`)
- `prep_before_minutes` (integer), `notes` (text)
- `CONSTRAINT uq_enka_recurrence_slots_user_id_id UNIQUE (user_id, id)`
- `CONSTRAINT uq_enka_recurrence_slots_rule_slot UNIQUE (user_id, recurrence_rule_id, id)`
- `CONSTRAINT fk_enka_slots_rule FOREIGN KEY (user_id, recurrence_rule_id) REFERENCES enka_recurrence_rules(user_id, id) ON DELETE RESTRICT`

### 3.7. `public.enka_activities`
- `id` (uuid, PK)
- `user_id` (uuid, FK `auth.users`)
- `title` (text)
- `category_id` / `location_id` / `project_id` / `recurrence_rule_id` / `planning_goal_id` (FKs compuestas con `ON DELETE SET NULL (col)`)
- **Fechas e incertidumbre:**
  - `start_date` (date, nullable — fecha exacta conocida)
  - `end_date` (date, nullable — fecha de fin exacta conocida)
  - `start_window_start_date` / `start_window_end_date` (date, nullable — ventana de inicio)
  - `end_window_start_date` / `end_window_end_date` (date, nullable — ventana de fin)
  - `is_date_pending` (boolean — true cuando la fecha exacta no está fijada)
- **Horarios e incertidumbre:**
  - `start_time` / `end_time` (time)
  - `window_start_time` / `window_end_time` (time)
  - `is_all_day` (boolean)
  - `is_end_time_unknown` (boolean — Peluquería 17:00 con fin no fijado)
  - `is_time_pending` (boolean — Día confirmado, hora pendiente de fijar)
  - `time_note` (text)
- **Certeza y Logística intrínseca:**
  - `certainty` ('confirmed', 'probable', 'pending', 'conditional'), `certainty_note` (text), `status` ('scheduled', 'in_progress', 'completed', 'cancelled')
  - `prep_before_minutes` (integer, ej. 60 min de convocatoria previa)
  - `metadata` (jsonb), `notes` (text)
- `CONSTRAINT uq_enka_activities_user_id_id UNIQUE (user_id, id)`
- `CONSTRAINT chk_enka_activities_date_presence CHECK (start_date IS NOT NULL OR (start_window_start_date IS NOT NULL AND start_window_end_date IS NOT NULL))`

### 3.8. `public.enka_route_estimates`
- `id` (uuid, PK)
- `user_id` (uuid, FK `auth.users`)
- `origin_location_id` / `destination_location_id` (FKs a `enka_locations` con `ON DELETE CASCADE`)
- `travel_mode` ('driving', 'walking', 'transit', 'bicycling')
- `duration_seconds` (integer, nullable), `duration_min_seconds` / `duration_max_seconds` (integer)
- `distance_meters` (integer), `provider` (text), `calculated_at` (timestamptz)
- `CONSTRAINT uq_enka_route_pair UNIQUE (user_id, origin_location_id, destination_location_id, travel_mode)`

### 3.9. `public.enka_transitions`
- `id` (uuid, PK)
- `user_id` (uuid, FK `auth.users`)
- `from_activity_id` (FK a `enka_activities` con `ON DELETE CASCADE`)
- `to_activity_id` (FK a `enka_activities` con `ON DELETE SET NULL (to_activity_id)`)
- `origin_location_id` / `destination_location_id` (FKs a `enka_locations` con `ON DELETE SET NULL (col)`)
- `route_estimate_id` (FK a `enka_route_estimates` con `ON DELETE SET NULL (route_estimate_id)`)
- `travel_mode` (text, default 'driving')
- `departure_offset_minutes` (integer NOT NULL DEFAULT 0 — entero con signo)
- `duration_estimated_minutes` (integer, nullable)
- `duration_min_minutes` / `duration_max_minutes` (integer, nullable)
- `arrival_estimate_time` (time, nullable)
- `buffer_after_minutes` (integer NOT NULL DEFAULT 0, check `>= 0`)
- `notes` (text)
- `CONSTRAINT uq_enka_transitions_user_id_id UNIQUE (user_id, id)`

### 3.10. `public.enka_occurrence_exceptions`
- `id` (uuid, PK)
- `user_id` (uuid, FK `auth.users`)
- `recurrence_rule_id` (uuid)
- `recurrence_slot_id` (uuid, nullable)
- `original_date` (date NOT NULL)
- `exception_type` ('cancelled', 'rescheduled', 'location_changed', 'overlap_accepted', 'skipped')
- `override_start_date` / `override_start_time` / `override_end_time` (time/date)
- `override_location_id` (FK a `enka_locations` con `ON DELETE SET NULL (override_location_id)`)
- `reason` (text), `overlap_plan_note` (text), `custom_metadata` (jsonb)
- `CONSTRAINT uq_enka_exception_occurrence UNIQUE NULLS NOT DISTINCT (user_id, recurrence_rule_id, original_date, recurrence_slot_id)`
- `CONSTRAINT fk_enka_exceptions_rule FOREIGN KEY (user_id, recurrence_rule_id) REFERENCES enka_recurrence_rules(user_id, id) ON DELETE RESTRICT`
- `CONSTRAINT fk_enka_exceptions_slot FOREIGN KEY (user_id, recurrence_rule_id, recurrence_slot_id) REFERENCES enka_recurrence_slots(user_id, recurrence_rule_id, id) ON DELETE SET NULL (recurrence_slot_id)`

### 3.11. `public.enka_activity_relations`
- `id` (uuid, PK)
- `user_id` (uuid, FK `auth.users`)
- `source_activity_id` / `target_activity_id` (FKs a `enka_activities` con `ON DELETE CASCADE`)
- `relation_type` ('affects', 'blocks', 'overlaps_with', 'sub_activity_of', 'travel_for')
- `resolution_strategy` (text, ej. 'accepted_overlap', 'skip_target')
- `notes` (text)
- `CONSTRAINT uq_enka_relation_pair UNIQUE (user_id, source_activity_id, target_activity_id, relation_type)`

---

## 4. Ejemplos Concretos de Casos Reales

### 4.1. Trabajo SYTE Automation SL
- **`enka_activities`:**
  - `title` = "Trabajo en SYTE Automation SL"
  - `start_date` = `'2026-09-29'` (fecha exacta conocida)
  - `start_time` = `07:00`, `end_time` = `15:00`
  - `location_id` = ID Alcantarilla
- **`enka_transitions`:**
  - `from_activity_id` = ID Trabajo
  - `destination_location_id` = ID Casa (Bullas)
  - `departure_offset_minutes` = `+5` (salida real ~15:05)
  - `duration_min_minutes` = `30`, `duration_max_minutes` = `45`
  - `duration_estimated_minutes` = `35`
  - `arrival_estimate_time` = `15:45`
  - `notes` = "Llegada habitual ~15:40–15:45"

### 4.2. Inglés Academia Método
- **`enka_activities`:**
  - `title` = "Inglés B2 (Academia Método)"
  - `start_date` = `'2026-10-14'` (fecha exacta conocida)
  - `start_time` = `19:30`, `end_time` = `21:00`
  - `location_id` = ID Academia Método
- **`enka_transitions` (hacia Pabellón los lunes):**
  - `from_activity_id` = ID Inglés
  - `destination_location_id` = ID Pabellón Juan Valera
  - `departure_offset_minutes` = `-15` (salida personal prevista a las ~20:45)
  - `duration_min_minutes` = `3`, `duration_max_minutes` = `5`
  - `arrival_estimate_time` = `20:50`
  - `notes` = "Salida anticipada para llegar al entrenamiento"

### 4.3. Entrenamientos Senior Femenino (L/X/V con horarios diferentes)
- **`enka_recurrence_rules`:**
  - `title` = "Entrenamientos Senior Femenino", `frequency` = `'weekly'`
- **`enka_recurrence_slots`:**
  - Fila 1: `weekday = 1` (Lunes), `start_time = 20:30`, `end_time = 22:00`
  - Fila 2: `weekday = 3` (Miércoles), `start_time = 20:30`, `end_time = 21:50`
  - Fila 3: `weekday = 5` (Viernes), `start_time = 19:15`, `end_time = 21:00`
  - Todas con `location_id` = ID Pabellón Juan Valera.

### 4.4. Partido Senior Femenino (Fin de semana conocido, día/hora pendiente)
- **`enka_activities`:**
  - `title` = "Partido Liga Senior Femenina"
  - `start_date` = `NULL` (sin inventar fecha de referencia)
  - `start_window_start_date` = `'2026-10-03'` (Sábado)
  - `start_window_end_date` = `'2026-10-04'` (Domingo)
  - `is_date_pending` = `true`
  - `is_time_pending` = `true` (`start_time = NULL`, `end_time = NULL`)
  - `prep_before_minutes` = `60` (convocatoria previa)
  - `metadata` = `{"is_sport_match": true, "team_code": "BUL", "opponent": "UCAM Murcia", "is_home": true}`

### 4.5. Viaje a Galicia (Inicio 19 Octubre, fin aproximado 30/31 Octubre)
- **`enka_activities`:**
  - `title` = "Puesta en marcha JEALSA (Galicia)"
  - `start_date` = `'2026-10-19'` (fecha de inicio exacta conocida)
  - `end_window_start_date` = `'2026-10-30'` (término más temprano estimado)
  - `end_window_end_date` = `'2026-10-31'` (término más tardío estimado)
  - `certainty` = `'probable'`
  - `certainty_note` = "Fechas finales sujetas a evolución de la puesta en marcha"

### 4.6. Cumpleaños Anual (1 de Diciembre)
- **`enka_recurrence_rules`:**
  - `title` = "Cumpleaños", `frequency` = `'yearly'`
  - `by_month` = `12`, `by_month_day` = `1`
  - `start_date` = `'2026-12-01'`
- **`enka_activities`:**
  - `title` = "Cumpleaños", `is_all_day` = `true`
  - `start_date` = `'2026-12-01'`
  - `recurrence_rule_id` = ID Regla Cumpleaños
