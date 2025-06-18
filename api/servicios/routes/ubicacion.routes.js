const express = require('express');
const router = express.Router();
const ubicacionController = require('../../controllers/rest/ubicacion.controller');
const verificarJWT = require('../../middlewares/verificarJWT');
const verificarConexionBD = require('../../middlewares/verificarConexionBD');

router.put('/', verificarJWT, verificarConexionBD, ubicacionController.actualizarUbicacion);

module.exports = router;