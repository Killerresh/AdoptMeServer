const express = require('express');
const router = express.Router();
const ubicacionController = require('../../controllers/rest/ubicacion.controller');
const verificarJWT = require('../../middlewares/verificarJWT')

router.put('/', verificarJWT, ubicacionController.actualizarUbicacion);

module.exports = router;