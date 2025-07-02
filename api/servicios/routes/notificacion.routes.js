const express = require('express');
const router = express.Router();
const verificarJWT = require('../../middlewares/verificarJWT');
const notificacionController = require('../../controllers/rest/notificacion.controller');

router.get('/', verificarJWT, notificacionController.obtenerNotificaciones);

module.exports = router;
