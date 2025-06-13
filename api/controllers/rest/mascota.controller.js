const { getDb } = require('../../config/db');

exports.obtenerMascotas = async (req, res) => {
  const db = getDb();

  try {
    const mascotas = await db.Mascota.findAll();
    res.json(mascotas);
  } catch (error) {
    console.error('Error al obtener las mascotas: ', error);
    res.status(500).json({ error: 'Error al obtener las mascotas', detalles: error.message });
  }
};

exports.modificarMascota = async (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const {
    Nombre,
    Especie,
    Raza,
    Edad,
    Sexo,
    Tamaño,
    Descripcion,
    PublicadorID,
    UbicacionID
  } = req.body;

  try {
    const mascota = await db.Mascota.findByPk(id);

    if (!mascota) {
      return res.status(404).json({ mensaje: 'Mascota no encontrada' });
    }

    // Actualiza los campos solo si vienen en la request
    mascota.Nombre = Nombre ?? mascota.Nombre;
    mascota.Especie = Especie ?? mascota.Especie;
    mascota.Raza = Raza ?? mascota.Raza;
    mascota.Edad = Edad ?? mascota.Edad;
    mascota.Sexo = Sexo ?? mascota.Sexo;
    mascota.Tamaño = Tamaño ?? mascota.Tamaño;
    mascota.Descripcion = Descripcion ?? mascota.Descripcion;
    mascota.PublicadorID = PublicadorID ?? mascota.PublicadorID;
    mascota.UbicacionID = UbicacionID ?? mascota.UbicacionID;

    await mascota.save();

    res.status(200).json({ mensaje: 'Mascota actualizada correctamente', mascota });
  } catch (error) {
    console.error('Error al modificar mascota:', error);
    res.status(500).json({ error: 'Error al actualizar la mascota', detalles: error.message });
  }
};