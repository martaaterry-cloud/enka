# Auditoría de sincronización de actividades (fase 1)

## Comprobado en el código
- `EnkaContext` lee/escribe actividades en `localStorage('enka:activities')`; no hay sincronización de actividades con Supabase.
- Categorías y ubicaciones ya se leen de Supabase.
- `enkaRepository` contiene `fetchActivities`, pero no tenía mutaciones de actividades.
- `DbActivity` describe `enka_activities` con `user_id`, fechas, horas, estado y `metadata`.
- El workflow de despliegue ejecuta Node 20, lint y build solo en push a `main`.
- El código de recurrencia local edita listas de actividades ya materializadas; NO equivale al modelo de reglas y excepciones de Supabase.

## Introducido en esta rama
- Mapper explícito `Activity <-> DbActivity` y pruebas.
- CRUD de actividades en repositorio, autenticado y filtrado por `user_id`.
- `npm test` y CI de PR.

## BLOQUEOS ANTES DE CONECTAR LA INTERFAZ
1. Verificar con SQL real de Supabase el esquema, defaults, claves foráneas, políticas RLS y valores permitidos para `certainty`/`status`. Los tipos TypeScript no prueban que coincidan con la base remota.
2. Resolver categorías opcionales y las FK de recurrencia: los IDs locales `act-...` no son UUID válidos para columnas de relaciones.
3. Definir migración explícita, no destructiva y con consentimiento, para posibles actividades locales existentes. Nunca subirlas automáticamente ni borrar el almacenamiento local por error.
4. Conectar `EnkaContext` con carga por sesión, errores visibles, estado de carga, mutaciones remotas confirmadas y prevención de escrituras mientras no se haya cargado el servidor.
5. Pruebas de integración con una cuenta de prueba: crear, editar, cancelar, borrar, recargar, cambiar de dispositivo, RLS y fallo de red. Verificar que ninguna acción reporta éxito si Supabase falla.
6. No activar sincronización de recurrencias/excepciones hasta implementar su modelo persistente real.

**Estado:** rama preparatoria; NO activar en producción ni fusionar hasta completar bloqueos y pruebas.
