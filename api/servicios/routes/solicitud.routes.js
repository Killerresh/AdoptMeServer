const express = require('express');
const router = express.Router();
const solicitudController = require('../../controllers/rest/solicitud.controller');

router.get('/adoptante/:adopcionID', solicitudController.obtenerSolicitudesConNombresPorAdopcionID);
router.delete('/:id', solicitudController.eliminarSolicitud);


module.exports = router;