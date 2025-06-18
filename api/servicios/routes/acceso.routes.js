const express = require('express');
const router = express.Router();
const accesoController = require('../../controllers/rest/acceso.controller');
const verificarJWT = require('../../middlewares/verificarJWT');
const verificarConexionBD = require('../../middlewares/verificarConexionBD');

router.post('/iniciar-sesion', verificarConexionBD, accesoController.iniciarSesion);
router.put('/', verificarJWT, verificarConexionBD, accesoController.actualizarAcceso);

module.exports = router;
