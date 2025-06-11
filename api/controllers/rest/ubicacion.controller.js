const { Ubicacion, Usuario, sequelize } = require('../../models');
const { actualizarUbicacionUsuario, obtenerUbicacionesCercanas } = require("../redis/ubicacionRedis.controller")

exports.actualizarUbicacion = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const tokenId = req.usuario.id;
        const parametroId = parseInt(req.params.id);

        if (tokenId !== parametroId) {
            return res.status(403).json({ mensaje: 'No tienes permiso para modificar esta ubicación' });
        }

        const { Longitud, Latitud, Ciudad, Estado, Pais} = req.body;
        const lon = Number(Longitud);
        const lat = Number(Latitud);

        if (isNaN(lon) || isNaN(lat)) {
            return res.status(400).json({ error: 'Coordenadas inválidas' });
        }

        const usuario = await Usuario.findByPk(tokenId, { transaction: t });
        if (!usuario) {
            await t.rollback();
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const nuevaUbicacion = await Ubicacion.create(
            { Longitud: lon, Latitud: lat, Ciudad, Estado, Pais }, 
            { transaction: t }
        );

        usuario.UbicacionID = nuevaUbicacion.UbicacionID;
        await usuario.save({ transaction: t });
        await t.commit();

        await actualizarUbicacionUsuario(usuario.UsuarioID, lon, lat);

        res.status(200).json({ mensaje: 'Ubicación registrada correctamente' });
    } catch(error) {
        await t.rollback();
        console.error('Error al actualizar la ubicación: ', error);
        res.status(500).json({ error: 'Error al guardar la ubicación', detalles: error.message });
    }
};

exports.obtenerSolicitudesAdopcionCercanas = async (req, res) => {
    try {
        const { Longitud, Latitud } = req.query;

        if (!Longitud || !Latitud) {
            return res.status(400).json({ error: 'Coordenadas requeridas'});
        }

        const resultados = await obtenerUbicacionesCercanas(Longitud, Latitud);
        res.status(200).json(resultados);
    } catch (error) {
        console.error('Error obteniendo ubicaciones cercanas: ', error);
        res.status(500).json({ error: 'Error al buscar ubicaciones cercanas' });
    }
}; 
