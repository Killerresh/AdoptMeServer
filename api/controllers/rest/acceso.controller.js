const jwt = require('jsonwebtoken');
const { getDb } = require('../../config/db');
const db = getDb();
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
            AccesoID: acceso.AccesoID, 
            UsuarioID: acceso.Usuario?.UsuarioID,
            correo: acceso.Correo,
            rol: acceso.EsAdmin ? 'Admin' : 'Usuario'
        };

        const token = jwt.sign(payload, SECRET, { expiresIn: '1h' });

        const usuarioConAcceso = {
            ...acceso.Usuario?.toJSON(),
            Acceso: {
                Correo: acceso.Correo,
                EsAdmin: acceso.EsAdmin
            }
        };

        res.status(200).json({ 
            token,
            usuario: usuarioConAcceso,
            esAdmin: acceso.EsAdmin
        });

    } catch(error) {
        console.error('Error al iniciar sesión: ', error.message);
        console.error(error.stack);

        res.status(500).json({ error: 'Error al iniciar sesión'});
    }
};

exports.actualizarAcceso = async (req, res) => {
  const db = getDb();
  const t = await db.sequelize.transaction();

  try {
    const usuarioId = req.usuario.UsuarioID;
    const usuario = await db.Usuario.findByPk(usuarioId, {
      include: db.Acceso,
      transaction: t
    });

    if (!usuario || !usuario.Acceso) {
      await t.rollback();
      return res.status(404).json({ error: 'Acceso no encontrado' });
    }

    const { Correo, ContrasenaHash } = req.body;

    if (Correo) {
      const existeCorreo = await db.Acceso.findOne({
        where: { Correo },
        transaction: t
      });

      if (existeCorreo && existeCorreo.AccesoID !== usuario.AccesoID) {
        await t.rollback();
        return res.status(409).json({ error: 'Ese correo ya está en uso' });
      }

      usuario.Acceso.Correo = Correo;
    }

    if (ContrasenaHash) usuario.Acceso.ContrasenaHash = ContrasenaHash;

    await usuario.Acceso.save({ transaction: t });
    await t.commit();

    res.status(200).json({ mensaje: 'Datos de acceso actualizados correctamente' });
  } catch (error) {
    await t.rollback();

    console.error('Error al actualizar acceso:', error.message);
    console.error(error.stack);

    res.status(500).json({ error: 'Error al actualizar el acceso' });
  }
};