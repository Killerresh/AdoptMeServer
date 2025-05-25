const { Ubicacion } = require('../../models');

exports.registrarUbicacion = async (req, res) => {
    try {
        const ubicacion = await Ubicacion.create(req.body);
        res.json(ubicacion);
    } catch(error) {
        console.error('Error al crear la ubicación: ', error);
        res.status(500).json({ error: 'Error al guardar la ubicación', detalles: error.message });
    }
};