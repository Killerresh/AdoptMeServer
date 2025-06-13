const fs = require('fs');
const path = require('path');

module.exports = () => {
  return {
    SubirMultimedia: (call, callback) => {
      const multimediaId = `video_${Date.now()}`; // O usa un ID real
      const filePath = path.join(__dirname, '..', 'uploads', `${videoId}.mp4`);
      const writeStream = fs.createWriteStream(filePath);

      call.on('data', (chunk) => {
        writeStream.write(chunk.chunk);
      });

      call.on('end', () => {
        writeStream.end();
        callback(null, { ok: true, message: 'Video subido correctamente' });
      });

      call.on('error', (err) => {
        console.error('Error en subida:', err);
        callback(err);
      });
    },

    // Descarga: leemos archivo y enviamos chunks al cliente
    DescargarVideo: (call) => {
      const { videoId } = call.request;
      const filePath = path.join(__dirname, '..', 'uploads', `${videoId}.mp4`);

      const readStream = fs.createReadStream(filePath);
      readStream.on('data', (chunk) => {
        call.write({ chunk });
      });
      readStream.on('end', () => call.end());
      readStream.on('error', (err) => {
        console.error('Error en descarga:', err);
        call.destroy(err);
      });
    }
  };
};