const fs = require('fs');
const path = require('path');
const { getDb } = require('../../config/db');
const { actualizarUbicacionUsuario } = require('../redis/ubicacionRedis.controller');
const verificarJWT = require('../../middlewares/verificarJWT');

exports.obtenerUsuarios = async (req, res) => {
  try {
    const db = getDb();
    const usuarios = await db.Usuario.findAll();
    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener los usuarios: ', error.message);
    console.error(error.stack);

    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
};

exports.registrarUsuario = async (req, res) => {
  try {
    const db = getDb();
    const t = await db.sequelize.transaction();

    const { Nombre, Telefono, Ubicacion: UbicacionUsuario, Acceso: AccesoUsuario } = req.body;
    const { Correo, ContrasenaHash, EsAdmin } = AccesoUsuario;

    const correoExistente = await db.Acceso.findOne({ where: { Correo } });
    if (correoExistente) {
      await t.rollback();
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    const nuevoAcceso = await db.Acceso.create({
      Correo,
      ContrasenaHash,
      EsAdmin: EsAdmin ?? false
    }, { transaction: t });

    let ubicacionId = null;

    if (UbicacionUsuario) {
      const longitud = Number(UbicacionUsuario.Longitud);
      const latitud = Number(UbicacionUsuario.Latitud);

      if (isNaN(longitud) || isNaN(latitud)) {
        await t.rollback();
        return res.status(400).json({ error: 'Coordenadas inválidas' });
      }

      const nuevaUbicacion = await db.Ubicacion.create(UbicacionUsuario, { transaction: t });
      ubicacionId = nuevaUbicacion.UbicacionID;
    }

    const nuevoUsuario = await db.Usuario.create({
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
    res.status(201).json({ mensaje: 'Usuario registrado correctamente' });

  } catch (error) {
    if (t) await t.rollback();

    console.error('Error al crear al usuario: ', error.message);
    console.error(error.stack);

    res.status(500).json({ error: 'Error al guardar al usuario' });
  }
};

exports.obtenerFotoUsuario = async (req, res) => {
  try {
    console.log("Obteniendo foto");
    const token = req.headers['authorization'];
    const usuario = verificarJWT(token);

    if (!usuario) {
      return res.status(401).json({ error: 'Token inválido o no enviado' });
    }

    const db = getDb();

    const foto = await db.FotoUsuario.findOne({
      where: { UsuarioID: usuario.UsuarioID }
    });

    if (!foto) {
      console.warn(`No se encontró una foto registrada para el UsuarioID: ${usuario.UsuarioID}`);
      return res.status(404).json({ error: 'No se encontró foto para el usuario' });
    }

    const rutaAbsoluta = path.join(__dirname, '../../', foto.UrlFoto);

    if (!fs.existsSync(rutaAbsoluta)) {
      console.warn('Archivo no existe físicamente en el servidor');
      return res.status(404).json({ error: 'Archivo de foto no encontrado' });
    }

    res.sendFile(rutaAbsoluta);
    console.log("Foto enviada");
  } catch (error) {
    console.error('Error al obtener la foto del usuario:', error.message);
    console.error(error.stack);

    res.status(500).json({ error: 'Error al obtener la foto del usuario' });
  }
};