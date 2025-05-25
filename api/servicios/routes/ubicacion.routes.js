const express = require('express');
const router = express.Router();
const ubicacionController = require('../../controllers/rest/ubicacion.controller');

router.post('/', ubicacionController.registrarUbicacion);

module.exports = router;