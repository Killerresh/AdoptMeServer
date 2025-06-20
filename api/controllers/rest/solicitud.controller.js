const { getDb } = require('../../config/db');

exports.obtenerSolicitudesConNombresPorAdopcionID = async (req, res) => {
  const db = getDb();
  const { adopcionID } = req.params;

  try {
    if (!adopcionID || isNaN(adopcionID)) {
      return res.status(400).json({ error: 'El AdopcionID proporcionado no es válido' });
    }

    const solicitudes = await db.Solicitud.findAll({
      where: {
        AdopcionID: adopcionID
      },
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
      NombreAdoptante: s.Adoptante?.Nombre || 'Desconocido'
    }));

    return res.status(200).json(resultado);

  } catch (error) {
    console.error('Error al obtener solicitudes con nombres:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

