const { Mascota, SolicitudAdopcion, sequelize } = require('../../models');

exports.obtenerSolicitudAdopciones = async (req, res) => {
    try {
        const solicitudAdopciones = await SolicitudAdopcion.findAll();
        res.json(solicitudAdopciones);
    } catch(error) {
        console.error('Error al obtener las solicitudes de adopcion: ', error);
        res.status(500).json({ error: 'Error al obtener las solicitudes de adopcion', detalles: error.message });
    }
};

exports.registrarSolicitudAdopcion = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const {
            Estado, AdoptanteID,
            Nombre, Especie, Raza, Edad, Sexo, Tamaño, Descripcion, PublicadorID, UbicacionID
        } = req.body;

        // Validar datos requeridos
        if (!AdoptanteID || !PublicadorID || !UbicacionID) {
            return res.status(400).json({ error: 'Faltan datos obligatorios en la solicitud.' });
        }

        console.log('Creando mascota...');
        const nuevaMascota = await Mascota.create({
            Nombre,
            Especie,
            Raza,
            Edad,
            Sexo,
            Tamaño,
            Descripcion,
            PublicadorID,
            UbicacionID,
        }, { transaction: t });

        console.log('Creando solicitud de adopción...');
        const nuevaSolicitudAdopcion = await SolicitudAdopcion.create({
            Estado: Estado ?? false,
            MascotaID: nuevaMascota.MascotaID,
            AdoptanteID
        }, { transaction: t });

        console.log('Confirmando transacción...');
        await t.commit();

        res.status(201).json({ mensaje: 'Solicitud de adopción registrada correctamente' });

    } catch (error) {
        console.error('Error al crear la solicitud de adopción:', error);

        try {
            await t.rollback();
        } catch (rollbackError) {
            console.error('Error al hacer rollback:', rollbackError.message);
        }

        res.status(500).json({
            error: 'Error al guardar la solicitud de adopción',
            detalles: error.message
        });
    }
};


exports.eliminarSolicitudAdopcion = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { id } = req.params; 

        const solicitud = await SolicitudAdopcion.findByPk(id, { transaction: t });

        if (!solicitud) {
            await t.rollback();
            return res.status(404).json({ error: 'Solicitud de adopción no encontrada' });
        }

        const mascotaId = solicitud.MascotaID;

        // Eliminar la solicitud
        await SolicitudAdopcion.destroy({
            where: { SolicitudAdopcionID: id },
            transaction: t
        });

        // Eliminar la mascota asociada
        await Mascota.destroy({
            where: { MascotaID: mascotaId },
            transaction: t
        });

        await t.commit();
        res.status(200).json({ mensaje: 'Solicitud de adopción y mascota asociada eliminadas correctamente' });

    } catch (error) {
        await t.rollback();
        console.error('Error al eliminar la solicitud de adopción: ', error);
        res.status(500).json({ error: 'Error al eliminar la solicitud de adopción', detalles: error.message });
    }
};

