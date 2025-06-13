const express = require('express');
const router = express.Router();
const ubicacionController = require('../../controllers/rest/ubicacion.controller');
const autenticarTokenConRoles = require('../../middlewares/authMiddleware');

router.put('/:id', autenticarTokenConRoles(), ubicacionController.actualizarUbicacion);

module.exports = router;