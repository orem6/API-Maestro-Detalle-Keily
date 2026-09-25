const router = require('express').Router();
const { listMisiones } = require('../controllers/misiones.controller');
router.get('/', listMisiones);
module.exports = router;
