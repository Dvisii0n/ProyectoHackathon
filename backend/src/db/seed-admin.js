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

  if (usuario.length > 30) {
    throw new Error('El usuario no puede superar los 30 caracteres');
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
      await cliente.query(
        "UPDATE usuarios SET contrasena = $1, rol = 'ADMIN', activo = TRUE WHERE usuario_id = $2",
        [hash, existente.rows[0].usuario_id],
      );

      console.log(`Usuario existente actualizado como ADMIN: ${usuario}`);
      return;
    }

    await cliente.query(
      "INSERT INTO usuarios (usuario, contrasena, rol) VALUES ($1, $2, 'ADMIN')",
      [usuario, hash],
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
