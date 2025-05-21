const express = require('express');
const router = express.Router();
const ubicacionController = require('../controllers/ubicacion.controller');

router.post('/', ubicacionController.definirUbicacion);

module.exports = router;