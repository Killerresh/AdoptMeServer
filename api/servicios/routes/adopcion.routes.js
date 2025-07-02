const express = require('express');
const router = express.Router();
const adopcionController = require('../../controllers/rest/adopcion.controller');
const verificarJWT = require('../../middlewares/verificarJWT');

router.get('/', adopcionController.obtenerAdopciones);
router.get('/pendientes', adopcionController.obtenerAdopcionesPendientes);
router.get('/aceptadas', adopcionController.obtenerAdopcionesAceptadas);
router.post('/', verificarJWT, adopcionController.registrarAdopcion);
router.delete('/:id', adopcionController.eliminarAdopcion);
router.get('/:id', adopcionController.obtenerAdopcionPorId);
router.get('/por-publicador/:publicadorId', adopcionController.obtenerAdopcionesPorPublicador);
router.put('/:id', adopcionController.modificarAdopcion);


module.exports = router;