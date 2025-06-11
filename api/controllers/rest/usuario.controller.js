const { Acceso, Usuario, Ubicacion, sequelize } = require('../../models');
const { actualizarUbicacionUsuario} = require('../redis/ubicacionRedis.controller')

exports.obtenerUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll();
        res.json(usuarios);
    } catch(error) {
        console.error('Error al obtener los usuarios: ', error);
        res.status(500).json({ error: 'Error al obtener los usuarios', detalles: error.message });
    }
};

exports.registrarUsuario = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { Nombre, Telefono, Ubicacion: UbicacionUsuario, Acceso: AccesoUsuario } = req.body;
        const { Correo, ContrasenaHash, EsAdmin } = AccesoUsuario;

        const correoExistente = await Acceso.findOne({ where: { Correo } });
        if (correoExistente) {
            await t.rollback();
            return res.status(409).json({ error: 'El correo ya está registrado' });
        }

        const nuevoAcceso = await Acceso.create({
            Correo,
            ContrasenaHash,
            EsAdmin: EsAdmin ?? false
        }, { transaction: t});

        let ubicacionId = null;
        let longitud = null;
        let latitud = null;

        if (UbicacionUsuario) {
            longitud = Number(UbicacionUsuario.Longitud);
            latitud = Number(UbicacionUsuario.Latitud);

            if (isNaN(longitud) || isNaN(latitud)) {
                await t.rollback();
                return res.status(400).json({ error: 'Coordenadas inválidas' });
            }

            const nuevaUbicacion = await Ubicacion.create(UbicacionUsuario, { transaction: t });
            ubicacionId = nuevaUbicacion.UbicacionID;
        }

        const nuevoUsuario = await Usuario.create({
            Nombre,
            Telefono, 
            UbicacionID: ubicacionId,
            AccesoID: nuevoAcceso.AccesoID
        }, { transaction: t });

        if (UbicacionUsuario) {
            await actualizarUbicacionUsuario(
                nuevoUsuario.UsuarioID, 
                UbicacionUsuario.Longitud, 
                UbicacionUsuario.Latitud
            );
        }

        await t.commit();
        res.status(201).json({mensaje: 'Usuario registrado correctamente'});

    } catch(error) {
        await t.rollback();
        console.error('Error al crear al usuario: ', error);
        res.status(500).json({ error: 'Error al guardar al usuario', detalles: error.message });
    }
};