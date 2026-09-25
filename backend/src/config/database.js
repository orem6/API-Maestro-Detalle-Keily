const sql = require('mssql');

const requiredVariables = ['DB_USER', 'DB_PASSWORD', 'DB_SERVER', 'DB_DATABASE'];
let poolPromise;

function isDatabaseConfigured() {
  return requiredVariables.every((name) => Boolean(process.env[name] && process.env[name].trim()));
}

function databaseConfig() {
  return {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: Number(process.env.DB_PORT || 1433),
    options: {
      encrypt: process.env.DB_ENCRYPT !== 'false',
      trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false'
    },
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 }
  };
}

async function getPool() {
  if (!isDatabaseConfigured()) {
    const error = new Error('La base de datos no esta configurada.');
    error.code = 'DATABASE_NOT_CONFIGURED';
    throw error;
  }

  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(databaseConfig()).connect().catch((error) => {
      poolPromise = undefined;
      throw error;
    });
  }

  return poolPromise;
}

module.exports = { sql, getPool, isDatabaseConfigured };
