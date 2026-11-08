# Biolab · Front

Sistema del laboratorio de la Licenciatura en Biomédica: horarios, inventario, reportes de aula, préstamo de material con QR y galería de prácticas, con **Capi**, la capibara mascota que lleva la racha.

Está hecho sobre la plantilla gratuita **Minimals** (Vite + React 19 + TypeScript + MUI 7).

## Cómo correrlo

```bash
npm install
cp .env.ejemplo .env
npm run dev
```

Se abre en http://localhost:3039

La app abre en el **inicio de sesión** (no hay registro). Mientras no exista el back, deja `VITE_USAR_MOCKS=true` en `.env`: en el login hay botones con cuentas de prueba de cada rol (cualquier contraseña funciona), y en el menú del encabezado puedes cambiar de rol o cerrar sesión.

## Roles y flujo

| Rol | Qué hace |
| --- | --- |
| Coordinador | Solo recibe información: panel y bandeja de reportes (aula y material). Decide: todo bien, advertir, sancionar o banear. |
| Profesor | Registra sus equipos de alumnos a principio de semestre y crea prácticas (día, hora, laboratorio y equipos). No pone material. |
| Alumno | Ve las prácticas de su equipo y, desde una semana antes, pide material para todo el equipo. Recibe un QR de aprobación. |
| Laboratorista | Revisa solicitudes como checklist, entrega con el QR y recibe el material con notas. Si algo vuelve mal, el reporte les llega al equipo y al coordinador. También hace reportes de aula y edita el inventario. |

Para probar el flujo completo con datos de ejemplo: entra como **alumno** → Pedir material → envía; cierra sesión, entra como **laboratorista** → Solicitudes → apruébala; vuelve como alumno para ver el QR. Los datos de prueba se guardan en el navegador (`src/datos-mock/almacen.ts`); para empezar de cero, borra la clave `biolab:datos-demo:v2` del localStorage.

Los permisos están en `src/contexto/sesion.tsx` (`permisosPorRol`). Las pantallas y el menú preguntan por permisos, no por el rol.

## Estructura (lo nuevo está en español)

```
src/
  tipos/dominio.ts        Tipos de datos: el contrato con el back
  servicios/              Una función por endpoint (con mocks mientras no hay back)
    cliente-api.ts        fetch base, token y variables de entorno
  datos-mock/             Datos de ejemplo con la misma forma que los tipos
  contexto/               Sesión y rol, estado compartido de Capi
  ganchos/usar-datos.ts   useDatos() para cargar servicios, useConteo() para números animados
  componentes/
    capi/                 Capi (dibujo SVG con ánimos y accesorios) y la racha fija a la derecha
    estilos.ts            Colores, fuentes y animaciones
    comunes.tsx           Encabezado de página, tarjeta, chip de estado, confeti…
    selector-rol.tsx      Cambio de rol para la demo
  secciones/              Una carpeta por pantalla (vista-*.tsx)
  paginas/                Envoltorios que ponen el <title> de cada pantalla
  utilidades/collage.ts   Arma el collage en canvas y lo descarga como PNG
  routes/                 Rutas en español + RutaProtegida por permiso
  layouts/                Layout de Minimals adaptado (menú verde, racha de Capi)
  theme/                  Tema de Minimals con la paleta Biolab
docs/contrato-api.md      Endpoints que el front espera del back
```

Las carpetas en inglés (`components`, `layouts`, `theme`, `routes`…) son de la plantilla. Se dejaron con su nombre para no romper su funcionamiento.

## Para el equipo de back

1. Lee `docs/contrato-api.md`: ahí está cada endpoint con su método, ruta y lo que regresa.
2. Las formas exactas de los datos están en `src/tipos/dominio.ts`.
3. Cuando el back esté listo, pon `VITE_USAR_MOCKS=false` y `VITE_URL_API` con la URL real. No hay que tocar las pantallas.

## Paleta

| Uso | Color |
| --- | --- |
| Verde bosque (texto, menú) | `#122A0E` |
| Verde principal | `#41553E` |
| Salvia / pastel | `#B9C4A0`, `#D5DCC6` |
| Tinto (acentos, sanciones) | `#671B1C`, `#854949` |
| Mandarina de Capi (advertencias) | `#E8964A` |
| Crema / papel | `#FFFEF8`, `#F4F2E4` |

Fuentes: **Fraunces** para títulos y **Nunito** para texto. Solo iconos (sin emojis); los íconos propios están registrados como `biolab:*` en `src/components/iconify/icon-sets.ts`.
