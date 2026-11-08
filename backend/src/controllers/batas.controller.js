import { conTransaccion, query } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { enteroPositivo, textoOpcional, validarEnum } from '../utils/validaciones.js';

const ESTADOS_FISICOS = ['BUENO', 'MALO', 'CON DEFECTO'];

const COLUMNAS_RENTA = `r.id_renta_batas, r.fk_id_bata, b.codigo, r.fk_id_alumno,
                        r.fecha_inicio, r.fecha_fin, r.estado_entregado, r.estado_recibido, r.comentario`;

/** El alumno de la sesión (o 403 si la cuenta no tiene perfil de alumno). */
async function alumnoDe(cliente, req) {
  const { rows } = await cliente.query('SELECT alumno_id FROM alumnos WHERE fk_usuario = $1', [req.usuario.id]);

  if (rows.length === 0) {
    throw new ApiError(403, 'Tu cuenta no tiene un perfil de alumno');
  }

  return rows[0].alumno_id;
}

/** GET /api/batas/mia — la bata que tiene el alumno, su historial y cuántas hay disponibles */
export async function miRenta(req, res) {
  const alumnoId = await alumnoDe({ query }, req);

  const [rentas, disponibles] = await Promise.all([
    query(
      `SELECT ${COLUMNAS_RENTA}
         FROM renta_batas r
         JOIN batas_lab b ON b.bata_id = r.fk_id_bata
        WHERE r.fk_id_alumno = $1
        ORDER BY r.fecha_inicio DESC`,
      [alumnoId],
    ),
    query("SELECT COUNT(*)::int AS total FROM batas_lab WHERE estado = 'DISPONIBLE'"),
  ]);

  res.json({
    activa: rentas.rows.find((r) => r.fecha_fin === null) ?? null,
    historial: rentas.rows.filter((r) => r.fecha_fin !== null),
    disponibles: disponibles.rows[0].total,
  });
}

/** POST /api/batas/rentar — el alumno pide una bata: se le asigna una disponible */
export async function rentar(req, res) {
  const renta = await conTransaccion(async (cliente) => {
    const alumnoId = await alumnoDe(cliente, req);

    const activa = await cliente.query(
      'SELECT 1 FROM renta_batas WHERE fk_id_alumno = $1 AND fecha_fin IS NULL',
      [alumnoId],
    );

    if (activa.rowCount > 0) {
      throw new ApiError(409, 'Ya tienes una bata rentada: devuélvela antes de pedir otra');
    }

    // SKIP LOCKED: si dos alumnos piden a la vez, a cada uno le toca una bata distinta
    const bata = await cliente.query(
      `SELECT bata_id, codigo
         FROM batas_lab
        WHERE estado = 'DISPONIBLE'
        ORDER BY codigo
        LIMIT 1
        FOR UPDATE SKIP LOCKED`,
    );

    if (bata.rowCount === 0) {
      throw new ApiError(409, 'No hay batas disponibles en este momento');
    }

    await cliente.query("UPDATE batas_lab SET estado = 'RENTA' WHERE bata_id = $1", [bata.rows[0].bata_id]);

    const { rows } = await cliente.query(
      `INSERT INTO renta_batas (fk_id_alumno, fk_id_bata, fecha_inicio, estado_entregado)
       VALUES ($1, $2, LOCALTIMESTAMP, 'BUENO')
       RETURNING id_renta_batas, fk_id_bata, fk_id_alumno, fecha_inicio, fecha_fin, estado_entregado`,
      [alumnoId, bata.rows[0].bata_id],
    );

    return { ...rows[0], codigo: bata.rows[0].codigo };
  });

  res.status(201).json({ renta });
}

/** GET /api/batas/rentas — todas las rentas con el nombre del alumno (laboratorio y administrador) */
export async function listarRentas(req, res) {
  const { rows } = await query(
    `SELECT ${COLUMNAS_RENTA},
            a.nombre AS alumno_nombre, a.apellido AS alumno_apellido, a.matricula, g.grupo
       FROM renta_batas r
       JOIN batas_lab b ON b.bata_id = r.fk_id_bata
       JOIN alumnos a   ON a.alumno_id = r.fk_id_alumno
       LEFT JOIN grupo g ON g.grupo_id = a.fk_grupo_id
      ORDER BY (r.fecha_fin IS NULL) DESC, r.fecha_inicio DESC`,
  );

  res.json({ rentas: rows });
}

/**
 * POST /api/batas/rentas/:id/devolucion { "estado_recibido", "comentario"? }
 * El laboratorista recibe la bata: queda por lavar y la renta se cierra.
 */
export async function devolver(req, res) {
  const id = enteroPositivo(req.params.id, 'id');
  const { estado_recibido: estado, comentario } = req.body ?? {};
  const recibido = validarEnum(estado, 'El estado en que se recibe', ESTADOS_FISICOS);
  const nota = textoOpcional(comentario, 'El comentario', { max: 255 });

  const renta = await conTransaccion(async (cliente) => {
    const { rows } = await cliente.query(
      `UPDATE renta_batas
          SET fecha_fin = LOCALTIMESTAMP, estado_recibido = $2, comentario = $3
        WHERE id_renta_batas = $1 AND fecha_fin IS NULL
        RETURNING id_renta_batas, fk_id_bata, fk_id_alumno, fecha_inicio, fecha_fin, estado_entregado, estado_recibido, comentario`,
      [id, recibido, nota ?? null],
    );

    if (rows.length === 0) {
      const existe = await cliente.query('SELECT 1 FROM renta_batas WHERE id_renta_batas = $1', [id]);

      throw new ApiError(existe.rowCount === 0 ? 404 : 409, existe.rowCount === 0 ? 'Renta no encontrada' : 'Esa bata ya fue devuelta');
    }

    await cliente.query("UPDATE batas_lab SET estado = 'LAVAR' WHERE bata_id = $1", [rows[0].fk_id_bata]);

    return rows[0];
  });

  res.json({ renta });
}
