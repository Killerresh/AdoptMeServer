const { getDb } = require('../../config/db');
const { registrarUbicacionSolicitudAdopcion } = require("../redis/ubicacionRedis.controller");

exports.obtenerSolicitudAdopciones = async (req, res) => {
  const db = getDb();

  try {
    const solicitudAdopciones = await db.SolicitudAdopcion.findAll();
    res.json(solicitudAdopciones);
  } catch (error) {
    console.error('Error al obtener las solicitudes de adopcion: ', error);
    console.error(error.stack);

    res.status(500).json({ error: 'Error al obtener las solicitudes de adopcion' });
  }
};

exports.obtenerSolicitudesPendientes = async (req, res) => {
  const db = getDb();

  try {
    const solicitudesPendientes = await db.SolicitudAdopcion.findAll({
      where: { estado: false }
    });
    res.json(solicitudesPendientes);
  } catch (error) {
    console.error('Error al obtener solicitudes pendientes: ', error);
    res.status(500).json({ error: 'Error al obtener solicitudes pendientes' });
  }
};

exports.obtenerSolicitudesAceptadas = async (req, res) => {
  const db = getDb();

  try {
    const solicitudesAceptadas = await db.SolicitudAdopcion.findAll({
      where: { estado: true }
    });
    res.json(solicitudesAceptadas);
  } catch (error) {
    console.error('Error al obtener solicitudes aceptadas: ', error);
    res.status(500).json({ error: 'Error al obtener solicitudes aceptadas' });
  }
};


exports.registrarSolicitudAdopcion = async (req, res) => {
  const db = getDb();
  const t = await db.sequelize.transaction();

  try {
    const {
      Estado,
      AdoptanteID,
      PublicadorID,
      Ubicacion: UbicacionAdopcion,
      Mascota
    } = req.body;

    const { Nombre, Especie, Raza, Edad, Sexo, Tamaño, Descripcion } = Mascota || {};

    if (!PublicadorID) {
      await t.rollback();
      return res.status(400).json({ error: 'Faltan datos obligatorios en la solicitud.' });
    }

    if (!Nombre || !Especie || !Raza || !Edad || !Sexo || !Tamaño) {
      await t.rollback();
      return res.status(400).json({ error: 'Faltan datos obligatorios de la mascota.' });
    }

    console.log('Creando mascota...');
    const nuevaMascota = await db.Mascota.create({
      Nombre,
      Especie,
      Raza,
      Edad,
      Sexo,
      Tamaño,
      Descripcion
    }, { transaction: t });

    let ubicacionId = null;
    let latitud = null;
    let longitud = null;

    console.log('Creando ubicación...');
    if (UbicacionAdopcion) {
      longitud = parseFloat(UbicacionAdopcion.Longitud);
      latitud = parseFloat(UbicacionAdopcion.Latitud);

      if (isNaN(longitud) || isNaN(latitud)) {
        await t.rollback();
        return res.status(400).json({ error: 'Coordenadas inválidas' });
      }

      const nuevaUbicacion = await db.Ubicacion.create(UbicacionAdopcion, { transaction: t });
      ubicacionId = nuevaUbicacion.UbicacionID;
    }

    console.log('Creando solicitud de adopción...');
    const nuevaSolicitudAdopcion = await db.SolicitudAdopcion.create({
      Estado: Estado ?? false,
      MascotaID: nuevaMascota.MascotaID,
      PublicadorID,
      UbicacionID: ubicacionId
    }, { transaction: t });

    await registrarUbicacionSolicitudAdopcion(nuevaSolicitudAdopcion.SolicitudAdopcionID, 
      longitud, latitud, nuevaSolicitudAdopcion.Estado, PublicadorID);

    console.log('Confirmando transacción...');  
    await t.commit();
    console.log(nuevaMascota.MascotaID);
    res.status(201).json({ 
      mensaje: 'Solicitud de adopción registrada correctamente',
      MascotaID: nuevaMascota.MascotaID
    });

  } catch (error) {
    console.error('Error al crear la solicitud de adopción:', error);
    console.error(error.stack);

    try {
      await t.rollback();
    } catch (rollbackError) {
      console.error('Error al hacer rollback:', rollbackError.message);
    }

    res.status(500).json({ error: 'Error al guardar la solicitud de adopción' });
  }
};


exports.eliminarSolicitudAdopcion = async (req, res) => {
  const db = getDb();
  const t = await db.sequelize.transaction();

  try {
    const { id } = req.params;

    const solicitud = await db.SolicitudAdopcion.findByPk(id, { transaction: t });

    if (!solicitud) {
      await t.rollback();
      return res.status(404).json({ error: 'Solicitud de adopción no encontrada' });
    }

    const mascotaId = solicitud.MascotaID;
    const ubicacionId = solicitud.UbicacionID;

    // Eliminar la solicitud
    await db.SolicitudAdopcion.destroy({
      where: { SolicitudAdopcionID: id },
      transaction: t
    });

    // Eliminar la mascota asociada
    await db.Mascota.destroy({
      where: { MascotaID: mascotaId },
      transaction: t
    });

    // Eliminar la ubicación asociada
    await db.Ubicacion.destroy({
      where: { UbicacionID: ubicacionId },
      transaction: t
    });

    await t.commit();
    res.status(200).json({ mensaje: 'Solicitud de adopción, ubicación y mascota asociada eliminadas correctamente' });

  } catch (error) {
    if (t) await t.rollback();

    console.error('Error al eliminar la solicitud de adopción: ', error);
    console.error(error.stack);

    res.status(500).json({ error: 'Error al eliminar la solicitud de adopción' });
  }
};

exports.obtenerSolicitudAdopcionPorId = async (req, res) => {
  const db = getDb();
  const { id } = req.params;

  try {
    const solicitudAdopcion = await db.SolicitudAdopcion.findByPk(id);

    if (!solicitudAdopcion) {
      return res.status(404).json({ mensaje: 'Solicitud de adopción no encontrada' });
    }

    res.status(200).json(solicitudAdopcion);
  } catch (error) {
    console.error('Error al obtener la solicitud de adopcion: ', error);
    console.error(error.stack);

    res.status(500).json({ error: 'Error al obtener la solicitud de adopción' });
  }
};

exports.obtenerSolicitudesPorPublicador = async (req, res) => {
  const db = getDb();
  const { publicadorId } = req.params;

  try {
    const solicitudes = await db.SolicitudAdopcion.findAll({
      where: { PublicadorID: publicadorId },
      include: [
        {
          model: db.Mascota,
          as: 'Mascota',
          include: [
            {
              model: db.FotoMascota,
              as: 'fotos',
              limit: 1 
            }
          ]
        }
      ]
    });

    res.status(200).json(solicitudes);
  } catch (error) {
    console.error('Error al obtener solicitudes del publicador:', error);
    res.status(500).json({ error: 'Error al obtener las solicitudes' });
  }
};

