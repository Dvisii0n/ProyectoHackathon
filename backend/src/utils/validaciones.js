import { ApiError } from './ApiError.js';

/** Valida un texto obligatorio y devuelve su versión sin espacios extremos. */
export function textoRequerido(valor, campo, { min = 1, max = 255 } = {}) {
  if (typeof valor !== 'string' || valor.trim().length < min) {
    throw new ApiError(400, `${campo} debe tener al menos ${min} caracteres`);
  }

  const limpio = valor.trim();

  if (limpio.length > max) {
    throw new ApiError(400, `${campo} no puede superar los ${max} caracteres`);
  }

  return limpio;
}

/** Valida un texto opcional (usado en actualizaciones parciales). */
export function textoOpcional(valor, campo, { max = 255 } = {}) {
  if (valor === undefined) {
    return undefined;
  }

  if (valor === null) {
    return null;
  }

  if (typeof valor !== 'string') {
    throw new ApiError(400, `${campo} debe ser texto`);
  }

  if (valor.trim().length > max) {
    throw new ApiError(400, `${campo} no puede superar los ${max} caracteres`);
  }

  return valor.trim();
}

/** Valida un entero positivo, opcionalmente permitiendo null. */
export function enteroPositivo(valor, campo, { permitirNulo = false } = {}) {
  if (valor === undefined) {
    return undefined;
  }

  if (valor === null) {
    if (permitirNulo) {
      return null;
    }

    throw new ApiError(400, `${campo} es obligatorio`);
  }

  const numero = Number(valor);

  if (!Number.isInteger(numero) || numero <= 0) {
    throw new ApiError(400, `${campo} debe ser un entero positivo`);
  }

  return numero;
}

/** Valida que el valor pertenezca a una lista cerrada. */
export function validarEnum(valor, campo, permitidos) {
  if (!permitidos.includes(valor)) {
    throw new ApiError(400, `${campo} debe ser uno de: ${permitidos.join(', ')}`);
  }

  return valor;
}
