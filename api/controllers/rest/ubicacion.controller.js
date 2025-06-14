const { getDb } = require('../../config/db');
const { actualizarUbicacionUsuario } = require("../redis/ubicacionRedis.controller");

exports.actualizarUbicacion = async (req, res) => {
  const db = getDb();
  const t = await db.sequelize.transaction();

  try {
    const tokenId = req.usuario.id;
    const parametroId = parseInt(req.params.id);

    if (tokenId !== parametroId) {
      await t.rollback();
      return res.status(403).json({ mensaje: 'No tienes permiso para modificar esta ubicación' });
    }

    const { Longitud, Latitud, Ciudad, Estado, Pais } = req.body;
    const lon = Number(Longitud);
    const lat = Number(Latitud);

    if (isNaN(lon) || isNaN(lat)) {
      await t.rollback();
      return res.status(400).json({ error: 'Coordenadas inválidas' });
    }

    const usuario = await db.Usuario.findByPk(tokenId, { transaction: t });
    if (!usuario) {
      await t.rollback();
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const nuevaUbicacion = await db.Ubicacion.create(
      { Longitud: lon, Latitud: lat, Ciudad, Estado, Pais },
      { transaction: t }
    );

    usuario.UbicacionID = nuevaUbicacion.UbicacionID;
    await usuario.save({ transaction: t });

    await t.commit();

    await actualizarUbicacionUsuario(usuario.UsuarioID, lon, lat);

    res.status(200).json({ mensaje: 'Ubicación registrada correctamente' });
  } catch (error) {
    if (t) await t.rollback();

    console.error('Error al actualizar la ubicación: ', error.message);
    console.error(error.stack);

    res.status(500).json({ error: 'Error al guardar la ubicación' });
  }
};