class AppError extends Error {
  constructor(status, error, mensaje, details) {
    super(mensaje);
    this.status = status;
    this.error = error;
    this.details = details;
  }
}

function notFound(req, res) {
  res.status(404).json({ ok: false, error: 'RECURSO_NO_ENCONTRADO', mensaje: 'La ruta solicitada no existe.' });
}

function errorHandler(error, req, res, next) { // eslint-disable-line no-unused-vars
  if (error instanceof AppError) {
    return res.status(error.status).json({
      ok: false,
      error: error.error,
      mensaje: error.message,
      ...(error.details ? error.details : {})
    });
  }

  if (error.code === 'DATABASE_NOT_CONFIGURED') {
    return res.status(503).json({ ok: false, error: 'BASE_DE_DATOS_NO_CONFIGURADA', mensaje: 'La base de datos no esta configurada.' });
  }

  if (error.number === 2627 || error.number === 2601) {
    return res.status(409).json({ ok: false, error: 'CONFLICTO', mensaje: 'Los datos ingresados entran en conflicto con un registro existente.' });
  }

  console.error('Error interno:', error.message);
  return res.status(500).json({ ok: false, error: 'ERROR_INTERNO', mensaje: 'Ocurrio un error interno.' });
}

module.exports = { AppError, notFound, errorHandler };
