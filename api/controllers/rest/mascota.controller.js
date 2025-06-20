const { getDb } = require('../../config/db');
const fs = require('fs');
const path = require('path');

exports.obtenerMascotas = async (req, res) => {
  const db = getDb();

  try {
    const mascotas = await db.Mascota.findAll();
    res.json(mascotas);
  } catch (error) {
    console.error('Error al obtener las mascotas: ', error);
    console.error(error.stack);

    res.status(500).json({ error: 'Error al obtener las mascotas' });
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
    Descripcion
  } = req.body;

  try {
    const mascota = await db.Mascota.findByPk(id);

    if (!mascota) {
      return res.status(404).json({ mensaje: 'Mascota no encontrada' });
    }

    mascota.Nombre = Nombre ?? mascota.Nombre;
    mascota.Especie = Especie ?? mascota.Especie;
    mascota.Raza = Raza ?? mascota.Raza;
    mascota.Edad = Edad ?? mascota.Edad;
    mascota.Sexo = Sexo ?? mascota.Sexo;
    mascota.Tamaño = Tamaño ?? mascota.Tamaño;
    mascota.Descripcion = Descripcion ?? mascota.Descripcion;

    await mascota.save();

    res.status(200).json({ mensaje: 'Mascota actualizada correctamente', mascota });
  } catch (error) {
    console.error('Error al modificar mascota:', error);
    console.error(error.stack);

    res.status(500).json({ error: 'Error al actualizar la mascota' });
  }
};

exports.obtenerFotoMascota = async (req, res) => {
  try {
    console.log("Obteniendo foto...");
    const usuario = req.usuario;
    const MascotaID = parseInt(req.params.id, 10);

    if (!usuario) {
      return res.status(401).json({ error: 'Token inválido o no enviado' });
    }

    if (isNaN(MascotaID)) {
      return res.status(400).json({ error: 'ID de mascota inválido' });
    }

    const db = getDb();

    const fotoMascota = await db.FotoMascota.findOne({
      where: { MascotaID }
    });

    if (!fotoMascota) {
      console.warn(`No se encontró una foto registrada para la MascotaID: ${MascotaID}`);
      return res.status(404).json({ error: 'No se encontró foto para la mascota' });
    }

    const rutaAbsoluta = path.join(__dirname, '../../', fotoMascota.UrlFoto);

    if (!fs.existsSync(rutaAbsoluta)) {
      console.warn('Archivo no existe físicamente en el servidor');
      return res.status(404).json({ error: 'Archivo de foto no encontrado' });
    }

    res.sendFile(rutaAbsoluta);
    console.log("Foto enviada");
  } catch (error) {
    console.error('Error al obtener la foto de la mascota:', error);
    console.error(error.stack);

    res.status(500).json({ error: 'Error al obtener la foto de la mascota' });
  }
};

exports.obtenerVideoMascota = async (req, res) => {
  try {
    console.log("Obteniendo video...");
    const usuario = req.usuario;
    const MascotaID = parseInt(req.params.id, 10);

    if (!usuario) {
      return res.status(401).json({ error: 'Token inválido o no enviado' });
    }

    if (isNaN(MascotaID)) {
      return res.status(400).json({ error: 'ID de mascota inválido' });
    }

    const db = getDb();

    const videoMascota = await db.VideoMascota.findOne({
      where: { MascotaID }
    });

    if (!videoMascota) {
      console.warn(`No se encontró un video registrado para la MascotaID: ${MascotaID}`);
      return res.status(404).json({ error: 'No se encontró foto para la mascota' });
    }

    const rutaAbsoluta = path.join(__dirname, '../../', videoMascota.UrlVideo);

    if (!fs.existsSync(rutaAbsoluta)) {
      console.warn('Archivo no existe físicamente en el servidor');
      return res.status(404).json({ error: 'Archivo de video no encontrado' });
    }

    const stat = fs.statSync(rutaAbsoluta);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;
      const file = fs.createReadStream(rutaAbsoluta, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4'
      });

      file.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4'
      });

      fs.createReadStream(videoPath).pipe(res);
    }

    console.log("Video enviado");
  } catch (error) {
    console.error('Error al obtener el video de mascota:', error);
    console.error(error.stack);

    res.status(500).json({ error: 'Error al obtener el video de mascota' });
  }
};