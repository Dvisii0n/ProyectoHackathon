import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cerrarPool, query } from '../config/db.js';

const directorioActual = path.dirname(fileURLToPath(import.meta.url));
const rutaEsquema = path.resolve(directorioActual, '../../sql/schema.sql');

async function main() {
  const sql = await readFile(rutaEsquema, 'utf8');
  await query(sql);
  console.log(`Esquema aplicado correctamente: ${rutaEsquema}`);
}

main()
  .catch((error) => {
    console.error('Error al aplicar el esquema:', error.message);
    process.exitCode = 1;
  })
  .finally(() => cerrarPool());
