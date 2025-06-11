const jwt = require('jsonwebtoken');
const db = require('../../models');
const SECRET = process.env.JWT_SECRET;


exports.iniciarSesion = async (req, res) => {
    try {
        const { Correo, ContrasenaHash } = req.body;

        const acceso = await db.Acceso.findOne({ 
            where: { Correo },
            include: {
                model: db.Usuario,
                as: 'Usuario',
                include: [{
                    model: db.Ubicacion,
                    as: 'Ubicacion'
                }]
            }
        });

        if (!acceso) {
            return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos' });
        }

        if (ContrasenaHash !== acceso.ContrasenaHash) {
            return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos' });
        }

        const payload = {
            id: acceso.AccesoID, 
            correo: acceso.Correo,
            rol: acceso.EsAdmin ? 'Admin' : 'Usuario'
        };

        const token = jwt.sign(payload, SECRET, { expiresIn: '1h' });

        res.status(200).json({ 
            token,
            usuario: acceso.Usuario,
            esAdmin: acceso.EsAdmin
        });

    } catch(error) {
        console.error('Error al iniciar sesión: ', error);
        res.status(500).json({ error: 'Error al iniciar sesión', detalles: error.message });
    }
};