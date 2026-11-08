import type { TipoConsumible } from 'src/tipos/dominio';

// ----------------------------------------------------------------------
// Unidades válidas por tipo de producto. Es la misma regla que valida el
// back en backend/src/utils/unidades.js.
//
// - Materiales: piezas. Equipo: equipos.
// - Consumible: se cuenta por piezas o empaques (5 cajas, 20 pzas).
// - Reactivo: se cuenta por envases con su presentación (2 × frasco 500 g).
// ----------------------------------------------------------------------

export const UNIDADES_CONTEO = ['pzas', 'cajas', 'cajitas', 'bolsas', 'botes', 'paquetes', 'rollos'] as const;
export const UNIDADES_PRESENTACION = ['mg', 'g', 'kg', 'ml', 'l'] as const;
export const ENVASES_REACTIVO = ['frasco', 'galón', 'kit'] as const;

export type EnvaseReactivo = (typeof ENVASES_REACTIVO)[number];

const PRESENTACION = new RegExp(`^\\d+(\\.\\d+)? (${UNIDADES_PRESENTACION.join('|')})$`, 'i');

/** "500 g", "1000 ml"… */
export function presentacionValida(presentacion: string) {
  return PRESENTACION.test(presentacion.trim());
}

export function unidadValida(tipo: TipoConsumible, unidad: string) {
  const limpia = unidad.trim();
  if (tipo === 'REACTIVO') {
    if (/^galón$/i.test(limpia)) return true;
    if (/^kit( .{1,16})?$/i.test(limpia)) return true;
    const frasco = /^frasco (.+)$/i.exec(limpia);
    return !!frasco && presentacionValida(frasco[1]);
  }
  return (UNIDADES_CONTEO as readonly string[]).includes(limpia.toLowerCase());
}

/** "frasco 500 g" → { envase: 'frasco', presentacion: '500 g' } */
export function separarUnidadReactivo(unidad: string): { envase: EnvaseReactivo; presentacion: string } {
  const [primera, ...resto] = unidad.trim().split(' ');
  const envase = (ENVASES_REACTIVO as readonly string[]).includes(primera?.toLowerCase()) ? (primera.toLowerCase() as EnvaseReactivo) : 'frasco';
  return { envase, presentacion: resto.join(' ') };
}

export function unirUnidadReactivo(envase: EnvaseReactivo, presentacion: string) {
  if (envase === 'galón') return 'galón';
  return [envase, presentacion.trim()].filter(Boolean).join(' ');
}
