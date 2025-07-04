const express = require('express');
const router = express.Router();
const verificarJWT = require('../../middlewares/verificarJWT');
const notificacionController = require('../../controllers/rest/notificacion.controller');

router.get('/', verificarJWT, notificacionController.obtenerNotificaciones);
router.delete('/:id', verificarJWT, notificacionController.eliminarNotificacionUsuario);
router.delete('/', verificarJWT, notificacionController.eliminarNotificacionesUsuario);

module.exports = router;