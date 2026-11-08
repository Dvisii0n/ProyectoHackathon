import type { NuevaCuenta } from 'src/tipos/dominio';

// ----------------------------------------------------------------------
// Mismas reglas que valida el back en POST /auth/registro, para avisar
// antes de mandar el formulario. Si el back cambia una regla, se cambia aquí.
// ----------------------------------------------------------------------

export type ErroresCuenta = Partial<Record<'usuario' | 'contrasena' | 'nombre' | 'apellido' | 'matricula' | 'grupoId', string>>;

export const LIMITES_CUENTA = {
  usuario: { min: 3, max: 30 },
  contrasenaMin: 4,
  nombre: { alumno: 60, personal: 100 },
  apellido: { alumno: 80, personal: 100 },
  matricula: 8,
} as const;

export function validarCuenta(datos: NuevaCuenta): ErroresCuenta {
  const errores: ErroresCuenta = {};
  const esAlumno = datos.tipo === 'ALUMNO';

  const usuario = datos.usuario.trim();
  if (usuario.length < LIMITES_CUENTA.usuario.min) errores.usuario = `Escribe al menos ${LIMITES_CUENTA.usuario.min} letras`;
  else if (usuario.length > LIMITES_CUENTA.usuario.max) errores.usuario = `Máximo ${LIMITES_CUENTA.usuario.max} caracteres`;

  if (datos.contrasena.length < LIMITES_CUENTA.contrasenaMin) errores.contrasena = `Debe tener al menos ${LIMITES_CUENTA.contrasenaMin} caracteres`;

  const maxNombre = esAlumno ? LIMITES_CUENTA.nombre.alumno : LIMITES_CUENTA.nombre.personal;
  if (datos.nombre.trim() === '') errores.nombre = 'Escribe el nombre';
  else if (datos.nombre.trim().length > maxNombre) errores.nombre = `Máximo ${maxNombre} caracteres`;

  const maxApellido = esAlumno ? LIMITES_CUENTA.apellido.alumno : LIMITES_CUENTA.apellido.personal;
  if (datos.apellido.trim() === '') errores.apellido = 'Escribe el apellido';
  else if (datos.apellido.trim().length > maxApellido) errores.apellido = `Máximo ${maxApellido} caracteres`;

  if (esAlumno) {
    const matricula = (datos.matricula ?? '').trim();
    if (matricula === '') errores.matricula = 'La matrícula es obligatoria para alumnos';
    else if (matricula.length !== LIMITES_CUENTA.matricula) errores.matricula = `La matrícula debe tener ${LIMITES_CUENTA.matricula} caracteres`;

    if (datos.grupoId === null || datos.grupoId === undefined) errores.grupoId = 'Elige un grupo para el alumno';
  }

  return errores;
}
