const router = require('express').Router();
const { listEstudiantes, getEstudiante } = require('../controllers/estudiantes.controller');
router.get('/', listEstudiantes);
router.get('/:carnet', getEstudiante);
module.exports = router;
