const express = require('express');
const router = express.Router();
const usuarioController = require('../../controllers/rest/usuario.controller');
const autenticarTokenConRoles = require('../../middlewares/authMiddleware');
const verificarJWT = require('../../middlewares/verificarJWT')

router.get('/', autenticarTokenConRoles(['Admin']), usuarioController.obtenerUsuarios);
router.post('/', usuarioController.registrarUsuario);
router.get('/foto-perfil', usuarioController.obtenerFotoUsuario);
router.put('/', usuarioController.actualizarPerfil);

module.exports = router;