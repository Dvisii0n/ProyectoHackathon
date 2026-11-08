import { ApiError } from './ApiError.js';

/**
 * Unidades válidas por tipo de producto. El front tiene la misma regla en
 * biolab-front/src/utilidades/unidades.ts.
 *
 * - CONSUMIBLE: se cuenta por piezas o empaques (5 cajas, 20 pzas).
 * - REACTIVO: se cuenta por envases con su presentación (2 × frasco 500 g).
 */
export const UNIDADES_CONTEO = ['pzas', 'cajas', 'cajitas', 'bolsas', 'botes', 'paquetes', 'rollos'];
export const UNIDADES_PRESENTACION = ['mg', 'g', 'kg', 'ml', 'l'];

const PRESENTACION = new RegExp(`^frasco \\d+(\\.\\d+)? (${UNIDADES_PRESENTACION.join('|')})$`, 'i');

export function unidadValida(tipo, unidad) {
  if (typeof unidad !== 'string') return false;
  const limpia = unidad.trim();

  if (tipo === 'REACTIVO') {
    return PRESENTACION.test(limpia) || /^galón$/i.test(limpia) || /^kit( .{1,16})?$/i.test(limpia);
  }

  return UNIDADES_CONTEO.includes(limpia.toLowerCase());
}

export function validarUnidad(tipo, unidad) {
  if (!unidadValida(tipo, unidad)) {
    const ayuda = tipo === 'REACTIVO'
      ? 'usa "frasco" con su presentación (p. ej. frasco 500 g, frasco 1000 ml), "galón" o "kit"'
      : `usa una de: ${UNIDADES_CONTEO.join(', ')}`;
    throw new ApiError(400, `La unidad "${unidad}" no es válida para un ${tipo === 'REACTIVO' ? 'reactivo' : 'consumible'}: ${ayuda}`);
  }
}
