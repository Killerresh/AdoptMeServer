const { getDb } = require('../../config/db');
const { registrarUbicacionAdopcion } = require("../redis/ubicacionRedis.controller");

exports.obtenerAdopciones = async (req, res) => {
  const db = getDb();

  try {
    const adopciones = await db.Adopcion.findAll();
    res.json(adopciones);
  } catch (error) {
    console.error('Error al obtener las adopciones: ', error);
    console.error(error.stack);

    res.status(500).json({ error: 'Error al obtener las adopciones' });
  }
};

exports.obtenerAdopcionesPendientes = async (req, res) => {
  const db = getDb();

  try {
    const adopcionesPendientes = await db.Adopcion.findAll({
      where: { estado: false }
    });
    res.json(adopcionesPendientes);
  } catch (error) {
    console.error('Error al obtener las adopciones pendientes: ', error);
    res.status(500).json({ error: 'Error al obtener las adopciones pendientes' });
  }
};

exports.obtenerAdopcionesAceptadas = async (req, res) => {
  const db = getDb();

  try {
    const adopcionesAceptadas = await db.Adopcion.findAll({
      where: { estado: true }
    });
    res.json(adopcionesAceptadas);
  } catch (error) {
    console.error('Error al obtener las adopciones aceptadas: ', error);
    res.status(500).json({ error: 'Error al obtener las adopciones aceptadas' });
  }
};


exports.registrarAdopcion = async (req, res) => {
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
      return res.status(400).json({ error: 'Faltan datos obligatorios en la adopcion.' });
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

    console.log('Creando adopción...');
    const nuevaAdopcion = await db.Adopcion.create({
      Estado: Estado ?? false,
      MascotaID: nuevaMascota.MascotaID,
      PublicadorID,
      UbicacionID: ubicacionId
    }, { transaction: t });

    await registrarUbicacionAdopcion(nuevaAdopcion.AdopcionID, 
      longitud, latitud, nuevaAdopcion.Estado, PublicadorID);

    console.log('Confirmando transacción...');  
    await t.commit();
    console.log(nuevaMascota.MascotaID);
    res.status(201).json({ 
      mensaje: 'Adopción registrada correctamente',
      MascotaID: nuevaMascota.MascotaID
    });

  } catch (error) {
    console.error('Error al crear la adopción:', error);
    console.error(error.stack);

    try {
      await t.rollback();
    } catch (rollbackError) {
      console.error('Error al hacer rollback:', rollbackError.message);
    }

    res.status(500).json({ error: 'Error al guardar la adopción' });
  }
};


exports.eliminarAdopcion = async (req, res) => {
  const db = getDb();
  const t = await db.sequelize.transaction();

  try {
    const { id } = req.params;

    const adopcion = await db.Adopcion.findByPk(id, { transaction: t });

    if (!adopcion) {
      await t.rollback();
      return res.status(404).json({ error: 'Adopción no encontrada' });
    }

    const mascotaId = adopcion.MascotaID;
    const ubicacionId = adopcion.UbicacionID;

    await db.Adopcion.destroy({
      where: { AdopcionID: id },
      transaction: t
    });

    await db.Mascota.destroy({
      where: { MascotaID: mascotaId },
      transaction: t
    });

    await db.Ubicacion.destroy({
      where: { UbicacionID: ubicacionId },
      transaction: t
    });

    await t.commit();
    res.status(200).json({ mensaje: 'Adopción, ubicación y mascota asociada eliminadas correctamente' });

  } catch (error) {
    if (t) await t.rollback();

    console.error('Error al eliminar la adopción: ', error);
    console.error(error.stack);

    res.status(500).json({ error: 'Error al eliminar la adopción' });
  }
};

exports.obtenerAdopcionPorId = async (req, res) => {
  const db = getDb();
  const { id } = req.params;

  try {
    const adopcion = await db.Adopcion.findByPk(id);

    if (!adopcion) {
      return res.status(404).json({ mensaje: 'Adopción no encontrada' });
    }

    res.status(200).json(adopcion);
  } catch (error) {
    console.error('Error al obtener la adopcion: ', error);
    console.error(error.stack);

    res.status(500).json({ error: 'Error al obtener la adopción' });
  }
};

exports.obtenerAdopcionesPorPublicador = async (req, res) => {
  const db = getDb();
  const { publicadorId } = req.params;

  try {
    const adopciones = await db.Adopcion.findAll({
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

    res.status(200).json(adopciones);
  } catch (error) {
    console.error('Error al obtener las adopciones del publicador:', error);
    res.status(500).json({ error: 'Error al obtener las adopciones' });
  }
};