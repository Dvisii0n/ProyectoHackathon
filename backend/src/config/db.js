import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

/** Pool de conexiones reutilizables a PostgreSQL. */
export const pool = new Pool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  ...(env.db.ssl ? { ssl: { rejectUnauthorized: false } } : {}),
});

pool.on('error', (error) => {
  console.error('Error inesperado en el pool de PostgreSQL:', error.message);
});

/** Ejecuta una consulta SQL con parámetros. */
export function query(texto, parametros = []) {
  return pool.query(texto, parametros);
}

/**
 * Ejecuta una función dentro de una transacción.
 * La función recibe un cliente de PostgreSQL para ejecutar sus consultas.
 */
export async function conTransaccion(operacion) {
  const cliente = await pool.connect();

  try {
    await cliente.query('BEGIN');
    const resultado = await operacion(cliente);
    await cliente.query('COMMIT');
    return resultado;
  } catch (error) {
    await cliente.query('ROLLBACK');
    throw error;
  } finally {
    cliente.release();
  }
}

/** Comprueba que la base de datos responde. */
export async function probarConexion() {
  const resultado = await pool.query('SELECT 1 AS ok');
  return resultado.rows[0]?.ok === 1;
}

/** Cierra todas las conexiones del pool. */
export function cerrarPool() {
  return pool.end();
}
