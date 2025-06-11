const express = require('express');
const router = express.Router();
const ubicacionController = require('../../controllers/rest/ubicacion.controller');
const autenticarTokenConRoles = require('../../middlewares/authMiddleware');

router.put('/:id/ubicacion', autenticarTokenConRoles(), ubicacionController.actualizarUbicacion);
router.get('/cercanos', autenticarTokenConRoles(), ubicacionController.obtenerSolicitudesAdopcionCercanas);

module.exports = router;