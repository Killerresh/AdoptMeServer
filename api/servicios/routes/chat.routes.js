const express = require('express');
const router = express.Router();
const chatController = require('../../controllers/rest/chat.controller');

// Obtener la lista de chats (últimos mensajes) del usuario autenticado
router.get('/usuario/:id', chatController.obtenerChatsPorUsuario);

// Obtener historial de mensajes entre dos usuarios
router.get('/entre/:usuarioA/:usuarioB', chatController.obtenerMensajesEntreUsuarios);

// Enviar un nuevo mensaje
router.post('/', chatController.enviarMensaje);

module.exports = router;
