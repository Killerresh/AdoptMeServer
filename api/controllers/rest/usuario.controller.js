const fs = require('fs');
const path = require('path');
const { getDb } = require('../../config/db');
const { actualizarUbicacionUsuario } = require('../redis/ubicacionRedis.controller');
const verificarJWT = require('../../middlewares/verificarJWT');

exports.registrarUsuario = async (req, res) => {
  const db = getDb();
  const t = await db.sequelize.transaction();

  try {
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

      const esCoordenadaValida = (
        !isNaN(latitud) &&
        !isNaN(longitud) &&
        latitud >= -90 && latitud <= 90 &&
        longitud >= -180 && longitud <= 180
      );

      if (!esCoordenadaValida) {
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
    const usuario = req.usuario;

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

exports.actualizarPerfil = async (req, res) => {
  const db = getDb();
  const t = await db.sequelize.transaction();

  try {
    const usuarioId = req.usuario.UsuarioID;
    const { Nombre, Telefono } = req.body;

    const usuario = await db.Usuario.findByPk(usuarioId, { transaction: t });
    if (!usuario) {
      await t.rollback();
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (Nombre) usuario.Nombre = Nombre;
    if (Telefono) usuario.Telefono = Telefono;

    await usuario.save({ transaction: t });
    await t.commit();

    res.status(200).json({ mensaje: 'Perfil actualizado correctamente' });
  } catch (error) {
    await t.rollback();

    console.error('Error al actualizar perfil:', error.message);
    console.error(error.stack);

    res.status(500).json({ error: 'Error al actualizar el perfil' });
  }
};