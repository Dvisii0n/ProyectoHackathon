// ----------------------------------------------------------------------
// Los grupos se nombran semestre-número: "1-01" es semestre 1, grupo 1.
// Misma regla que valida el back en grupos.controller.js.
// ----------------------------------------------------------------------

/** "3-2" → "3-02"; null si no tiene el formato */
export function normalizarGrupo(texto: string): string | null {
  const partes = /^([1-9])\s*-\s*(\d{1,2})$/.exec(texto.trim());
  if (!partes || Number(partes[2]) === 0) return null;
  return `${partes[1]}-${partes[2].padStart(2, '0')}`;
}

export const AYUDA_GRUPO = 'Semestre-número, p. ej. 1-01 (semestre 1, grupo 1)';
