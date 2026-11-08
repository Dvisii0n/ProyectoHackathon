import 'dotenv/config';

/** Lee una variable de entorno obligatoria, con valor por defecto opcional. */
function leer(nombre, valorPorDefecto) {
  const valor = process.env[nombre] ?? valorPorDefecto;

  if (valor === undefined || valor === '') {
    throw new Error(`Falta la variable de entorno obligatoria: ${nombre}`);
  }

  return valor;
}

function leerNumero(nombre, valorPorDefecto) {
  const valor = Number(leer(nombre, valorPorDefecto));

  if (!Number.isInteger(valor) || valor <= 0) {
    throw new Error(`La variable ${nombre} debe ser un número positivo`);
  }

  return valor;
}

function leerBooleano(nombre, valorPorDefecto = 'false') {
  return leer(nombre, valorPorDefecto).toLowerCase() === 'true';
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  puerto: leerNumero('PORT', '3000'),
  corsOrigin: leer('CORS_ORIGIN', '*'),
  db: {
    host: leer('DB_HOST', 'localhost'),
    port: leerNumero('DB_PORT', '5432'),
    user: leer('DB_USER'),
    password: leer('DB_PASSWORD'),
    database: leer('DB_NAME', 'hackathon'),
    ssl: leerBooleano('DB_SSL'),
  },
  jwt: {
    secret: leer('JWT_SECRET'),
    expiresIn: leer('JWT_EXPIRES_IN', '1d'),
  },
};
