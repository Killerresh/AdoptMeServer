const { getDb } = require('../config/db');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Usuario conectado con socket ID: ${socket.id}`);

    // Unirse a una sala personalizada con su ID de usuario
    socket.on('unirse', (usuarioID) => {
      const sala = `usuario_${usuarioID}`;
      socket.join(sala);
      console.log(`🟢 Usuario ${usuarioID} se unió a la sala ${sala}`);
    });

    // Envío de mensaje
    socket.on('enviar_mensaje', async (data) => {
      const db = getDb();

      try {
        // data: { RemitenteID, DestinatarioID, Contenido }
        const nuevoMensaje = await db.Chat.create({
          RemitenteID: data.RemitenteID,
          DestinatarioID: data.DestinatarioID,
          Contenido: data.Contenido
        });

        // Emitir mensaje al destinatario (si está conectado)
        const salaDestinatario = `usuario_${data.DestinatarioID}`;
        io.to(salaDestinatario).emit('nuevo_mensaje', nuevoMensaje);

        // Opcional: también emitir al remitente (para confirmación local)
        const salaRemitente = `usuario_${data.RemitenteID}`;
        io.to(salaRemitente).emit('mensaje_confirmado', nuevoMensaje);

        console.log(`✉️ Mensaje enviado de ${data.RemitenteID} a ${data.DestinatarioID}`);
      } catch (error) {
        console.error('❌ Error al guardar o emitir mensaje:', error);
        socket.emit('error_mensaje', { mensaje: 'Error al enviar el mensaje' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Usuario desconectado: ${socket.id}`);
    });
  });
};
