const { Ubicacion, Usuario, sequelize } = require('../../models');

exports.actualizarUbicacion = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const tokenId = req.usuario.id;
        const parametroId = parseInt(req.params.id);

        if (tokenId !== parametroId) {
            return res.status(403).json({ mensaje: 'No tienes permiso para modificar esta ubicación' });
        }

        const datosUbicacion = req.body;

        const usuario = await Usuario.findByPk(tokenId, { transaction: t });
        if (!usuario) {
            await t.rollback();
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const nuevaUbicacion = await Ubicacion.create(datosUbicacion, { transaction: t });

        usuario.UbicacionID = nuevaUbicacion.UbicacionID;
        await usuario.save({ transaction: t });

        await t.commit();
        res.status(200).json({ mensaje: 'Ubicación registrada correctamente' });
    } catch(error) {
        await t.rollback();
        console.error('Error al actualizar la ubicación: ', error);
        res.status(500).json({ error: 'Error al guardar la ubicación', detalles: error.message });
    }
};