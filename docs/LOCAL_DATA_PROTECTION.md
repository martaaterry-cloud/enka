# Protección local de actividades: fases 1 y 2

Esta versión no migra datos heredados ni escribe en Supabase. No cambia el alcance de cierre de sesión del SDK ni modifica PocketFlow.

## Formato y conservación

Cada documento se guarda en `enka:<proyecto codificado>:activities:v1:<user.id codificado>`.
El proyecto es la URL configurada de Supabase; debe mantenerse estable para acceder al mismo espacio local.
El documento contiene `schemaVersion`, `project`, `ownerUserId`, `revision` y `activities`.
No utiliza correos ni tokens como identificadores. Los IDs nuevos son UUID.

`enka:activities` y `enka:reset-2026-10` no se leen, escriben ni eliminan. El contenido antiguo permanece sin propietario, no aparece en el calendario y no se importa automáticamente. Los datos que una versión anterior ya haya eliminado no pueden recuperarse con esta protección.

La preferencia `enka:theme` sigue siendo del dispositivo. `enka_auth_session` permanece bajo control exclusivo del SDK.

## Identidad y guardado

Los eventos de Auth invalidan inmediatamente los callbacks de la identidad anterior. Una generación distingue A→B→A incluso si React agrupa los eventos. El proveedor se remonta al cambiar esa generación, proyecto o usuario; el refresco de token del mismo usuario no lo remonta. Una respuesta inicial tardía no puede sustituir un evento de sesión posterior.

Las actividades empiezan únicamente desde el documento de la cuenta activa. Un documento corrupto, incompatible o inaccesible bloquea el contenido sin reemplazarlo por una lista vacía persistida.

Cada guardado valida su snapshot, obtiene un Web Lock exclusivo, comprueba identidad y compara el documento actual con el que se cargó. Si ha cambiado, rechaza la operación y pide recargar. No mezcla ni sustituye cambios de otra pestaña. Las operaciones simultáneas o callbacks que parten de estado obsoleto también se rechazan.

La escritura de una única clave mediante `localStorage.setItem` es atómica según la API: un fallo de escritura conserva el valor anterior. Se comprueba el contenido después de escribir. Si la comprobación falla, el estado es incierto: se bloquean más escrituras hasta recargar, sin intentar una restauración que pueda destruir un guardado válido.

React confirma la operación después de guardar. Los formularios muestran errores dentro de sus modales y no se cierran por una operación rechazada. El cierre de sesión oculta los datos y desmonta el estado personal, pero conserva el documento de la cuenta.

## Verificación sin datos reales

Requiere Node 24.15 o superior dentro de la rama 24 LTS (verificado con Node 24.19).

```sh
npm ci
npm run lint
npm test
npm run build
```

`npm test` comprueba tipos y ejecuta Vitest con jsdom. Auth y el repositorio remoto están simulados; el almacenamiento utiliza mapas o el localStorage efímero de jsdom. No se conecta a Supabase ni utiliza sesiones reales.

Cobertura: conservación exacta del legado y marcador, separación de proyectos y cuentas, recarga, validación y versiones incompatibles, cuota y acceso denegado, verificación de escritura, cambios entre pestañas, escrituras concurrentes, A→B y A→B→A, cierre de sesión, respuesta inicial tardía, refresco de token, callbacks obsoletos, CRUD y formularios ante fallos.

Antes de publicar, revisar el diff de la rama y completar una prueba en navegadores reales con perfiles desechables, autenticación simulada y dos pestañas. Comprobar Chrome, Firefox y Safari/iOS, incluidos modo privado, Web Locks y actualización de una PWA antigua. No usar cuentas ni actividades reales para estas pruebas.

## Límites y siguientes decisiones

- Sin Web Locks se permiten lecturas, pero se rechazan escrituras; no existe fallback sin exclusión. Los tests simulan el LockManager, no sustituyen la comprobación de compatibilidad del navegador.
- localStorage no está cifrado y depende del origen del navegador. Separar cuentas impide mezclas en la interfaz, no acceso por scripts del mismo origen o por quien controle el dispositivo.
- Una versión antigua de la PWA puede seguir ejecutando el borrado heredado. Esta rama no modifica el sistema de actualizaciones: revisar su propagación antes de publicar. Volver a una versión antigua no hará visibles los documentos nuevos y puede afectar al legado.
- Los conflictos requieren recargar; no hay resolución automática, sincronización entre dispositivos ni recuperación/importación del legado en estas fases.
- Los workflows actuales usan Node 20 y no ejecutan `npm test`. Actualizarlos a Node 24 LTS y añadir el test antes de publicar; no se han modificado los workflows de despliegue en este trabajo.
- Cualquier recuperación del legado requiere una política de atribución y autorización expresa. Ningún contenido sin propietario debe entrar en una futura cola de sincronización.
- La sincronización posterior deberá convertir el modelo local al remoto, validar referencias del mismo usuario, mantener RLS y limitar migraciones a Enka. No se han modificado tablas, políticas, publicaciones Realtime ni el cliente global de Supabase.
