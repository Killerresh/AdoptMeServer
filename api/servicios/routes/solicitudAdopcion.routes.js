const express = require('express');
const router = express.Router();
const solicitudAdopcionController = require('../../controllers/rest/solicitudAdopcion.controller');

router.get('/', solicitudAdopcionController.obtenerSolicitudAdopciones);
router.post('/', solicitudAdopcionController.registrarSolicitudAdopcion);
router.delete('/:id', solicitudAdopcionController.eliminarSolicitudAdopcion);

module.exports = router;