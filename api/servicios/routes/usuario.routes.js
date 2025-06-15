const express = require('express');
const router = express.Router();
const usuarioController = require('../../controllers/rest/usuario.controller');
const autenticarTokenConRoles = require('../../middlewares/authMiddleware');
const verificarJWT = require('../../middlewares/verificarJWT');
const verificarConexionBD = require('../../middlewares/verificarConexionBD');

router.post('/', usuarioController.registrarUsuario);
router.get('/foto-perfil', verificarJWT, usuarioController.obtenerFotoUsuario);
router.put('/', verificarJWT, verificarConexionBD, usuarioController.actualizarPerfil);

module.exports = router;