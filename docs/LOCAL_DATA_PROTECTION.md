# Protección local de actividades: fases 1 y 2

**PUBLICACIÓN BLOQUEADA.** Este cambio se prepara únicamente para revisión en un PR en borrador. Antes de fusionar o desplegar deben validarse la transición desde versiones antiguas de la PWA y las pruebas en navegadores reales con datos simulados. La necesidad de recuperar las actividades antiguas ha sido descartada por el usuario; eso no autoriza eliminarlas ni permite asumir que todas las instalaciones se hayan actualizado.

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

Las actividades empiezan únicamente desde el documento de la cuenta activa. Un documento corrupto, incompatible o inaccesible bloquea el contenido sin reemplazarlo por una lista vacía persistida. La pantalla de error mantiene una salida para cerrar sesión con el mismo flujo de Auth, conservando el documento.

Cada guardado valida su snapshot, obtiene un Web Lock exclusivo, comprueba identidad y compara el documento actual con el que se cargó. Si ha cambiado, rechaza la operación y pide recargar. No mezcla ni sustituye cambios de otra pestaña. Las operaciones simultáneas o callbacks que parten de estado obsoleto también se rechazan.

La escritura de una única clave mediante `localStorage.setItem` es atómica según la API: un fallo de escritura conserva el valor anterior. Se comprueba el contenido después de escribir. Si la comprobación falla, el estado es incierto: se bloquean más escrituras hasta recargar, sin intentar una restauración que pueda destruir un guardado válido.

React confirma la operación después de guardar. Los formularios muestran errores dentro de sus modales y no se cierran por una operación rechazada. El cierre de sesión oculta los datos y desmonta el estado personal, pero conserva el documento de la cuenta. Al completar un guardado se actualiza la selección actual desde el snapshot persistido; no se restaura una selección cerrada ni se cierra otra actividad abierta mientras se esperaba el bloqueo.

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
- Ambos workflows seleccionan Node 24 LTS con `check-latest: true`, instalan mediante `npm ci` y ejecutan lint, pruebas y build. No se han cambiado permisos, variables de Supabase ni destinos de despliegue. El workflow de publicación conserva su filtro de push a `main`; subir esta rama y abrir el PR no lo ejecutan. No se ha solicitado ninguna ejecución manual ni despliegue.
- Cualquier recuperación del legado requiere una política de atribución y autorización expresa. Ningún contenido sin propietario debe entrar en una futura cola de sincronización.
- La sincronización posterior deberá convertir el modelo local al remoto, validar referencias del mismo usuario, mantener RLS y limitar migraciones a Enka. No se han modificado tablas, políticas, publicaciones Realtime ni el cliente global de Supabase.

## Compatibilidad documental de Web Locks y validación pendiente

Apple documenta la incorporación de Web Locks en Safari 15.4, que acompaña a iOS/iPadOS 15.4: https://developer.apple.com/documentation/safari-release-notes/safari-15_4-release-notes . WebKit describe la coordinación del recurso entre contextos del mismo origen: https://webkit.org/blog/12445/new-webkit-features-in-safari-15-4/ . Esto es evidencia documental, no una validación de Enka en un dispositivo.

No se dispone de un iPhone/iPad ni una PWA instalada en iOS en este entorno. No se ha validado la disponibilidad ni el comportamiento real de `navigator.locks` en la PWA instalada, modo privado, suspensión/reanudación o concurrencia entre Safari y una PWA. jsdom utiliza un LockManager simulado.

La prueba pendiente debe comprobar `isSecureContext`, presencia de `navigator.locks.request`, adquisición y liberación de un bloqueo, rechazo de un snapshot obsoleto y guardado tras reanudar. Si Safari y la PWA utilizan almacenes diferentes, documentar ese resultado: compartir origen no prueba que compartan almacenamiento en todos los modos. Usar documentos y cuentas simulados, y probar aislamiento de A/B en cada almacén.

## Transición de PWA: riesgo reproducido, publicación bloqueada

El inicializador anterior ejecuta `removeItem('enka:activities')` antes de leer las actividades si el marcador no contiene `complete`. Se ha reproducido en una prueba con un Map sintético: una versión antigua puede borrar esa clave incluso si la nueva versión ya guardó un documento separado. No borra el documento nuevo porque desconoce su clave, pero sí puede destruir el legado. No se han leído ni borrado datos reales.

El registro actual usa `registerType: 'prompt'`. Una actualización puede permanecer esperando y un cliente antiguo puede seguir activo, especialmente offline. Además, el aviso de actualización solo se escucha cuando está montada la pantalla «Más». Esta rama no corrige ni garantiza la propagación de versiones: no puede controlar retroactivamente el JavaScript que ya ejecuta una instalación antigua.

Criterios pendientes antes de autorizar publicación:

- Reproducir con perfiles desechables la transición de una PWA antigua a la nueva, tanto con marcador ausente como existente, y con una ventana antigua abierta.
- Verificar Safari/iOS y la PWA instalada, además de Chrome y Firefox, incluyendo dos pestañas, cierre de sesión, cambio rápido de cuenta y suspensión/reanudación.
- Definir una estrategia operativa para clientes antiguos/offline y una forma de comprobar la versión efectivamente ejecutada. No asumir actualización por haber publicado nuevos archivos.
- No limpiar localStorage, reinstalar eliminando datos, atribuir el legado ni escribir el marcador como atajo. Cualquier cambio de esa política necesita autorización separada.

El estado de borrador y esta documentación expresan el bloqueo; no sustituyen una regla técnica de protección de rama o una aprobación de despliegue. No se han cambiado esas configuraciones del repositorio.

## Resultado de la revisión local

Revisión contra `main` a partir de `f34216f`, con Node 24.19.0: lint sin avisos, comprobación de tipos y 45 pruebas con datos simulados aprobadas, build correcto con la advertencia previa de tamaño del paquete. La suite de integración se repitió tres veces después de hacer explícita la espera de los efectos de montaje de React; las tres ejecuciones pasaron.

Se corrigieron dos regresiones del guardado asíncrono: restaurar/cerrar una selección antigua al completar una operación y ocultar el cierre de sesión cuando un documento está corrupto. Las pruebas nuevas cubren ambas. El cierre de sesión sigue llamando al mismo flujo del SDK; no cambia su alcance.

El diff conserva los archivos de Supabase, migraciones de PocketFlow, configuración PWA, dependencias existentes, permisos de Actions y variables/destinos de despliegue. Los únicos cambios en workflows son Node 24 LTS, selección de su versión actual y ejecución de la suite simulada. Estas comprobaciones locales no acreditan la transición PWA ni las pruebas reales pendientes.
