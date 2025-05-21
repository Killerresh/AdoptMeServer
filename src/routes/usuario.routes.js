const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/Usuario.controller');

router.get('/', usuarioController.obtenerUsuarios);
router.post('/', usuarioController.crearUsuario);

module.exports = router;