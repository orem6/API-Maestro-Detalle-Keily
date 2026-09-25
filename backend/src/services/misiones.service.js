const { getPool } = require('../config/database');

async function getMisiones() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT MisionID AS misionId, Nombre AS nombre, Descripcion AS descripcion
    FROM Misiones
    ORDER BY MisionID;
  `);
  return result.recordset;
}

module.exports = { getMisiones };
