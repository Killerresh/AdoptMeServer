const express = require('express');
const router = express.Router();
const accesoController = require('../../controllers/rest/acceso.controller');
const verificarJWT = require('../../middlewares/verificarJWT');

router.post('/iniciar-sesion', accesoController.iniciarSesion);
router.put('/', verificarJWT, accesoController.actualizarAcceso);

module.exports = router;
