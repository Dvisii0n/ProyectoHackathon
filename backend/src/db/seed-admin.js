import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { cerrarPool, conTransaccion } from '../config/db.js';

const usuario = (process.argv[2] ?? process.env.ADMIN_USER ?? '').trim().toLowerCase();
const contrasena = process.argv[3] ?? process.env.ADMIN_PASSWORD ?? '';

async function main() {
  if (!usuario || !contrasena) {
    throw new Error('Uso: npm run db:admin -- <usuario> <contrasena>');
  }

  if (usuario.length < 3) {
    throw new Error('El usuario debe tener al menos 3 caracteres');
  }

  if (contrasena.length < 4) {
    throw new Error('La contraseña debe tener al menos 4 caracteres');
  }

  const hash = await bcrypt.hash(contrasena, 10);

  await conTransaccion(async (cliente) => {
    const existente = await cliente.query(
      'SELECT usuario_id FROM usuarios WHERE usuario = $1',
      [usuario],
    );

    if (existente.rowCount > 0) {
      const usuarioId = existente.rows[0].usuario_id;

      const alumno = await cliente.query(
        'SELECT alumno_id FROM alumnos WHERE usuario_id = $1',
        [usuarioId],
      );

      if (alumno.rowCount > 0) {
        throw new Error('Ese usuario ya existe como alumno; usa otro nombre');
      }

      await cliente.query(
        'UPDATE usuarios SET contrasena = $1 WHERE usuario_id = $2',
        [hash, usuarioId],
      );

      const personal = await cliente.query(
        'SELECT profesor_id FROM personal WHERE usuario_id = $1',
        [usuarioId],
      );

      if (personal.rowCount > 0) {
        await cliente.query(
          "UPDATE personal SET tipo = 'ADMIN' WHERE usuario_id = $1",
          [usuarioId],
        );
      } else {
        await cliente.query(
          `INSERT INTO personal (nombre, apellido, tipo, usuario_id)
           VALUES ('Administrador', 'Sistema', 'ADMIN', $1)`,
          [usuarioId],
        );
      }

      console.log(`Usuario existente actualizado como ADMIN: ${usuario}`);
      return;
    }

    const { rows } = await cliente.query(
      `INSERT INTO usuarios (usuario, contrasena)
       VALUES ($1, $2)
       RETURNING usuario_id`,
      [usuario, hash],
    );

    await cliente.query(
      `INSERT INTO personal (nombre, apellido, tipo, usuario_id)
       VALUES ('Administrador', 'Sistema', 'ADMIN', $1)`,
      [rows[0].usuario_id],
    );

    console.log(`Administrador creado: ${usuario}`);
  });
}

main()
  .catch((error) => {
    console.error('Error:', error.message);
    process.exitCode = 1;
  })
  .finally(() => cerrarPool());
