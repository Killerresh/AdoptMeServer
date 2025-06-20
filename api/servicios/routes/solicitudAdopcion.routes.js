const express = require('express');
const router = express.Router();
const solicitudAdopcionController = require('../../controllers/rest/solicitudAdopcion.controller');

router.get('/', solicitudAdopcionController.obtenerSolicitudAdopciones);
router.get('/pendientes', solicitudAdopcionController.obtenerSolicitudesPendientes);
router.get('/aceptadas', solicitudAdopcionController.obtenerSolicitudesAceptadas);
router.post('/', solicitudAdopcionController.registrarSolicitudAdopcion);
router.delete('/:id', solicitudAdopcionController.eliminarSolicitudAdopcion);
router.get('/:id', solicitudAdopcionController.obtenerSolicitudAdopcionPorId);
router.get('/por-publicador/:publicadorId', solicitudAdopcionController.obtenerSolicitudesPorPublicador);

module.exports = router;