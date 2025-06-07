const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Acceso } = require('../../models');
const SECRET = process.env.JWT_SECRET;


exports.iniciarSesion = async (req, res) => {
    try {
        const { Correo, ContrasenaHash } = req.body;

        const acceso = await Acceso.findOne({ where: { Correo }});
        if (!acceso) {
            return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos' });
        }

        const esValida = await bcrypt.compare(ContrasenaHash, acceso.ContrasenaHash);
        if (!esValida) {
            return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos' });
        }

        const payload = {
            id: acceso.AccesoID, 
            correo: acceso.Correo,
            rol: acceso.EsAdmin ? 'Admin' : 'Usuario'
        };

        const token = jwt.sign(payload, SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch(error) {
        console.error('Error al iniciar sesión: ', error);
        res.status(500).json({ error: 'Error al iniciar sesión', detalles: error.message });
    }
};