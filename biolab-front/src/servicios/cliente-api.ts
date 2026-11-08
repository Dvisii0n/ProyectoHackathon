// ----------------------------------------------------------------------
// Cliente HTTP base. Todas las llamadas al back pasan por aquí.
//
// Variables de entorno (archivo .env, ver .env.ejemplo):
//   VITE_URL_API      URL base del back, p. ej. http://localhost:3000/api
//   VITE_USAR_MOCKS   "true" para usar src/datos-mock en lugar del back
// ----------------------------------------------------------------------

export const URL_API: string = import.meta.env.VITE_URL_API ?? 'http://localhost:3000/api';

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
  /** Archivo en binario (una foto): el Content-Type es el del archivo */
  archivo?: Blob;
  /** Nombre original del archivo, para guardarlo junto a la foto */
  nombreArchivo?: string;
};

/** El back responde { "error": "mensaje" }: se arma un ErrorApi solo con el mensaje */
async function errorDeRespuesta(respuesta: Response, ruta: string): Promise<ErrorApi> {
  const texto = await respuesta.text().catch(() => '');
  let mensaje = texto;
  try {
    const cuerpoError = JSON.parse(texto) as { error?: string };
    if (cuerpoError.error) mensaje = cuerpoError.error;
  } catch {
    // no era JSON: se deja el texto tal cual
  }
  return new ErrorApi(mensaje || `Error ${respuesta.status} en ${ruta}`, respuesta.status);
}

/** Baja un archivo protegido (una foto) con la sesión iniciada y lo regresa como Blob */
export async function peticionBlob(ruta: string): Promise<Blob> {
  const token = leerToken();
  const respuesta = await fetch(`${URL_API}${ruta}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!respuesta.ok) throw await errorDeRespuesta(respuesta, ruta);
  return respuesta.blob();
}

/** Hace una petición al back y regresa el JSON ya tipado. */
export async function peticion<T>(ruta: string, opciones: OpcionesPeticion = {}): Promise<T> {
  const { metodo = 'GET', cuerpo, formulario, archivo, nombreArchivo } = opciones;
  const token = leerToken();

  const encabezados: Record<string, string> = {};
  if (token) encabezados.Authorization = `Bearer ${token}`;
  if (cuerpo !== undefined) encabezados['Content-Type'] = 'application/json';
  if (archivo) {
    encabezados['Content-Type'] = archivo.type || 'application/octet-stream';
    if (nombreArchivo) encabezados['X-Nombre-Archivo'] = encodeURIComponent(nombreArchivo);
  }

  const respuesta = await fetch(`${URL_API}${ruta}`, {
    method: metodo,
    headers: encabezados,
    body: archivo ?? formulario ?? (cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined),
  });

  if (!respuesta.ok) throw await errorDeRespuesta(respuesta, ruta);

  if (respuesta.status === 204) return undefined as T;
  return (await respuesta.json()) as T;
}

/** Simula la latencia del back para que los estados de "cargando" se vean en el prototipo. */
export function simularRespuesta<T>(datos: T, milisegundos = 350): Promise<T> {
  return new Promise((resolver) => {
    setTimeout(() => resolver(structuredClone(datos)), milisegundos);
  });
}
