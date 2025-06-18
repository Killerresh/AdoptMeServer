const { getDb } = require('../../config/db');
const { actualizarUbicacionUsuario, eliminarUbicacionUsuario } = require("../redis/ubicacionRedis.controller");

exports.actualizarUbicacion = async (req, res) => {
  const db = getDb();
  const t = await db.sequelize.transaction();
  let transaccionCompletada = false;

  try {
    const tokenId = req.usuario.UsuarioID;

    const { Longitud, Latitud, Ciudad, Estado, Pais } = req.body;
    const latitud = Number(Latitud);
    const longitud = Number(Longitud);

    const esCoordenadaValida = (
      !isNaN(latitud) &&
      !isNaN(longitud) &&
      latitud >= -90 && latitud <= 90 &&
      longitud >= -180 && longitud <= 180
    );

    if (!esCoordenadaValida) {
      await t.rollback();
      return res.status(400).json({ error: 'Coordenadas inválidas' });
    }

    const usuario = await db.Usuario.findByPk(tokenId, { transaction: t });
    if (!usuario) {
      await t.rollback();
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (usuario.UbicacionID) {
      await db.Ubicacion.destroy({
        where: { UbicacionID: usuario.UbicacionID },
        transaction: t
      });

      await eliminarUbicacionUsuario(usuario.UsuarioID);
    }

    const nuevaUbicacion = await db.Ubicacion.create(
      { Longitud: longitud, Latitud: latitud, Ciudad, Estado, Pais },
      { transaction: t }
    );

    usuario.UbicacionID = nuevaUbicacion.UbicacionID;
    await usuario.save({ transaction: t });

    await t.commit();
    transaccionCompletada = true;

    await actualizarUbicacionUsuario(usuario.UsuarioID, longitud, latitud);

    res.status(200).json({ mensaje: 'Ubicación registrada correctamente' });
  } catch (error) {
    if (!transaccionCompletada) {
      try {
        await t.rollback();
      } catch (rollbackError) {
        console.error('Error al hacer rollback:', rollbackError);
      }
    }

    console.error('Error al actualizar la ubicación: ', error);
    console.error(error.stack);

    res.status(500).json({ error: 'Error al guardar la ubicación' });
  }
};