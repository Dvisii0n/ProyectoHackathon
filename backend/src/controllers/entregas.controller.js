import { query } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';

const FORMATO_QR = /^BIOLAB-SOLICITUD-(\d+)$/i;

/**
 * POST /api/entregas { "codigo": "BIOLAB-SOLICITUD-12" }
 *
 * El laboratorista escanea el QR de una solicitud aprobada para entregar el
 * material. Solo se puede durante el horario de la práctica y una sola vez.
 */
export async function entregar(req, res) {
  const partes = FORMATO_QR.exec(String(req.body?.codigo ?? '').trim());

  if (!partes) {
    throw new ApiError(400, 'Ese código no es un QR de solicitud de Biolab');
  }

  const peticionId = Number(partes[1]);

  const { rows } = await query(
    `SELECT a.aprobacion_id, a.entregada_en,
            p.nombre AS practica, p.fecha_inicio, p.fecha_final,
            (LOCALTIMESTAMP >= p.fecha_inicio AND LOCALTIMESTAMP <= p.fecha_final) AS en_horario,
            (LOCALTIMESTAMP < p.fecha_inicio) AS falta_para_empezar,
            (
              SELECT COUNT(*)::int
                FROM aprob_materiales am
               WHERE am.fk_id_aprobacion = a.aprobacion_id
            ) + (
              SELECT COUNT(*)::int
                FROM aprob_equipo_lab ae
               WHERE ae.fk_id_aprobacion = a.aprobacion_id
            ) + (
              SELECT COUNT(*)::int
                FROM aprob_consumibles ac
               WHERE ac.fk_id_aprobacion = a.aprobacion_id
            ) AS aprobados
       FROM peticion_eq pe
       JOIN practicas p ON p.id_practicas = pe.fk_id_practica
       LEFT JOIN aprobacion a ON a.fk_equipo = pe.fk_id_equipo AND a.fk_id_practica = pe.fk_id_practica
      WHERE pe.peticion_eq_id = $1`,
    [peticionId],
  );

  if (rows.length === 0) {
    throw new ApiError(404, 'Ese QR no corresponde a ninguna solicitud');
  }

  const solicitud = rows[0];

  if (!solicitud.aprobacion_id || solicitud.aprobados === 0) {
    throw new ApiError(409, 'Esa solicitud no está aprobada: no hay material que entregar');
  }

  if (solicitud.entregada_en) {
    throw new ApiError(409, 'El material de esa solicitud ya fue entregado');
  }

  if (!solicitud.en_horario) {
    throw new ApiError(
      409,
      solicitud.falta_para_empezar
        ? 'Todavía no es el horario de la práctica: el QR solo se puede escanear mientras dura la práctica'
        : 'La práctica ya terminó: el QR solo se puede escanear mientras dura la práctica',
      { inicio: solicitud.fecha_inicio, fin: solicitud.fecha_final },
    );
  }

  const actualizado = await query(
    `UPDATE aprobacion SET entregada_en = LOCALTIMESTAMP
      WHERE aprobacion_id = $1 AND entregada_en IS NULL
      RETURNING aprobacion_id, entregada_en`,
    [solicitud.aprobacion_id],
  );

  if (actualizado.rowCount === 0) {
    throw new ApiError(409, 'El material de esa solicitud ya fue entregado');
  }

  res.status(201).json({ entrega: { peticion_eq_id: peticionId, ...actualizado.rows[0] } });
}
