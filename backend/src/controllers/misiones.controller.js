const { getMisiones } = require('../services/misiones.service');

async function listMisiones(req, res, next) {
  try { res.json({ ok: true, data: await getMisiones() }); } catch (error) { next(error); }
}

module.exports = { listMisiones };
