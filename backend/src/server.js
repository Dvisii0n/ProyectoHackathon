import app from './app.js';
import { cerrarPool, probarConexion } from './config/db.js';
import { env } from './config/env.js';

async function iniciar() {
  try {
    await probarConexion();
    console.log('Conexión a PostgreSQL establecida');
  } catch (error) {
    console.error('No se pudo conectar a PostgreSQL:', error.message);
    process.exit(1);
  }

  const servidor = app.listen(env.puerto, () => {
    console.log(`API escuchando en http://localhost:${env.puerto}/api`);
  });

  async function apagar(senal) {
    console.log(`\n${senal} recibido, cerrando servidor...`);

    servidor.close(async () => {
      await cerrarPool();
      process.exit(0);
    });
  }

  process.on('SIGINT', () => apagar('SIGINT'));
  process.on('SIGTERM', () => apagar('SIGTERM'));
}

iniciar();
