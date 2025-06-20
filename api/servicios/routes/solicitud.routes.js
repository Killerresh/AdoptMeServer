const express = require('express');
const router = express.Router();
const solicitudController = require('../../controllers/rest/solicitud.controller');

router.get('/adoptante/:adopcionID', solicitudController.obtenerSolicitudesConNombresPorAdopcionID);

module.exports = router;