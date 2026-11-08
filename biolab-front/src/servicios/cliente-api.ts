// ----------------------------------------------------------------------
// Cliente HTTP base. Todas las llamadas al back pasan por aquí.
//
// Variables de entorno (archivo .env, ver .env.ejemplo):
//   VITE_URL_API      URL base del back, p. ej. http://localhost:8000/api
//   VITE_USAR_MOCKS   "true" para usar src/datos-mock en lugar del back
// ----------------------------------------------------------------------

export const URL_API: string = import.meta.env.VITE_URL_API ?? 'http://localhost:8000/api';

/** Mientras el back no exista, los servicios regresan datos de ejemplo. */
export const USAR_MOCKS: boolean = (import.meta.env.VITE_USAR_MOCKS ?? 'true') === 'true';

const CLAVE_TOKEN = 'biolab:token';

export function guardarToken(token: string | null) {
  try {
    if (token) localStorage.setItem(CLAVE_TOKEN, token);
    else localStorage.removeItem(CLAVE_TOKEN);
  } catch {
    // Sin almacenamiento disponible (modo privado): se ignora
  }
}

function leerToken(): string | null {
  try {
    return localStorage.getItem(CLAVE_TOKEN);
  } catch {
    return null;
  }
}

export class ErrorApi extends Error {
  estado: number;

  constructor(mensaje: string, estado: number) {
    super(mensaje);
    this.estado = estado;
  }
}

type OpcionesPeticion = {
  metodo?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  cuerpo?: unknown;
  /** Para subir fotos: se manda tal cual, sin JSON */
  formulario?: FormData;
};

/** Hace una petición al back y regresa el JSON ya tipado. */
export async function peticion<T>(ruta: string, opciones: OpcionesPeticion = {}): Promise<T> {
  const { metodo = 'GET', cuerpo, formulario } = opciones;
  const token = leerToken();

  const encabezados: Record<string, string> = {};
  if (token) encabezados.Authorization = `Bearer ${token}`;
  if (cuerpo !== undefined) encabezados['Content-Type'] = 'application/json';

  const respuesta = await fetch(`${URL_API}${ruta}`, {
    method: metodo,
    headers: encabezados,
    body: formulario ?? (cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined),
  });

  if (!respuesta.ok) {
    const texto = await respuesta.text().catch(() => '');
    throw new ErrorApi(texto || `Error ${respuesta.status} en ${ruta}`, respuesta.status);
  }

  if (respuesta.status === 204) return undefined as T;
  return (await respuesta.json()) as T;
}

/** Simula la latencia del back para que los estados de "cargando" se vean en el prototipo. */
export function simularRespuesta<T>(datos: T, milisegundos = 350): Promise<T> {
  return new Promise((resolver) => {
    setTimeout(() => resolver(structuredClone(datos)), milisegundos);
  });
}
