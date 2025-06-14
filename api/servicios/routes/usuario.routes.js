const express = require('express');
const router = express.Router();
const usuarioController = require('../../controllers/rest/usuario.controller');
const autenticarTokenConRoles = require('../../middlewares/authMiddleware');

router.get('/', autenticarTokenConRoles(['Admin']), usuarioController.obtenerUsuarios);
router.post('/', usuarioController.registrarUsuario);
router.get('/foto-perfil', usuarioController.obtenerFotoUsuario);

module.exports = router;