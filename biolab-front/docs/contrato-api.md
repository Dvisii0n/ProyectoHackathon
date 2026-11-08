# Contrato de la API (lo que el front espera del back)

- URL base: `VITE_URL_API` (por defecto `http://localhost:8000/api`).
- Autenticación: `Authorization: Bearer <token>` en todas las rutas menos `POST /sesion`.
- Fechas en ISO 8601 (`2026-11-07T10:40:00`).
- Errores: código HTTP 4xx/5xx con un mensaje de texto en el cuerpo (el front lo muestra tal cual).
- Los tipos (`Practica`, `SolicitudMaterial`…) están en `src/tipos/dominio.ts`.
- Cada endpoint tiene su función en `src/servicios/index.ts`.

## Flujo completo

1. **Profesor** registra sus equipos de alumnos (principio de semestre).
2. **Profesor** crea una práctica: día, hora, laboratorio y qué equipos la hacen. El profe NO pone material.
3. **Alumno** ve las prácticas de su equipo. Desde **7 días antes** y hasta que empieza la práctica, un integrante pide material para todo el equipo.
4. **Laboratorista** revisa la solicitud como checklist (acepta o rechaza cada renglón). Si acepta al menos uno, el back genera el QR de aprobación.
5. **Laboratorista** escanea el QR y entrega el material.
6. Al terminar la práctica, **laboratorista** recibe el material y marca cada renglón como `bien` o `con-problema` con una nota.
7. Si algo tiene problema, el back crea un **reporte de material** que ven el equipo (alumnos) y el **coordinador**, quien decide: todo bien, advertencia, sanción o baneo.

## Sesión

No hay registro desde la app: las cuentas (coordinador, laboratoristas, profesores y alumnos) se dan de alta directamente en el back.

| Método | Ruta | Cuerpo | Respuesta |
| --- | --- | --- | --- |
| POST | `/sesion` | `{ correo, contrasena }` | `{ token, usuario: Usuario }` (401 si no coincide) |

## Equipos de alumnos (profesor)

| Método | Ruta | Cuerpo | Respuesta |
| --- | --- | --- | --- |
| GET | `/equipos` | | `EquipoAlumnos[]` del profesor |
| POST | `/equipos` | `{ nombre, grupo, integrantes: { id, nombre }[] }` | `EquipoAlumnos` |
| DELETE | `/equipos/:id` | | 204 |

Lo ideal es que `integrantes` se elijan de los alumnos ya registrados (con su id real). En el prototipo se escriben a mano.

## Prácticas

| Método | Ruta | Quién | Cuerpo | Respuesta |
| --- | --- | --- | --- | --- |
| GET | `/practicas` | profesor (las suyas), laboratorista, coordinador | | `Practica[]` ordenadas por fecha |
| GET | `/practicas/mias` | alumno | | `{ practicas: Practica[], equipo: EquipoAlumnos \| null }` |
| POST | `/practicas` | profesor | `{ nombre, grupo, laboratorioId, inicio, duracionHoras, descripcion?, equipoIds }` | `Practica` |
| DELETE | `/practicas/:id` | profesor | | 204 |
| GET | `/practicas?hoy=true` | laboratorista, profesor | | `Practica[]` (para el reporte de aula) |

## Solicitudes de material

Estados: `pendiente → aprobada | rechazada → entregada → devuelta | con-problemas`.

| Método | Ruta | Quién | Cuerpo | Respuesta |
| --- | --- | --- | --- | --- |
| GET | `/inventario/prestable` | alumno | | `ArticuloInventario[]` (sin equipo en mantenimiento) |
| GET | `/solicitudes` | laboratorista | | `SolicitudMaterial[]` (más recientes primero) |
| GET | `/solicitudes?equipoId=…` | alumno | | `SolicitudMaterial[]` de su equipo |
| POST | `/solicitudes` | alumno | `{ practicaId, equipoId, renglones: { articuloId, cantidad }[] }` | `SolicitudMaterial` |
| PATCH | `/solicitudes/:id/revision` | laboratorista | `{ aceptados: { [articuloId]: boolean } }` | `SolicitudMaterial` (con `codigoQr` si se aprobó algo) |
| POST | `/solicitudes/entregar` | laboratorista | `{ codigoQr }` | `SolicitudMaterial` (pasa a `entregada`) |
| POST | `/solicitudes/:id/devolucion` | laboratorista | `{ revision: { [articuloId]: { estado: 'bien' \| 'con-problema', nota? } } }` | `SolicitudMaterial` |

Reglas que debe validar el back:

- `POST /solicitudes`: el alumno pertenece al equipo, el equipo está en la práctica, faltan 7 días o menos y la práctica no ha empezado. Una sola solicitud por equipo y práctica (409 si ya existe).
- `codigoQr`: texto que el front convierte en QR; se recomienda un token firmado o difícil de adivinar.
- `devolucion` con algún `con-problema`: crear un `Reporte` con `tipo: 'material'`, `equipoId`, `materialConProblema` y `severidad: 'dano'`.

## Reportes

| Método | Ruta | Quién | Cuerpo | Respuesta |
| --- | --- | --- | --- | --- |
| GET | `/reportes` | coordinador | | `Reporte[]` (aula y material) |
| GET | `/reportes?equipoId=…` | alumno | | `Reporte[]` de material de su equipo |
| PATCH | `/reportes/:id/decision` | coordinador | `{ decision: 'todo-bien' \| 'advertencia' \| 'sancion' \| 'baneo' \| null }` | `Reporte` |
| POST | `/reportes` | laboratorista, profesor | multipart: `practicaId`, `calificaciones` (JSON), `nota?`, `fotos` | `{ id }` (reporte de aula) |

- Reporte de aula: `calificaciones = { limpieza, material, equipo, orden }`, cada uno `'bien' | 'regular' | 'mal'`. Severidad: `'dano'` si `equipo` es `'mal'`; `'advertencia'` si hay algún `'mal'` o `'regular'`; si no, `'en-orden'`.
- `decision: null` = el coordinador lo deshizo. Al sancionar o banear, el front pide motivo y duración (agregar `{ motivo, duracionDias }` cuando el back lo soporte).

## Inventario

| Método | Ruta | Quién | Cuerpo | Respuesta |
| --- | --- | --- | --- | --- |
| GET | `/inventario?categoria=consumibles\|equipo\|utensilios` | todos | | `ArticuloInventario[]` |
| POST | `/inventario` | laboratorista | `NuevoArticulo` | `ArticuloInventario` |
| PUT | `/inventario/:id` | laboratorista | `NuevoArticulo` | `ArticuloInventario` |
| DELETE | `/inventario/:id` | laboratorista | | 204 |

- Consumibles: `porcentajeRestante` (0–100) para el tubito de nivel. Menos de 35 = "poco stock".
- Equipo: `estado = 'disponible' | 'ocupado' | 'mantenimiento'`.

## Horarios

| Método | Ruta | Quién | Respuesta |
| --- | --- | --- | --- |
| GET | `/horarios?semana=actual` | todos | `BloqueHorario[]` |

Se arma a partir de las prácticas de la semana (un bloque por hora). `dia`: 0 = lunes … 4 = viernes. Ya no hay reservas sueltas: el profesor crea prácticas.

## Galería y mascota

| Método | Ruta | Quién | Cuerpo | Respuesta |
| --- | --- | --- | --- | --- |
| GET | `/fotos?mias=true&estado=aprobada` | alumno | | `FotoPractica[]` |
| POST | `/fotos` | alumno | multipart: `practicaId`, `foto` | `FotoPractica` (queda `pendiente`) |
| PATCH | `/fotos/:id` | laboratorista | `{ estado: 'aprobada' \| 'rechazada' }` | `FotoPractica` |
| GET | `/racha` | todos | | `Racha` |
| GET | `/recompensas` | alumno | | `Recompensa[]` |

- Coordinador, laboratorista y profesor ven la racha del laboratorio (días sin daños). El alumno ve la de su equipo (prácticas sin romper material).
- `animo: 'triste'` cuando hubo daños; la racha vuelve a 0.
- Puntos sugeridos: +10 por material devuelto en orden, +5 por foto aprobada; nivel cada 100 puntos.
