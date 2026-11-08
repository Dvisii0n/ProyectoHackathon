import { query } from '../config/db.js';
import { ApiError } from './ApiError.js';
import { enteroPositivo } from './validaciones.js';

/**
 * Genera los handlers CRUD de una tabla.
 *
 * - `clave`: nombre de la PK o arreglo de columnas de una PK compuesta.
 * - `columnas`: columnas que se pueden enviar en POST/PATCH.
 * - `validar`: mapa columna -> función de validación/normalización.
 * - `requeridos`: columnas obligatorias en POST.
 * - `validarRegistro`: validación (puede ser async) que mezcla columnas; recibe la
 *   fila completa como quedaría: la actual + los cambios.
 */
export function crearRecurso({
  tabla,
  clave,
  columnas = [],
  validar = {},
  requeridos = [],
  orden,
  nombre,
  singular,
  validarRegistro,
}) {
  const claveColumnas = Array.isArray(clave) ? clave : [clave];
  const nombreLista = nombre ?? tabla;
  const nombreItem = singular ?? nombreLista;
  const ordenSql = orden ?? claveColumnas.join(', ');

  const valorParametro = (req, columna) => (
    claveColumnas.length === 1 ? req.params.id : req.params[columna]
  );

  function condicionClave(req) {
    const valores = claveColumnas.map((columna) =>
      enteroPositivo(valorParametro(req, columna), columna),
    );

    return {
      sql: claveColumnas.map((columna, i) => `${columna} = $${i + 1}`).join(' AND '),
      valores,
    };
  }

  function validarColumna(columna, valor) {
    const validador = validar[columna];
    return validador ? validador(valor) : valor;
  }

  async function listar(req, res) {
    const { rows } = await query(
      `SELECT * FROM ${tabla} ORDER BY ${ordenSql}`,
    );

    res.json({ [nombreLista]: rows });
  }

  async function obtener(req, res) {
    const { sql, valores } = condicionClave(req);

    const { rows } = await query(
      `SELECT * FROM ${tabla} WHERE ${sql}`,
      valores,
    );

    if (rows.length === 0) {
      throw new ApiError(404, 'Registro no encontrado');
    }

    res.json({ [nombreItem]: rows[0] });
  }

  async function crear(req, res) {
    const cuerpo = req.body ?? {};
    const columnasUsadas = [];
    const valores = [];

    for (const columna of columnas) {
      const valor = cuerpo[columna];

      if (valor === undefined) {
        if (requeridos.includes(columna)) {
          throw new ApiError(400, `${columna} es obligatorio`);
        }
        continue;
      }

      columnasUsadas.push(columna);
      valores.push(validarColumna(columna, valor));
    }

    if (columnasUsadas.length === 0) {
      throw new ApiError(400, 'Envía al menos un campo para crear el registro');
    }

    await validarRegistro?.(Object.fromEntries(columnasUsadas.map((c, i) => [c, valores[i]])));

    const marcadores = columnasUsadas.map((_, i) => `$${i + 1}`);

    const { rows } = await query(
      `INSERT INTO ${tabla} (${columnasUsadas.join(', ')})
       VALUES (${marcadores.join(', ')})
       RETURNING *`,
      valores,
    );

    res.status(201).json({ [nombreItem]: rows[0] });
  }

  async function actualizar(req, res) {
    const cuerpo = req.body ?? {};
    const actualizables = columnas.filter((columna) => !claveColumnas.includes(columna));
    const campos = [];
    const valores = [];

    for (const columna of actualizables) {
      const valor = cuerpo[columna];

      if (valor === undefined) {
        continue;
      }

      valores.push(validarColumna(columna, valor));
      campos.push(`${columna} = $${valores.length}`);
    }

    if (campos.length === 0) {
      throw new ApiError(400, 'Envía al menos un campo para actualizar');
    }

    if (validarRegistro) {
      const { sql, valores: valoresClave } = condicionClave(req);
      const { rows: actuales } = await query(`SELECT * FROM ${tabla} WHERE ${sql}`, valoresClave);
      if (actuales.length === 0) {
        throw new ApiError(404, 'Registro no encontrado');
      }
      const cambios = Object.fromEntries(
        actualizables.filter((c) => cuerpo[c] !== undefined).map((c) => [c, validarColumna(c, cuerpo[c])]),
      );
      await validarRegistro({ ...actuales[0], ...cambios });
    }

    const condiciones = claveColumnas.map((columna) => {
      valores.push(enteroPositivo(valorParametro(req, columna), columna));
      return `${columna} = $${valores.length}`;
    });

    const { rows } = await query(
      `UPDATE ${tabla}
          SET ${campos.join(', ')}
        WHERE ${condiciones.join(' AND ')}
        RETURNING *`,
      valores,
    );

    if (rows.length === 0) {
      throw new ApiError(404, 'Registro no encontrado');
    }

    res.json({ [nombreItem]: rows[0] });
  }

  async function eliminar(req, res) {
    const { sql, valores } = condicionClave(req);

    const { rowCount } = await query(
      `DELETE FROM ${tabla} WHERE ${sql}`,
      valores,
    );

    if (rowCount === 0) {
      throw new ApiError(404, 'Registro no encontrado');
    }

    res.status(204).send();
  }

  return {
    listar,
    obtener,
    crear,
    actualizar,
    eliminar,
    claveColumnas,
    permiteActualizar: columnas.some((columna) => !claveColumnas.includes(columna)),
  };
}
