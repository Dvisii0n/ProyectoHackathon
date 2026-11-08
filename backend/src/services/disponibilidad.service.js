import { query } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Disponibilidad de los artículos del inventario para una práctica.
 *
 *   disponible = existencia - comprometido        (0 si no está DISPONIBLE)
 *
 * `comprometido` es lo ya aprobado a otros equipos:
 * - Equipo y materiales (se regresan): solo cuentan las prácticas que se
 *   empalman en horario con esta, porque a otra hora ya estarán de vuelta.
 * - Consumibles (se gastan): cuentan todas las prácticas que aún no terminan.
 *
 * Solo cuenta lo aprobado (tablas aprob_*), no lo que está pendiente de revisar.
 */
const SQL = (filtro) => `
  WITH ventana AS (
    SELECT fecha_inicio AS ini, fecha_final AS fin FROM practicas WHERE id_practicas = $1
  ), items AS (
    SELECT c.id_catalogo, c.nombre, c.categoria::text AS categoria,
           COALESCE(m.cantidad, e.cantidad, k.cantidad, 0) AS existencia,
           COALESCE(m.estado::text, e.estado::text, 'DISPONIBLE') AS estado,
           m.id_materiales, e.id_equipo_lab, k.id_consumibles
      FROM catalogo c
      LEFT JOIN materiales  m ON m.fk_id_catalogo = c.id_catalogo
      LEFT JOIN equipo_lab  e ON e.fk_id_catalogo = c.id_catalogo
      LEFT JOIN consumibles k ON k.fk_id_catalogo = c.id_catalogo
     ${filtro}
  )
  SELECT i.id_catalogo, i.nombre, i.categoria, i.existencia, i.estado,
         COALESCE((
           SELECT SUM(pc.cantidad)
             FROM peticion_catalogo pc
             JOIN peticion_eq pe ON pe.peticion_eq_id = pc.peticion_eq_id
             JOIN practicas p    ON p.id_practicas = pe.fk_id_practica
             JOIN aprobacion a   ON a.fk_equipo = pe.fk_id_equipo AND a.fk_id_practica = pe.fk_id_practica
            WHERE pc.fk_id_catalogo = i.id_catalogo
              AND pe.peticion_eq_id IS DISTINCT FROM $2::int
              AND (
                    EXISTS (SELECT 1 FROM aprob_materiales  am WHERE am.fk_id_aprobacion = a.aprobacion_id AND am.fk_id_material    = i.id_materiales)
                 OR EXISTS (SELECT 1 FROM aprob_equipo_lab  ae WHERE ae.fk_id_aprobacion = a.aprobacion_id AND ae.fk_id_equipo_lab = i.id_equipo_lab)
                 OR EXISTS (SELECT 1 FROM aprob_consumibles ac WHERE ac.fk_id_aprobacion = a.aprobacion_id AND ac.fk_id_consumible = i.id_consumibles)
              )
              AND (
                    (i.categoria = 'CONSUMIBLES'  AND p.fecha_final > LOCALTIMESTAMP)
                 OR (i.categoria <> 'CONSUMIBLES' AND p.fecha_inicio < v.fin AND v.ini < p.fecha_final)
              )
         ), 0)::int AS comprometido
    FROM items i CROSS JOIN ventana v
   ORDER BY i.nombre`;

function armar(fila) {
  const enUso = fila.estado !== 'DISPONIBLE';
  const libre = Math.max(0, fila.existencia - fila.comprometido);

  let motivo = null;
  if (fila.existencia === 0) motivo = 'Agotado';
  else if (fila.estado === 'PRESTADO') motivo = 'Está en uso';
  else if (fila.estado === 'BAJA') motivo = 'Está dado de baja';
  else if (libre === 0) motivo = 'Todo está apartado para otras prácticas';

  return {
    id_catalogo: fila.id_catalogo,
    nombre: fila.nombre,
    categoria: fila.categoria,
    existencia: fila.existencia,
    comprometido: fila.comprometido,
    estado: fila.estado,
    disponible: enUso ? 0 : libre,
    motivo,
  };
}

/** Disponibilidad de todos los artículos (o de uno) para una práctica, sin contar la petición `peticionId`. */
export async function disponibilidadDePractica(practicaId, { peticionId = null, idCatalogo = null } = {}) {
  const existe = await query('SELECT 1 FROM practicas WHERE id_practicas = $1', [practicaId]);

  if (existe.rowCount === 0) {
    throw new ApiError(404, 'Práctica no encontrada');
  }

  const parametros = [practicaId, peticionId];
  let filtro = '';

  if (idCatalogo !== null) {
    parametros.push(idCatalogo);
    filtro = 'WHERE c.id_catalogo = $3';
  }

  const { rows } = await query(SQL(filtro), parametros);
  return rows.map(armar);
}

/** Petición de un equipo para una práctica, y si el laboratorista ya la revisó. */
async function buscarPeticion(peticionId) {
  const { rows } = await query(
    `SELECT pe.peticion_eq_id, pe.fk_id_practica, pe.fk_id_equipo,
            EXISTS (
              SELECT 1 FROM aprobacion a
               WHERE a.fk_equipo = pe.fk_id_equipo AND a.fk_id_practica = pe.fk_id_practica
            ) AS revisada
       FROM peticion_eq pe
      WHERE pe.peticion_eq_id = $1`,
    [peticionId],
  );

  return rows[0] ?? null;
}

/** Lanza un error claro si no se puede prestar `cantidad` de ese artículo. */
function exigirSuficiente(item, cantidad) {
  if (item.existencia === 0) {
    throw new ApiError(409, `${item.nombre} está agotado`);
  }

  if (item.estado !== 'DISPONIBLE') {
    throw new ApiError(409, `${item.nombre} no está disponible (${item.estado === 'PRESTADO' ? 'está en uso' : 'está dado de baja'})`);
  }

  if (cantidad > item.disponible) {
    const apartado = item.comprometido > 0 ? `; ${item.comprometido} ya están apartadas para otros equipos` : '';
    throw new ApiError(
      409,
      `No hay suficiente ${item.nombre}: se piden ${cantidad} y hay ${item.disponible} disponibles (existencia ${item.existencia}${apartado})`,
    );
  }
}

/** Validación al pedir: se llama antes de guardar o cambiar un renglón de la solicitud. */
export async function validarRenglon({ peticionId, idCatalogo, cantidad }) {
  const pedida = cantidad ?? 1;

  if (!Number.isInteger(pedida) || pedida < 1) {
    throw new ApiError(400, 'La cantidad debe ser un entero de 1 en adelante');
  }

  const peticion = await buscarPeticion(peticionId);

  if (!peticion) {
    throw new ApiError(400, 'La petición no existe');
  }

  if (peticion.revisada) {
    throw new ApiError(409, 'La solicitud ya fue revisada: ya no se pueden cambiar sus materiales');
  }

  const [item] = await disponibilidadDePractica(peticion.fk_id_practica, { peticionId, idCatalogo });

  if (!item) {
    throw new ApiError(400, 'El artículo no existe en el inventario');
  }

  exigirSuficiente(item, pedida);
}

const DETALLES = {
  material: { tabla: 'materiales', clave: 'id_materiales' },
  equipo: { tabla: 'equipo_lab', clave: 'id_equipo_lab' },
  consumible: { tabla: 'consumibles', clave: 'id_consumibles' },
};

/** Validación al aprobar: lo que se aprueba debe haberse pedido y alcanzar en ese horario. */
export async function validarAprobacion({ idAprobacion, tipo, idDetalle }) {
  const aprobacion = await query('SELECT fk_equipo, fk_id_practica FROM aprobacion WHERE aprobacion_id = $1', [idAprobacion]);

  if (aprobacion.rowCount === 0) {
    throw new ApiError(400, 'La aprobación no existe');
  }

  const { fk_equipo: equipoId, fk_id_practica: practicaId } = aprobacion.rows[0];
  const { tabla, clave } = DETALLES[tipo];

  const detalle = await query(`SELECT fk_id_catalogo FROM ${tabla} WHERE ${clave} = $1`, [idDetalle]);

  if (detalle.rowCount === 0) {
    throw new ApiError(400, 'El artículo no existe en el inventario');
  }

  const idCatalogo = detalle.rows[0].fk_id_catalogo;

  const renglon = await query(
    `SELECT pe.peticion_eq_id, pc.cantidad
       FROM peticion_eq pe
       JOIN peticion_catalogo pc ON pc.peticion_eq_id = pe.peticion_eq_id
      WHERE pe.fk_id_equipo = $1 AND pe.fk_id_practica = $2 AND pc.fk_id_catalogo = $3`,
    [equipoId, practicaId, idCatalogo],
  );

  if (renglon.rowCount === 0) {
    throw new ApiError(400, 'Ese equipo no solicitó este artículo');
  }

  const { peticion_eq_id: peticionId, cantidad } = renglon.rows[0];
  const [item] = await disponibilidadDePractica(practicaId, { peticionId, idCatalogo });

  exigirSuficiente(item, cantidad);
}
