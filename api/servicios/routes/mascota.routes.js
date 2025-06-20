const express = require('express');
const router = express.Router();
const mascotaController = require('../../controllers/rest/mascota.controller');
const verificarJWT = require('../../middlewares/verificarJWT');

router.get('/', mascotaController.obtenerMascotas);
router.put('/:id', mascotaController.modificarMascota);
router.get('/:id/foto', verificarJWT, mascotaController.obtenerFotoMascota);
router.get('/:id/video', verificarJWT, mascotaController.obtenerVideoMascota);
router.get('/:id', mascotaController.obtenerMascotaPorId);

module.exports = router;