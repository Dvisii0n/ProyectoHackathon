# API REST básica (Express + PostgreSQL + JWT)

Plantilla mínima de API REST en JavaScript (ESM) con:

- Express
- PostgreSQL (`pg`)
- Autenticación con JWT
- Contraseñas cifradas con bcryptjs
- CORS y logs con morgan
- Tabla de prueba `tareas` con CRUD protegido por usuario

## Requisitos

- Node.js 18 o superior
- PostgreSQL en ejecución
- Base de datos `hackathon` creada

## Instalación

```bash
npm install
cp .env.example .env   # y ajusta tus credenciales
npm run db:init        # crea las tablas
npm run db:admin       # crea el administrador inicial
npm run dev            # inicia con node --watch
```

La API queda disponible en `http://localhost:3000/api`.

El comando `npm run db:admin` usa `ADMIN_USER` y `ADMIN_PASSWORD` del `.env`. También puedes indicar otro usuario y contraseña:

```bash
npm run db:admin -- admin MiContrasena123
```

## Variables de entorno

| Variable | Descripción | Ejemplo |
| --- | --- | --- |
| `PORT` | Puerto de la API | `3000` |
| `DB_HOST` | Host de PostgreSQL | `localhost` |
| `DB_PORT` | Puerto de PostgreSQL | `5432` |
| `DB_USER` | Usuario de PostgreSQL | `jorge` |
| `DB_PASSWORD` | Contraseña de PostgreSQL | `12345678` |
| `DB_NAME` | Nombre de la base de datos | `hackathon` |
| `DB_SSL` | Usar SSL (`true`/`false`) | `false` |
| `JWT_SECRET` | Secreto para firmar tokens | cadena larga y aleatoria |
| `JWT_EXPIRES_IN` | Vigencia del token | `1d` |
| `ADMIN_USER` | Usuario del admin inicial | `admin` |
| `ADMIN_PASSWORD` | Contraseña del admin inicial | contraseña segura |
| `CORS_ORIGIN` | Orígenes permitidos, separados por coma o `*` | `*` |

## Esquema de datos

| Tabla | Columnas principales |
| --- | --- |
| `usuarios` | `usuario_id`, `usuario`, `contrasena`, `creado_en` |
| `carreras` | `carrera_id`, `carrera` |
| `personal` | `profesor_id`, `nombre`, `apellido`, `tipo` (`PROFESOR` / `LABORATORISTA` / `ADMIN`), `usuario_id` |
| `materias` | `materia_id`, `nombre`, `carrera_id` |
| `alumnos` | `alumno_id`, `nombre`, `apellido`, `matricula`, `usuario_id`, `grupo_id` |
| `grupo` | `grupo_id`, `grupo` |
| `tareas` | `id`, `usuario_id`, `titulo`, `descripcion`, `completada`, fechas |

Relaciones:

- `personal.usuario_id` → `usuarios.usuario_id` (1 a 1, `ON DELETE CASCADE`)
- `alumnos.usuario_id` → `usuarios.usuario_id` (1 a 1, `ON DELETE CASCADE`)
- `alumnos.grupo_id` → `grupo.grupo_id` (`ON DELETE SET NULL`)
- `materias.carrera_id` → `carreras.carrera_id` (`ON DELETE RESTRICT`)
- `tareas.usuario_id` → `usuarios.usuario_id` (`ON DELETE CASCADE`)

## Estructura

```
backend/
├── .env
├── .env.example
├── package.json
├── sql/
│   └── schema.sql
└── src/
    ├── app.js
    ├── server.js
    ├── config/
    │   ├── db.js
    │   └── env.js
    ├── controllers/
    │   ├── alumnos.controller.js
    │   ├── auth.controller.js
    │   ├── carreras.controller.js
    │   ├── grupos.controller.js
    │   ├── materias.controller.js
    │   ├── personal.controller.js
    │   ├── tareas.controller.js
    │   └── usuarios.controller.js
    ├── db/
    │   ├── init.js
    │   └── seed-admin.js
    ├── middlewares/
    │   ├── auth.js
    │   ├── errorHandler.js
    │   └── roles.js
    ├── routes/
    │   ├── alumnos.routes.js
    │   ├── auth.routes.js
    │   ├── carreras.routes.js
    │   ├── grupos.routes.js
    │   ├── index.js
    │   ├── materias.routes.js
    │   ├── personal.routes.js
    │   ├── tareas.routes.js
    │   └── usuarios.routes.js
    ├── services/
    │   └── usuarios.service.js
    └── utils/
        ├── ApiError.js
        ├── asyncHandler.js
        ├── jwt.js
        └── validaciones.js
```

## Endpoints

### Públicos

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/salud` | Comprueba que la API y la base de datos responden |
| `POST` | `/api/auth/login` | Inicia sesión y devuelve un token |

### Requieren `Authorization: Bearer <token>`

| Método | Ruta | Roles permitidos | Descripción |
| --- | --- | --- | --- |
| `POST` | `/api/auth/registro` | `ADMIN`, `LABORATORISTA` | Crea un usuario con su perfil y devuelve un token |
| `GET` | `/api/auth/perfil` | Cualquiera | Datos del usuario autenticado |

El resto de recursos tienen CRUD completo:

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/{recurso}` | Lista los registros |
| `GET` | `/api/{recurso}/:id` | Obtiene un registro |
| `POST` | `/api/{recurso}` | Crea un registro |
| `PATCH` | `/api/{recurso}/:id` | Actualiza parcialmente un registro |
| `DELETE` | `/api/{recurso}/:id` | Elimina un registro |

Recursos disponibles:

| Recurso | Ruta base |
| --- | --- |
| Usuarios | `/api/usuarios` |
| Carreras | `/api/carreras` |
| Personal | `/api/personal` |
| Materias | `/api/materias` |
| Alumnos | `/api/alumnos` |
| Grupos | `/api/grupos` |
| Tareas | `/api/tareas` |

Restricciones adicionales:

- `/api/usuarios` completo solo está disponible para `ADMIN` y `LABORATORISTA`.
- Crear perfiles en `/api/personal` y `/api/alumnos` requiere `ADMIN` o `LABORATORISTA`.
- Solo un `ADMIN` puede registrar o asignar el tipo `ADMIN`.

### Cuerpos esperados

| Recurso | `POST` | `PATCH` (todos los campos opcionales) |
| --- | --- | --- |
| `usuarios` | `{ "usuario", "contrasena" }` | `{ "usuario"?, "contrasena"? }` |
| `carreras` | `{ "carrera" }` | `{ "carrera"? }` |
| `grupo` | `{ "grupo" }` | `{ "grupo"? }` |
| `materias` | `{ "nombre", "carrera_id" }` | `{ "nombre"?, "carrera_id"? }` |
| `personal` | `{ "nombre", "apellido", "tipo", "usuario_id" }` | `{ "nombre"?, "apellido"?, "tipo"?, "usuario_id"? }` |
| `alumnos` | `{ "nombre", "apellido", "matricula", "usuario_id", "grupo_id"? }` | `{ "nombre"?, "apellido"?, "matricula"?, "usuario_id"?, "grupo_id"? }` |
| `tareas` | `{ "titulo", "descripcion"?, "completada"? }` | `{ "titulo"?, "descripcion"?, "completada"? }` |

`tipo` acepta `PROFESOR`, `LABORATORISTA` o `ADMIN`; solo un `ADMIN` puede asignar `ADMIN`. `grupo_id` puede ser `null`.

## Ejemplos con curl

### Registro (solo `ADMIN` y `LABORATORISTA`)

El registro **no es público**. Primero inicia sesión con un administrador o laboratorista y usa su token:

```bash
TOKEN="token_del_admin_o_laboratorista"
```

El registro requiere elegir un `tipo`: `ALUMNO`, `PROFESOR`, `LABORATORISTA` o `ADMIN`.

- `ALUMNO` requiere `matricula` y opcionalmente `grupo_id`.
- `PROFESOR`, `LABORATORISTA` y `ADMIN` requieren `nombre` y `apellido`.
- Solo un `ADMIN` puede registrar a otro `ADMIN`.

```bash
curl -X POST http://localhost:3000/api/auth/registro \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "usuario": "ana",
    "contrasena": "secreto123",
    "tipo": "ALUMNO",
    "nombre": "Ana",
    "apellido": "López",
    "matricula": "20260001",
    "grupo_id": 1
  }'
```

Respuesta `201`:

```json
{
  "usuario": {
    "usuario_id": "1",
    "usuario": "ana",
    "creado_en": "2026-11-07T00:00:00.000Z"
  },
  "tipo": "ALUMNO",
  "perfil": {
    "alumno_id": "1",
    "nombre": "Ana",
    "apellido": "López",
    "matricula": "20260001",
    "usuario_id": "1",
    "grupo_id": "1"
  },
  "token": "eyJhbGciOi..."
}
```

Ejemplo de profesor (para laboratorista o admin cambia `tipo`):

```bash
curl -X POST http://localhost:3000/api/auth/registro \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "usuario": "carlos",
    "contrasena": "secreto123",
    "tipo": "PROFESOR",
    "nombre": "Carlos",
    "apellido": "Ramírez"
  }'
```

La creación del usuario y de su perfil ocurre en una sola transacción: si falla la matrícula, el grupo o el nombre de usuario, no se guarda nada. Sin token responde `401`; con un rol no permitido responde `403`.

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"usuario":"admin","contrasena":"tu_contrasena"}'
```

La respuesta incluye `usuario`, `tipo`, `perfil` y `token`. El `tipo` también viaja dentro del JWT.

### Crear una tarea

```bash
TOKEN="pega_aqui_el_token"

curl -X POST http://localhost:3000/api/tareas \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"titulo":"Mi primera tarea","descripcion":"Prueba de la API"}'
```

### Listar tareas

```bash
curl http://localhost:3000/api/tareas \
  -H "Authorization: Bearer $TOKEN"
```

### Actualizar una tarea

```bash
curl -X PATCH http://localhost:3000/api/tareas/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"completada":true}'
```

### Eliminar una tarea

```bash
curl -X DELETE http://localhost:3000/api/tareas/1 \
  -H "Authorization: Bearer $TOKEN"
```

## Notas

- El nombre de usuario se guarda en minúsculas para evitar duplicados.
- Cada usuario solo puede ver y modificar sus propias tareas.
- Los errores se devuelven con la forma `{ "error": "mensaje" }`.
- No hay registro público: solo `ADMIN` y `LABORATORISTA` pueden crear usuarios.
- Solo un `ADMIN` puede crear o asignar el tipo `ADMIN`.
- La cuenta inicial se crea con `npm run db:admin` usando `ADMIN_USER` y `ADMIN_PASSWORD`.
- `.env` está en `.gitignore`; nunca subas secretos al repositorio.
