const bcrypt = require('bcrypt');
const { Acceso, Usuario, Ubicacion, sequelize } = require('../../models');

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
        const { Nombre, Telefono, UbicacionUsuario, Correo, Contrasena, EsAdmin } = req.body;

        const saltRounds = 10;
        const ContrasenaHash = await bcrypt.hash(Contrasena, saltRounds);

        const nuevoAcceso = await Acceso.create({
            Correo,
            ContrasenaHash,
            EsAdmin: EsAdmin ?? false
        }, { transaction: t});

        let ubicacionId = null;

        if (UbicacionUsuario) {
            const nuevaUbicacion = await Ubicacion.create(UbicacionUsuario, { transaction: t });
            ubicacionId = nuevaUbicacion.UbicacionID;
        }

        await Usuario.create({
            Nombre,
            Telefono, 
            UbicacionID: ubicacionId,
            AccesoID: nuevoAcceso.AccesoID
        }, { transaction: t });

        await t.commit();
        res.status(201).json({mensaje: 'Usuario registrado correctamente'});

    } catch(error) {
        await t.rollback();
        console.error('Error al crear al usuario: ', error);
        res.status(500).json({ error: 'Error al guardar al usuario', detalles: error.message });
    }
};