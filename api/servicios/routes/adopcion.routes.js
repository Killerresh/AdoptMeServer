const express = require('express');
const router = express.Router();
const adopcionController = require('../../controllers/rest/adopcion.controller');

router.get('/', adopcionController.obtenerAdopciones);
router.get('/pendientes', adopcionController.obtenerAdopcionesPendientes);
router.get('/aceptadas', adopcionController.obtenerAdopcionesAceptadas);
router.post('/', adopcionController.registrarAdopcion);
router.delete('/:id', adopcionController.eliminarAdopcion);
router.get('/:id', adopcionController.obtenerAdopcionPorId);
router.get('/por-publicador/:publicadorId', adopcionController.obtenerAdopcionesPorPublicador);

module.exports = router;