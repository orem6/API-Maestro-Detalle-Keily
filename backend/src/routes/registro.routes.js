const router = require('express').Router();
const { createRegistro } = require('../controllers/registro.controller');
router.post('/', createRegistro);
module.exports = router;
