const { validateRegistro } = require('../validators/registro.validator');
const { registerProgress } = require('../services/registro.service');

async function createRegistro(req, res, next) {
  try {
    const registro = validateRegistro(req.body);
    const data = await registerProgress(registro);
    res.status(200).json({ ok: true, mensaje: 'Progreso guardado correctamente.', data });
  } catch (error) { next(error); }
}

module.exports = { createRegistro };
