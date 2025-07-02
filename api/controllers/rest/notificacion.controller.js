const { getDb } = require('../../config/db');

exports.obtenerNotificaciones = async (req, res) => {
  const db = getDb();

  try {
    const usuarioID = req.usuario.UsuarioID;

    const notificaciones = await db.Notificacion.findAll({
      where: { UsuarioID: usuarioID },
      order: [['FechaCreacion', 'DESC']]
    });

    res.status(200).json(notificaciones);
  } catch (error) {
    console.error('Error al obtener notificaciones:', error.message);
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
};
