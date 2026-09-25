const { getPool, sql } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

async function registerProgress({ maestro, detalle }) {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);
  let transactionClosed = false;
  await transaction.begin();

  try {
    const referencesRequest = new sql.Request(transaction);
    const parameterNames = detalle.map((entry, index) => {
      const parameter = `MisionID${index}`;
      referencesRequest.input(parameter, sql.Int, entry.misionId);
      return `@${parameter}`;
    });
    const references = await referencesRequest.query(`SELECT MisionID FROM Misiones WHERE MisionID IN (${parameterNames.join(', ')});`);
    const found = new Set(references.recordset.map((row) => row.MisionID));
    const misionesInvalidas = detalle.map((entry) => entry.misionId).filter((id) => !found.has(id));

    if (misionesInvalidas.length) {
      await transaction.rollback();
      transactionClosed = true;
      throw new AppError(400, 'REFERENCIA_INVALIDA', 'Una o mas misiones no existen en el catalogo.', { misionesInvalidas });
    }

    const studentRequest = new sql.Request(transaction);
    studentRequest.input('Carnet', sql.VarChar(25), maestro.carnet);
    const existing = await studentRequest.query('SELECT Carnet FROM Estudiantes WHERE Carnet = @Carnet;');
    if (existing.recordset[0]) {
      await new sql.Request(transaction)
        .input('Carnet', sql.VarChar(25), maestro.carnet)
        .input('Nombre', sql.NVarChar(150), maestro.nombre)
        .input('Correo', sql.NVarChar(150), maestro.correo)
        .query('UPDATE Estudiantes SET Nombre = @Nombre, Correo = @Correo WHERE Carnet = @Carnet;');
    } else {
      await new sql.Request(transaction)
        .input('Carnet', sql.VarChar(25), maestro.carnet)
        .input('Nombre', sql.NVarChar(150), maestro.nombre)
        .input('Correo', sql.NVarChar(150), maestro.correo)
        .query('INSERT INTO Estudiantes (Carnet, Nombre, Correo) VALUES (@Carnet, @Nombre, @Correo);');
    }

    for (const item of detalle) {
      const detailRequest = new sql.Request(transaction);
      detailRequest.input('Carnet', sql.VarChar(25), maestro.carnet);
      detailRequest.input('MisionID', sql.Int, item.misionId);
      const existingDetail = await detailRequest.query('SELECT DetalleID FROM EstudianteMisiones WHERE Carnet = @Carnet AND MisionID = @MisionID;');
      if (existingDetail.recordset[0]) {
        await new sql.Request(transaction)
          .input('Carnet', sql.VarChar(25), maestro.carnet)
          .input('MisionID', sql.Int, item.misionId)
          .input('Estado', sql.Bit, item.estado)
          .query('UPDATE EstudianteMisiones SET Estado = @Estado WHERE Carnet = @Carnet AND MisionID = @MisionID;');
      } else {
        await new sql.Request(transaction)
          .input('Carnet', sql.VarChar(25), maestro.carnet)
          .input('MisionID', sql.Int, item.misionId)
          .input('Estado', sql.Bit, item.estado)
          .query('INSERT INTO EstudianteMisiones (Carnet, MisionID, Estado) VALUES (@Carnet, @MisionID, @Estado);');
      }
    }

    await transaction.commit();
    transactionClosed = true;
    return { carnet: maestro.carnet, misionesProcesadas: detalle.length };
  } catch (error) {
    if (!transactionClosed) {
      try { await transaction.rollback(); } catch (rollbackError) { /* Transaction was already closed. */ }
    }
    throw error;
  }
}

module.exports = { registerProgress };
