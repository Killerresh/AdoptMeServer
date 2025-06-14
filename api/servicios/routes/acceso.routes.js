const express = require('express');
const router = express.Router();
const accesoController = require('../../controllers/rest/acceso.controller');

router.post('/iniciar-sesion', accesoController.iniciarSesion);
router.put('/', accesoController.actualizarAcceso);

module.exports = router;
