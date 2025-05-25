const express = require('express');
const router = express.Router();
const usuarioController = require('../../controllers/rest/usuario.controller');

router.get('/', usuarioController.obtenerUsuarios);
router.post('/', usuarioController.registrarUsuario);

module.exports = router;