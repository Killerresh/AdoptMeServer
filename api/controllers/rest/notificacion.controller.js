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

exports.eliminarNotificacionUsuario = async (req, res) => {
    const db = getDb();

    try {
        const usuarioID = req.usuario.UsuarioID;
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ mensaje: 'Falta el ID de la notificación' });
        }

        const notificacion = await db.Notificacion.findOne({
            where: {
                NotificacionID: id,
                UsuarioID: usuarioID
            }
        });

        if (!notificacion) {
            return res.status(404).json({ mensaje: 'Notificación no encontrada o no pertenece al usuario' });
        }

        await notificacion.destroy();

        res.status(200).json({ mensaje: 'Notificación eliminada correctamente' });

    } catch (error) {
        console.error('Error al eliminar notificación:', error.message);
        res.status(500).json({ error: 'Error al eliminar notificación' });
    }
};

exports.eliminarNotificacionesUsuario = async (req, res) => {
  const db = getDb();
  const usuarioID = req.usuario.UsuarioID;

  try {
    const cantidadEliminadas = await db.Notificacion.destroy({
      where: {
        UsuarioID: usuarioID
      }
    });

    res.status(200).json({
      mensaje: `Se eliminaron ${cantidadEliminadas} notificaciones`
    });
  } catch (error) {
    console.error('Error al eliminar todas las notificaciones:', error.message);
    res.status(500).json({ error: 'Error al eliminar notificaciones' });
  }
};
