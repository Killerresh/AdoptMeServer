const { getDb } = require('../../config/db');

// Obtener la lista de usuarios con los que el usuario en sesión ha tenido chats
exports.obtenerChatsPorUsuario = async (req, res) => {
  const db = getDb();
  const usuarioID = parseInt(req.params.id, 10);

  try {
    if (isNaN(usuarioID)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    const mensajes = await db.Chat.findAll({
      where: {
        [db.Sequelize.Op.or]: [
          { RemitenteID: usuarioID },
          { DestinatarioID: usuarioID }
        ]
      },
      order: [['FechaEnvio', 'DESC']],
      include: [
        { model: db.Usuario, as: 'Remitente', attributes: ['UsuarioID', 'Nombre'] },
        { model: db.Usuario, as: 'Destinatario', attributes: ['UsuarioID', 'Nombre'] }
      ]
    });

    // Agrupar por ID del otro usuario para mostrar lista de conversaciones
    const conversaciones = [];
    const idsVistos = new Set();

    for (const msg of mensajes) {
      const otroID = msg.RemitenteID === usuarioID ? msg.DestinatarioID : msg.RemitenteID;

      if (!idsVistos.has(otroID)) {
        idsVistos.add(otroID);
        conversaciones.push({
          UsuarioID: otroID,
          Nombre: msg.RemitenteID === usuarioID ? msg.Destinatario.Nombre : msg.Remitente.Nombre,
          UltimoMensaje: msg.Contenido,
          Fecha: msg.FechaEnvio
        });
      }
    }

    res.json(conversaciones);
  } catch (error) {
    console.error('Error al obtener la lista de chats:', error);
    res.status(500).json({ error: 'Error al obtener los chats del usuario' });
  }
};

// Obtener mensajes entre dos usuarios
exports.obtenerMensajesEntreUsuarios = async (req, res) => {
  const db = getDb();
  const usuarioA = parseInt(req.params.usuarioA, 10);
  const usuarioB = parseInt(req.params.usuarioB, 10);

  try {
    if (isNaN(usuarioA) || isNaN(usuarioB)) {
      return res.status(400).json({ error: 'IDs de usuario inválidos' });
    }

    const mensajes = await db.Chat.findAll({
      where: {
        [db.Sequelize.Op.or]: [
          { RemitenteID: usuarioA, DestinatarioID: usuarioB },
          { RemitenteID: usuarioB, DestinatarioID: usuarioA }
        ]
      },
      order: [['FechaEnvio', 'ASC']],
      include: [
        { model: db.Usuario, as: 'Remitente', attributes: ['UsuarioID', 'Nombre'] },
        { model: db.Usuario, as: 'Destinatario', attributes: ['UsuarioID', 'Nombre'] }
      ]
    });

    res.json(mensajes);
  } catch (error) {
    console.error('Error al obtener mensajes entre usuarios:', error);
    res.status(500).json({ error: 'Error al obtener los mensajes' });
  }
};

// Enviar un nuevo mensaje
exports.enviarMensaje = async (req, res) => {
  const db = getDb();
  const { RemitenteID, DestinatarioID, Contenido } = req.body;

  try {
    if (!RemitenteID || !DestinatarioID || !Contenido) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    const nuevoMensaje = await db.Chat.create({
      RemitenteID,
      DestinatarioID,
      Contenido
    });

    res.status(201).json({ mensaje: 'Mensaje enviado correctamente', mensajeEnviado: nuevoMensaje });
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    res.status(500).json({ error: 'Error al enviar el mensaje' });
  }
};
