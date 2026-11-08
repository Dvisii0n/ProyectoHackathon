import type { Practica, BloqueHorario } from 'src/tipos/dominio';

// ----------------------------------------------------------------------
// Convierte prácticas (fecha de inicio y fin) en bloques de 1 hora del
// calendario semanal. Una práctica de 10:30 a 12:00 ocupa los bloques de
// 10 y 11. Solo cuentan lunes a viernes de la semana pedida.
// ----------------------------------------------------------------------

const HORA = 3_600_000;

/** Lunes 00:00 de la semana de `fecha` */
export function lunesDe(fecha: Date): Date {
  const lunes = new Date(fecha);
  lunes.setDate(lunes.getDate() - ((lunes.getDay() + 6) % 7));
  lunes.setHours(0, 0, 0, 0);
  return lunes;
}

/** Semana a mostrar por defecto: la actual, o la siguiente si ya es sábado o domingo */
export function semanaVigente(hoy: Date = new Date()): Date {
  const lunes = lunesDe(hoy);
  const esFinDeSemana = hoy.getDay() === 0 || hoy.getDay() === 6;
  return esFinDeSemana ? lunesDe(new Date(lunes.getTime() + 8 * 24 * HORA)) : lunes;
}

/** Fin de la práctica: la fecha final, o inicio + duración en los datos viejos */
export function finDePractica(practica: Pick<Practica, 'inicio' | 'fin' | 'duracionHoras'>): Date {
  return practica.fin ? new Date(practica.fin) : new Date(new Date(practica.inicio).getTime() + practica.duracionHoras * HORA);
}

export function bloquesDePractica(practica: Practica, lunes: Date): BloqueHorario[] {
  const inicioSemana = lunes.getTime();
  const finSemana = inicioSemana + 5 * 24 * HORA; // sábado 00:00
  const inicio = new Date(practica.inicio);
  const fin = finDePractica(practica).getTime();

  const bloques: BloqueHorario[] = [];
  const cursor = new Date(inicio);
  cursor.setMinutes(0, 0, 0);

  for (; cursor.getTime() < fin; cursor.setTime(cursor.getTime() + HORA)) {
    const t = cursor.getTime();
    if (t < inicioSemana || t >= finSemana) continue;
    const dia = ((cursor.getDay() + 6) % 7) as BloqueHorario['dia'];
    bloques.push({
      id: `${practica.id}-${t}`,
      dia,
      hora: cursor.getHours(),
      laboratorioId: practica.laboratorioId,
      practica: practica.nombre,
      grupo: practica.grupo,
    });
  }

  return bloques;
}

/** ¿Se empalman dos rangos de tiempo? */
export function seEmpalman(a: { inicio: Date; fin: Date }, b: { inicio: Date; fin: Date }) {
  return a.inicio < b.fin && b.inicio < a.fin;
}
