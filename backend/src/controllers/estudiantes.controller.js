const { getEstudiantes, getEstudianteByCarnet } = require('../services/estudiantes.service');

async function listEstudiantes(req, res, next) {
  try { res.json({ ok: true, data: await getEstudiantes() }); } catch (error) { next(error); }
}

async function getEstudiante(req, res, next) {
  try { res.json({ ok: true, data: await getEstudianteByCarnet(req.params.carnet) }); } catch (error) { next(error); }
}

module.exports = { listEstudiantes, getEstudiante };
