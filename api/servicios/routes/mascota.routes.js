const express = require('express');
const router = express.Router();
const mascotaController = require('../../controllers/rest/mascota.controller');

router.get('/', mascotaController.obtenerMascotas);
router.put('/:id', mascotaController.modificarMascota);


module.exports = router;