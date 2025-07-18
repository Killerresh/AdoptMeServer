const { getDb } = require('../../config/db');

exports.obtenerSolicitudesConNombresPorAdopcionID = async (req, res) => {
  const db = getDb();
  const { adopcionID } = req.params;

  try {
    if (!adopcionID || isNaN(adopcionID)) {
      return res.status(400).json({ error: 'El AdopcionID proporcionado no es válido' });
    }

    const solicitudes = await db.Solicitud.findAll({
      where: { AdopcionID: adopcionID },
      attributes: ['SolicitudID', 'AdopcionID', 'AdoptanteID'], // <- importante
      include: {
        model: db.Usuario,
        as: 'Adoptante',
        attributes: ['Nombre']
      }
    });

    if (!solicitudes || solicitudes.length === 0) {
      return res.status(404).json({ error: 'No hay solicitudes para esta adopción' });
    }

    const resultado = solicitudes.map(s => ({
      SolicitudID: s.SolicitudID,
      AdopcionID: s.AdopcionID,
      NombreAdoptante: s.Adoptante?.Nombre || 'Desconocido',
      AdoptanteID: s.AdoptanteID
    }));

    return res.status(200).json(resultado);
  } catch (error) {
    console.error('Error al obtener solicitudes con nombres:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};


exports.eliminarSolicitud = async (req, res) => {
  const db = getDb(); 
  const { id } = req.params;

  try {
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'ID de solicitud inválido' });
    }

    const solicitud = await db.Solicitud.findByPk(id);

    if (!solicitud) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    await solicitud.destroy();

    return res.status(200).json({ mensaje: 'Solicitud eliminada exitosamente' });

  } catch (error) {
    console.error('Error al eliminar la solicitud:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.registrarSolicitud = async (req, res) => {
  const db = getDb();
  const usuario = req.usuario;
  const { AdopcionID } = req.body;

  try {
    if (!usuario) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    if (!AdopcionID || isNaN(AdopcionID)) {
      return res.status(400).json({ error: 'ID de adopción inválido' });
    }

    const adopcion = await db.Adopcion.findByPk(AdopcionID);
    if (!adopcion) {
      return res.status(404).json({ error: 'Adopción no encontrada' });
    }

    if (adopcion.PublicadorID === usuario.UsuarioID) {
      return res.status(400).json({ error: 'No puedes solicitar tu propia adopción' });
    }

    const yaSolicitada = await db.Solicitud.findOne({
      where: {
        AdoptanteID: usuario.UsuarioID,
        AdopcionID: AdopcionID
      }
    });

    if (yaSolicitada) {
      return res.status(409).json({ error: 'Ya has enviado una solicitud para esta adopción' });
    }

    const nuevaSolicitud = await db.Solicitud.create({
      AdoptanteID: usuario.UsuarioID,
      AdopcionID: AdopcionID
    });

    return res.status(201).json({ mensaje: 'Solicitud registrada con éxito', solicitud: nuevaSolicitud });
  } catch (error) {
    console.error('Error al registrar solicitud:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
