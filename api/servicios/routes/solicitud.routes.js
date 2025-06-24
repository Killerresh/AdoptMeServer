const express = require('express');
const router = express.Router();
const solicitudController = require('../../controllers/rest/solicitud.controller');
const verificarJWT = require('../../middlewares/verificarJWT');

router.get('/adoptante/:adopcionID', solicitudController.obtenerSolicitudesConNombresPorAdopcionID);
router.delete('/:id', solicitudController.eliminarSolicitud);
router.post('/', verificarJWT, solicitudController.registrarSolicitud);

module.exports = router;