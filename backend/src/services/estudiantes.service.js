const { getPool, sql } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

function withProgress(row) {
  const total = Number(row.total || 0);
  const completadas = Number(row.completadas || 0);
  const pendientes = Math.max(0, total - completadas);
  return { ...row, misiones: total, total, completadas, pendientes, porcentaje: total ? Number(((completadas / total) * 100).toFixed(2)) : 0 };
}

async function getEstudiantes() {
  const pool = await getPool();
  const result = await pool.request().query(`
    WITH TotalMisiones AS (SELECT COUNT(*) AS total FROM Misiones)
    SELECT e.Carnet AS carnet, e.Nombre AS nombre, e.Correo AS correo,
      tm.total AS total,
      COALESCE(SUM(CASE WHEN em.Estado = 1 THEN 1 ELSE 0 END), 0) AS completadas
    FROM Estudiantes e
    CROSS JOIN TotalMisiones tm
    LEFT JOIN EstudianteMisiones em ON em.Carnet = e.Carnet
    GROUP BY e.Carnet, e.Nombre, e.Correo, tm.total
    ORDER BY e.Nombre, e.Carnet;
  `);
  return result.recordset.map(withProgress);
}

async function getEstudianteByCarnet(carnet) {
  const pool = await getPool();
  const studentResult = await pool.request()
    .input('Carnet', sql.VarChar(25), carnet)
    .query('SELECT Carnet AS carnet, Nombre AS nombre, Correo AS correo FROM Estudiantes WHERE Carnet = @Carnet;');

  if (!studentResult.recordset[0]) {
    throw new AppError(404, 'ESTUDIANTE_NO_ENCONTRADO', 'El estudiante solicitado no existe.');
  }

  const missionsResult = await pool.request()
    .input('Carnet', sql.VarChar(25), carnet)
    .query(`
      SELECT m.MisionID AS misionId, m.Nombre AS nombre, m.Descripcion AS descripcion,
        CAST(CASE WHEN em.Estado = 1 THEN 1 ELSE 0 END AS bit) AS estado
      FROM Misiones m
      LEFT JOIN EstudianteMisiones em ON em.MisionID = m.MisionID AND em.Carnet = @Carnet
      ORDER BY m.MisionID;
    `);

  const misiones = missionsResult.recordset.map((mission) => ({ ...mission, estado: Boolean(mission.estado) }));
  const completadas = misiones.filter((mission) => mission.estado).length;
  const total = misiones.length;
  return {
    ...studentResult.recordset[0],
    misiones,
    total,
    completadas,
    pendientes: total - completadas,
    porcentaje: total ? Number(((completadas / total) * 100).toFixed(2)) : 0
  };
}

module.exports = { getEstudiantes, getEstudianteByCarnet, withProgress };
