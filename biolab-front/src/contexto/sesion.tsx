import type { Rol, Usuario } from 'src/tipos/dominio';

import { useMemo, useState, useContext, createContext } from 'react';

import { usuariosMock } from 'src/datos-mock';
import { guardarToken } from 'src/servicios/cliente-api';

// ----------------------------------------------------------------------
// Sesión del usuario y permisos por rol.
// Solo hay inicio de sesión (no registro): las cuentas las da de alta la
// coordinación directamente en el back. Mientras no se inicia sesión,
// `sesionIniciada` es false y las rutas mandan al login.
// ----------------------------------------------------------------------

export const nombresRol: Record<Rol, string> = {
  coordinador: 'Coordinador',
  laboratorista: 'Laboratorista',
  profesor: 'Profesor',
  alumno: 'Alumno',
};

export type Permisos = {
  verPanel: boolean;
  decidirReportes: boolean;
  crearReportes: boolean;
  /** Ver la pantalla de Inventario (el alumno lo ve desde Pedir material) */
  verInventario: boolean;
  editarInventario: boolean;
  /** Profesor: registra equipos de alumnos y crea prácticas */
  gestionarPracticas: boolean;
  /** Alumno: ve las prácticas asignadas a su equipo */
  verMisPracticas: boolean;
  /** Alumno: pide material para su equipo */
  pedirMaterial: boolean;
  /** Laboratorista: acepta/rechaza solicitudes, entrega y recibe material */
  revisarSolicitudes: boolean;
  verGaleria: boolean;
  /** Coordinador y laboratorista: dan de alta cuentas (el back lo exige) */
  gestionarUsuarios: boolean;
  /** Coordinador y laboratorista: materias, profesor y grupos de cada una */
  gestionarMaterias: boolean;
};

const ninguno: Permisos = {
  verPanel: false,
  decidirReportes: false,
  crearReportes: false,
  verInventario: false,
  editarInventario: false,
  gestionarPracticas: false,
  verMisPracticas: false,
  pedirMaterial: false,
  revisarSolicitudes: false,
  verGaleria: false,
  gestionarUsuarios: false,
  gestionarMaterias: false,
};

/** Coordinador y laboratorista hacen lo mismo, salvo ver y decidir reportes (solo el coordinador) */
const permisosGestion: Permisos = {
  ...ninguno,
  verPanel: true,
  decidirReportes: true,
  crearReportes: true,
  verInventario: true,
  editarInventario: true,
  revisarSolicitudes: true,
  gestionarUsuarios: true,
  gestionarMaterias: true,
};

/** Qué puede hacer cada rol. Las pantallas preguntan por permisos, nunca por el rol directo. */
export const permisosPorRol: Record<Rol, Permisos> = {
  coordinador: permisosGestion,
  // El laboratorista crea reportes pero no los ve: la bandeja es del coordinador
  laboratorista: { ...permisosGestion, decidirReportes: false },
  profesor: { ...ninguno, crearReportes: true, verInventario: true, gestionarPracticas: true },
  alumno: { ...ninguno, verMisPracticas: true, pedirMaterial: true, verGaleria: true },
};

type ValorSesion = {
  sesionIniciada: boolean;
  usuario: Usuario;
  rol: Rol;
  permisos: Permisos;
  /** Guarda al usuario que regresó POST /sesion */
  iniciarSesion: (usuario: Usuario) => void;
  cerrarSesion: () => void;
  /** Solo prototipo: ver la app como otro rol sin salir */
  cambiarRol: (rol: Rol) => void;
};

const ContextoSesion = createContext<ValorSesion | null>(null);

const CLAVE_USUARIO = 'biolab:usuario';

function leerUsuarioGuardado(): Usuario | null {
  try {
    const guardado = localStorage.getItem(CLAVE_USUARIO);
    if (!guardado) return null;
    const usuario = JSON.parse(guardado) as Usuario;
    return usuario.rol in permisosPorRol ? usuario : null;
  } catch {
    return null;
  }
}

function guardarUsuario(usuario: Usuario | null) {
  try {
    if (usuario) localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
    else localStorage.removeItem(CLAVE_USUARIO);
  } catch {
    // sin almacenamiento disponible
  }
}

function usuarioDeRol(rol: Rol): Usuario {
  return usuariosMock.find((u) => u.rol === rol) ?? usuariosMock[0];
}

export function ProveedorSesion({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(leerUsuarioGuardado);

  const valor = useMemo<ValorSesion>(() => {
    const iniciarSesion = (nuevo: Usuario) => {
      guardarUsuario(nuevo);
      setUsuario(nuevo);
    };

    // Mientras no hay sesión se usa un usuario "vacío" sin permisos; las rutas
    // protegidas no dejan pasar, así que ninguna pantalla lo llega a mostrar.
    const actual = usuario ?? usuarioDeRol('alumno');

    return {
      sesionIniciada: usuario !== null,
      usuario: actual,
      rol: actual.rol,
      permisos: usuario ? permisosPorRol[usuario.rol] : permisosPorRol.alumno,
      iniciarSesion,
      cerrarSesion: () => {
        guardarUsuario(null);
        guardarToken(null);
        setUsuario(null);
      },
      cambiarRol: (rol) => iniciarSesion(usuarioDeRol(rol)),
    };
  }, [usuario]);

  return <ContextoSesion.Provider value={valor}>{children}</ContextoSesion.Provider>;
}

export function useSesion(): ValorSesion {
  const contexto = useContext(ContextoSesion);
  if (!contexto) throw new Error('useSesion debe usarse dentro de <ProveedorSesion>');
  return contexto;
}
