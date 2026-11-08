# API REST básica (Express + PostgreSQL + JWT)

Plantilla mínima de API REST en JavaScript (ESM) con:

- Express
- PostgreSQL (`pg`)
- Autenticación con JWT
- Contraseñas cifradas con bcryptjs
- CORS y logs con morgan
- CRUD de usuarios, carreras, personal, materias, alumnos y grupos

## Requisitos

- Node.js 18 o superior
- PostgreSQL en ejecución
- Base de datos `hackathon` creada

## Instalación

```bash
npm install
cp .env.example .env   # y ajusta tus credenciales
npm run db:init        # crea las tablas y siembra las 3 carreras (se puede repetir)
npm run db:admin       # crea el administrador inicial
psql -d hackathon -f sql/seed-materias-lcbm.sql     # materias de laboratorio (opcional)
psql -d hackathon -f sql/seed-inventario-2026.sql   # inventario 2026 (opcional)
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

El esquema completo está en `sql/schema.sql`. Tablas principales:

| Tabla | Columnas principales |
| --- | --- |
| `usuarios` | `usuario_id`, `usuario`, `contrasena`, `rol` (`ADMIN` / `PROFESOR` / `LABORATORISTA` / `ALUMNO`), `activo`, `fecha_alta` |
| `carreras` | `carrera_id`, `carrera` (enum con las 3 licenciaturas) |
| `personal` | `profesor_id`, `nombre`, `apellido`, `rol` (`PROFESOR` / `LABORATORISTA`), `fk_usuario_id` |
| `materias` | `materia_id`, `nombre`, `fk_carrera_id` |
| `alumnos` | `alumno_id`, `nombre`, `apellido`, `matricula` (`CHAR(8)`), `fk_usuario`, `fk_grupo_id` |
| `grupo` | `grupo_id`, `grupo` |
| `r_profesor_materia`, `r_profmat_grupo`, `equipo`, `equipo_integrantes` | Asignación de profesores, grupos y equipos de alumnos |
| `catalogo`, `consumibles`, `equipo_lab`, `materiales` | Inventario del laboratorio |
| `practicas`, `peticion_eq`, `peticion_catalogo`, `aprobacion`, `aprob_*` | Prácticas, solicitudes y material aprobado |
| `historial_mantenimiento`, `riesgo_biologico`, `reportes`, `batas_lab`, `renta_batas` | Operación del laboratorio |

Relaciones principales:

- `personal.fk_usuario_id` → `usuarios.usuario_id` (`ON UPDATE CASCADE ON DELETE RESTRICT`)
- `alumnos.fk_usuario` → `usuarios.usuario_id`
- `alumnos.fk_grupo_id` → `grupo.grupo_id` (obligatorio)
- `materias.fk_carrera_id` → `carreras.carrera_id` (`ON UPDATE CASCADE ON DELETE RESTRICT`)

> El rol `ADMIN` (coordinador) solo existe en `usuarios.rol`; no tiene fila en `personal` porque `rol_personal` únicamente admite `PROFESOR` y `LABORATORISTA`.

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
    │   ├── recursos.controller.js
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
    │   ├── recursos.routes.js
    │   └── usuarios.routes.js
    ├── services/
    │   └── usuarios.service.js
    └── utils/
        ├── ApiError.js
        ├── asyncHandler.js
        ├── jwt.js
        ├── recurso.js
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

Las tablas con PK compuesta no tienen `PATCH` (no hay campos editables fuera de la clave); se consultan y eliminan con los dos valores en la ruta.

Recursos disponibles (los 26 del esquema):

| Recurso | Ruta base | PK |
| --- | --- | --- |
| Usuarios | `/api/usuarios` | `usuario_id` |
| Carreras | `/api/carreras` | `carrera_id` |
| Personal | `/api/personal` | `profesor_id` |
| Materias | `/api/materias` | `materia_id` |
| Alumnos | `/api/alumnos` | `alumno_id` |
| Grupos | `/api/grupos` | `grupo_id` |
| Profesor–materia | `/api/r-profesor-materia` | `id_r_profesor_materia` |
| Profesor–materia–grupo | `/api/r-profmat-grupo` | `fk_r_profesor_materia` + `fk_grupo` |
| Catálogo | `/api/catalogo` | `id_catalogo` |
| Consumibles | `/api/consumibles` | `id_consumibles` |
| Equipo de laboratorio | `/api/equipo-lab` | `id_equipo_lab` |
| Materiales | `/api/materiales` | `id_materiales` |
| Historial de mantenimiento | `/api/historial-mantenimiento` | `id_historial_mantenimiento` |
| Riesgo biológico | `/api/riesgo-biologico` | `id_riesgo_biologico` |
| Prácticas | `/api/practicas` | `id_practicas` |
| Equipos | `/api/equipo` | `equipo_id` |
| Integrantes de equipo | `/api/equipo-integrantes` | `fk_id_alumno` + `fk_id_equipo` |
| Peticiones de equipo | `/api/peticion-eq` | `peticion_eq_id` |
| Renglones de petición | `/api/peticion-catalogo` | `peticion_catalogo_id` |
| Aprobaciones | `/api/aprobacion` | `aprobacion_id` |
| Material aprobado | `/api/aprob-materiales` | `fk_id_material` + `fk_id_aprobacion` |
| Equipo aprobado | `/api/aprob-equipo-lab` | `fk_id_equipo_lab` + `fk_id_aprobacion` |
| Consumible aprobado | `/api/aprob-consumibles` | `fk_id_consumible` + `fk_id_aprobacion` |
| Reportes | `/api/reportes` | `id_reportes` |
| Batas | `/api/batas-lab` | `bata_id` |
| Rentas de batas | `/api/renta-batas` | `id_renta_batas` |

Ejemplo de PK compuesta:

```bash
GET    /api/equipo-integrantes/1/2
DELETE /api/equipo-integrantes/1/2
```

Restricciones adicionales:

- `ADMIN` y `LABORATORISTA` tienen exactamente los mismos permisos (incluido crear cuentas `ADMIN`).
- `/api/usuarios` completo solo está disponible para `ADMIN` y `LABORATORISTA`.
- Crear perfiles en `/api/personal` y `/api/alumnos` requiere `ADMIN` o `LABORATORISTA`.
- Inventario (`catálogo`, `consumibles`, `equipo-lab`, `materiales`, mantenimiento, batas y rentas) lo editan `ADMIN` y `LABORATORISTA`.
- Prácticas, equipos y peticiones de equipo los editan `ADMIN`, `LABORATORISTA` y `PROFESOR`.
- **Solicitud de material:** la hace el equipo. Los renglones (`/api/peticion-catalogo`) solo los crean y cambian los **alumnos integrantes de ese equipo**; el personal puede quitarlos. La aprobación (`/api/aprobacion` y `/api/aprob-*`) la hacen `ADMIN` y `LABORATORISTA`.
- **Validación de existencias:** al pedir y al aprobar, la API comprueba que haya material suficiente y que el artículo esté disponible (`409` si no). Cuentan la existencia, el estado (en uso o dado de baja) y lo ya aprobado a otros equipos: en equipo y materiales solo las prácticas que se empalman en horario, y en consumibles todas las que aún no terminan. `GET /api/disponibilidad?practica=ID&equipo=ID` regresa cuánto se puede pedir de cada artículo.
- **Reportes:** `ADMIN`, `LABORATORISTA` y `PROFESOR` pueden **crearlos** (con sus fotos); solo `ADMIN` puede verlos, cambiarlos o borrarlos. Lo mismo aplica a las evidencias.
- `carreras` y `materias` las editan `ADMIN` y `LABORATORISTA`; `grupos` también `PROFESOR`.
- Los demás listados y consultas requieren solo estar autenticado.

### Flujo para empezar el semestre

1. `ADMIN` o `LABORATORISTA` crea grupos y cuentas (`/auth/registro`).
2. Crea materias (`/materias`) y asigna profesor (`/r-profesor-materia`) y grupos (`/r-profmat-grupo`). En el front: pantalla **Materias**.
3. El profesor registra equipos (`/equipo` + `/equipo-integrantes`) eligiendo alumnos reales del grupo, y luego prácticas.

### Evidencias de los reportes (fotos)

Cada reporte admite hasta **5 fotos**. Se guardan en la tabla `evidencias_reporte` (se borran junto con su reporte). Subirlas lo hacen quienes crean reportes; leerlas, solo `ADMIN`, con sesión iniciada: no hay enlaces públicos.

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/api/reportes/:id/evidencias` | Sube **una** foto. El cuerpo es la imagen (`Content-Type: image/*`) y, opcional, `X-Nombre-Archivo`. Roles: `ADMIN`, `LABORATORISTA`, `PROFESOR` |
| `GET` | `/api/reportes/:id/evidencias` | Datos de las fotos de un reporte (sin la imagen). Solo `ADMIN` |
| `GET` | `/api/evidencias` | Datos de todas las fotos (sin la imagen). Solo `ADMIN` |
| `GET` | `/api/evidencias/:id` | La imagen. Solo `ADMIN` |

- Formatos: JPEG, PNG, WebP y HEIC. Se detectan por el contenido del archivo, no por el `Content-Type`.
- Máximo 8 MB por foto (`413`); la sexta foto de un reporte responde `409`. El front reduce cada foto a 1600 px antes de subirla.

### Cuerpos esperados

| Recurso | `POST` | `PATCH` (todos los campos opcionales) |
| --- | --- | --- |
| `usuarios` | `{ "usuario", "contrasena", "rol", "activo"? }` | `{ "usuario"?, "contrasena"?, "rol"?, "activo"? }` |
| `carreras` | `{ "carrera" }` | `{ "carrera"? }` |
| `grupo` | `{ "grupo" }` | `{ "grupo"? }` |
| `materias` | `{ "nombre", "carrera_id" }` | `{ "nombre"?, "carrera_id"? }` |
| `personal` | `{ "nombre", "apellido", "tipo", "usuario_id" }` | `{ "nombre"?, "apellido"?, "tipo"?, "usuario_id"? }` |
| `alumnos` | `{ "nombre", "apellido", "matricula", "usuario_id", "grupo_id" }` | `{ "nombre"?, "apellido"?, "matricula"?, "usuario_id"?, "grupo_id"? }` |

- `tipo` en `personal` acepta `PROFESOR` o `LABORATORISTA`.
- `rol` en `usuarios` acepta `ADMIN`, `PROFESOR`, `LABORATORISTA` o `ALUMNO`.
- `matricula` debe tener exactamente 8 caracteres y `grupo_id` es obligatorio para alumnos.
- `carrera` solo acepta las 3 licenciaturas definidas en el enum.

Cuerpos de las tablas nuevas:

| Recurso | `POST` |
| --- | --- |
| `r-profesor-materia` | `{ "fk_materia", "fk_profesor" }` |
| `r-profmat-grupo` | `{ "fk_r_profesor_materia", "fk_grupo" }` |
| `catalogo` | `{ "nombre", "categoria" }` — `MATERIAL`, `EQUIPO_LAB`, `CONSUMIBLES` |
| `consumibles` | `{ "fk_id_catalogo", "consumible", "unidad", "cantidad"?, "caducidad"?, "minimo_restock"? }` |
| `equipo-lab` | `{ "fk_id_catalogo", "nombre", "codigo", "mant_prev"?, "notas"?, "estado"?, "cantidad"? }` |
| `materiales` | `{ "fk_id_catalogo", "nombre", "codigo", "categoria"?, "cantidad"?, "volumen"?, "medidas"?, "composicion"?, "notas"?, "estado"? }` — `categoria`: `VOLUMETRICO`, `NO_VOLUMETRICO`, `UTENSILIO` (por defecto), `METAL` |
| `historial-mantenimiento` | `{ "fecha", "encargado", "fk_id_equipo_lab" }` |
| `riesgo-biologico` | `{ "objetos_recoleccion", "recolector", "fk_id_personal", "fecha" }` |
| `practicas` | `{ "nombre", "fecha_inicio", "fecha_final", "fk_id_personal", "descripcion"? }` |
| `equipo` | `{ "materia_id", "fk_id_r_profesor_materia" }` |
| `equipo-integrantes` | `{ "fk_id_alumno", "fk_id_equipo" }` |
| `peticion-eq` | `{ "fk_id_practica", "fk_id_equipo" }` |
| `peticion-catalogo` | `{ "peticion_eq_id", "fk_id_catalogo", "cantidad"? }` |
| `aprobacion` | `{ "fk_equipo", "fk_id_practica" }` |
| `aprob-materiales` | `{ "fk_id_material", "fk_id_aprobacion" }` |
| `aprob-equipo-lab` | `{ "fk_id_equipo_lab", "fk_id_aprobacion" }` |
| `aprob-consumibles` | `{ "fk_id_consumible", "fk_id_aprobacion" }` |
| `reportes` | `{ "titulo", "descripcion", "fecha"?, "fk_id_practica"? }` |
| `batas-lab` | `{ "codigo", "estado"? }` — `RENTA`, `DISPONIBLE`, `LAVAR` |
| `renta-batas` | `{ "fk_id_alumno", "fk_id_bata", "fecha_inicio", "estado_entregado", "fecha_fin"?, "estado_recibido"?, "comentario"? }` |

`estado_entregado` / `estado_recibido` aceptan `BUENO`, `MALO` o `CON DEFECTO`; `estado` de inventario acepta `BAJA`, `PRESTADO` o `DISPONIBLE`. Los códigos (`codigo`) tienen exactamente 8 caracteres.

## Ejemplos con curl

### Registro (solo `ADMIN` y `LABORATORISTA`)

El registro **no es público**. Primero inicia sesión con un administrador o laboratorista y usa su token:

```bash
TOKEN="token_del_admin_o_laboratorista"
```

El registro requiere elegir un `tipo`: `ALUMNO`, `PROFESOR`, `LABORATORISTA` o `ADMIN`.

- `ALUMNO` requiere `matricula` (8 caracteres) y `grupo_id` (obligatorio).
- `PROFESOR`, `LABORATORISTA` y `ADMIN` requieren `nombre` y `apellido`.

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

## Notas

- El nombre de usuario se guarda en minúsculas para evitar duplicados.
- El login se hace con `{ "usuario", "contrasena" }`.
- Los errores se devuelven con la forma `{ "error": "mensaje" }`.
- No hay registro público: solo `ADMIN` y `LABORATORISTA` pueden crear usuarios.
- La cuenta inicial se crea con `npm run db:admin` usando `ADMIN_USER` y `ADMIN_PASSWORD`.
- `npm run db:admin -- <usuario> <contrasena>` crea o actualiza esa cuenta como `ADMIN`.
- `.env` está en `.gitignore`; nunca subas secretos al repositorio.
