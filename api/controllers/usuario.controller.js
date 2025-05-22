const Usuario = require('../models/Usuario');

exports.obtenerUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll();
        res.json(usuarios);
    } catch(error) {
        console.error('Error al obtener los usuarios: ', error);
        res.status(500).json({ error: 'Error al obtener los usuarios', detalles: error.message });
    }
};

exports.crearUsuario = async (req, res) => {
    try {
        const usuario = await Usuario.create(req.body);
        res.json(usuario);
    } catch(error) {
        console.error('Error al crear al usuario: ', error);
        res.status(500).json({ error: 'Error al guardar al usuario', detalles: error.message });
    }
};