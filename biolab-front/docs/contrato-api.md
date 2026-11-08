# API real y cómo la consume el front

El backend expone **una ruta CRUD por cada tabla del esquema** (`backend/sql/schema.sql`).
El front ya no llama endpoints de alto nivel: `src/servicios/esquema.ts` combina las
tablas y arma los tipos de `src/tipos/dominio.ts` que usan las pantallas.

- URL base: `VITE_URL_API` (por defecto `http://localhost:3000/api`).
- Autenticación: `Authorization: Bearer <token>` en todas las rutas menos `POST /auth/login`.
- Fechas en ISO 8601 (`2026-11-07T10:40:00`).
- Errores: `{ "error": "mensaje" }` con código 4xx/5xx.
- Respuestas de listado envueltas: `{ "<recurso>": [...] }`; un registro: `{ "<singular>": {...} }`.
- Modo de datos: `VITE_USAR_MOCKS=false` usa esta API; `true` usa `src/datos-mock`.

## Rutas CRUD

Todas requieren token. `{recurso}` es el nombre de la tabla en kebab-case.

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/{recurso}` | Lista completa |
| `GET` | `/api/{recurso}/:id` | Un registro |
| `POST` | `/api/{recurso}` | Crea |
| `PATCH` | `/api/{recurso}/:id` | Actualiza (solo tablas con campos no-clave) |
| `DELETE` | `/api/{recurso}/:id` | Elimina |

Las tablas con **PK compuesta** no tienen `PATCH`; se consultan y borran con sus dos valores:

```bash
GET    /api/equipo-integrantes/1/2
DELETE /api/equipo-integrantes/1/2
```

### Recursos

| Recurso | Ruta |
| --- | --- |
| Usuarios | `/api/usuarios` |
| Carreras | `/api/carreras` |
| Personal | `/api/personal` |
| Materias | `/api/materias` |
| Alumnos | `/api/alumnos` |
| Grupos | `/api/grupos` |
| Profesor–materia | `/api/r-profesor-materia` |
| Profesor–materia–grupo | `/api/r-profmat-grupo` |
| Catálogo | `/api/catalogo` |
| Consumibles | `/api/consumibles` |
| Equipo de laboratorio | `/api/equipo-lab` |
| Materiales | `/api/materiales` |
| Historial de mantenimiento | `/api/historial-mantenimiento` |
| Riesgo biológico | `/api/riesgo-biologico` |
| Prácticas | `/api/practicas` |
| Equipos | `/api/equipo` |
| Integrantes de equipo | `/api/equipo-integrantes` |
| Peticiones de equipo | `/api/peticion-eq` |
| Renglones de petición | `/api/peticion-catalogo` |
| Aprobaciones | `/api/aprobacion` |
| Material aprobado | `/api/aprob-materiales` |
| Equipo aprobado | `/api/aprob-equipo-lab` |
| Consumible aprobado | `/api/aprob-consumibles` |
| Reportes | `/api/reportes` |
| Batas | `/api/batas-lab` |
| Rentas de batas | `/api/renta-batas` |

## Cómo el front arma cada pantalla

| Pantalla | Tablas que consulta (`src/servicios/esquema.ts`) |
| --- | --- |
| Panel, reportes | `reportes` |
| Inventario | `catalogo` + `consumibles` / `equipo-lab` / `materiales` |
| Horarios | `practicas` + `peticion-eq` + `equipo` + `r-profmat-grupo` + `grupo` |
| Equipos (profesor) | `equipo` + `equipo-integrantes` + `alumnos` + `r-profesor-materia` + `r-profmat-grupo` + `grupo` + `personal` |
| Prácticas | `practicas` + `peticion-eq` + el contexto de equipos |
| Solicitudes | `peticion-eq` + `peticion-catalogo` + `aprobacion` + `catalogo` + `practicas` |
| Cuentas | `alumnos` + `personal` + `usuarios` + `grupos` |

### Escrituras del front

| Acción | Llamadas |
| --- | --- |
| Crear grupo | `POST /grupos` |
| Crear equipo | `POST /r-profmat-grupo` (si falta) + `POST /equipo` + `POST /equipo-integrantes` |
| Crear práctica | `POST /practicas` + `POST /peticion-eq` por equipo |
| Crear solicitud | `POST /peticion-eq` + `POST /peticion-catalogo` por renglón |
| Revisar solicitud | `POST /aprobacion` |
| Devolución con problemas | `POST /reportes` |
| Crear reporte de aula | `POST /reportes` |
| Crear/editar/borrar inventario | `catalogo` + la tabla de detalle (`consumibles`, `equipo-lab` o `materiales`) |

## Límites del esquema (valores neutros en el front)

Estas columnas no existen en `schema.sql`; el front las resuelve en la capa de servicios:

- **Laboratorio de la práctica**: no hay columna; se muestra `microbiologia`.
- **Nombre del equipo**: `equipo` no guarda nombre; se muestra `Equipo {id}`.
- **Estado de solicitud / QR / entrega**: solo se persiste la aprobación (`aprobacion`).
  Entregar y devolver se reflejan en la UI; una devolución con problema sí crea un `reporte`.
- **Decisión del coordinador**: `reportes` no tiene columna; la decisión vive en la UI.
- **Fotos, racha y recompensas**: no hay tablas; la galería regresa vacío, la racha es neutra
  y las recompensas son un catálogo fijo de la app.
- **Asignatura del equipo**: `equipo` requiere `materia_id`; el front toma la primera
  relación `r_profesor_materia` del profesor y crea la relación con el grupo si falta.

## Sesión y cuentas

No hay registro desde la app: solo `ADMIN` (coordinador) y `LABORATORISTA` dan de alta cuentas.

| Método | Ruta | Cuerpo | Respuesta |
| --- | --- | --- | --- |
| POST | `/auth/login` | `{ usuario, contrasena }` | `{ usuario, tipo, perfil, token }` |
| POST | `/auth/registro` | ver abajo | `201 { usuario, tipo, perfil, token }` |
| GET | `/auth/perfil` | | `{ usuario, tipo, perfil }` |
| GET | `/alumnos` | | `{ alumnos: [{ alumno_id, nombre, apellido, matricula, usuario_id, usuario, grupo_id, grupo }] }` |
| GET | `/personal` | | `{ personal: [{ profesor_id, nombre, apellido, tipo, usuario_id, usuario }] }` |
| GET | `/usuarios` | | `{ usuarios: [{ usuario_id, usuario, rol, activo, fecha_alta }] }` |
| GET | `/grupos` | | `{ grupos: [{ grupo_id, grupo }] }` |
| POST | `/grupos` | `{ grupo }` | `201 { grupo }` |

Cuerpo de `/auth/registro`:

```json
{ "usuario": "ana", "contrasena": "secreto123", "tipo": "ALUMNO", "nombre": "Ana", "apellido": "López", "matricula": "20260001", "grupo_id": 1 }
```

- `tipo`: `ALUMNO`, `PROFESOR`, `LABORATORISTA` o `ADMIN` (en el front, ADMIN es el coordinador). ADMIN y LABORATORISTA pueden crear cualquier tipo, incluido ADMIN.
- `matricula` (8 caracteres) y `grupo_id` son obligatorios solo para `ALUMNO`.
- `ADMIN` no tiene fila en `personal` (el enum `rol_personal` solo admite PROFESOR y LABORATORISTA).
- Usuario: 3 a 30 caracteres, se guarda en minúsculas. Contraseña: mínimo 4. Nombre: máximo 60 para alumnos y 100 para personal. Apellido: máximo 80 para alumnos y 100 para personal.
- Errores `{ "error": "mensaje" }`: 400 datos inválidos, 401 sin token, 403 sin permiso, 409 usuario o matrícula repetidos.
- El token que regresa `/auth/registro` es de la cuenta nueva y el front **no lo guarda**.

### Usuario y contraseña

El esquema no almacena correo: cada cuenta se identifica por su **usuario**.

- `POST /auth/login` recibe `{ "usuario", "contrasena" }`.
- Login, registro, perfil, `/usuarios`, `/alumnos` y `/personal` regresan `usuario` (nunca `correo`).
- Admin inicial: `npm run db:admin -- admin contrasena`.
