const express = require('express');
const router = express.Router();
const usuarioController = require('../../controllers/rest/usuario.controller');
const ubicacionController = require('../../controllers/rest/ubicacion.controller');
const autenticarTokenConRoles = require('../../middlewares/authMiddleware');

router.get('/', autenticarTokenConRoles(['Admin']), usuarioController.obtenerUsuarios);
router.post('/', usuarioController.registrarUsuario);
router.put('/:id/ubicacion', autenticarTokenConRoles(), ubicacionController.actualizarUbicacion);

module.exports = router;