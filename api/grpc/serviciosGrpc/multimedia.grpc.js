const fs = require('fs');
const path = require('path');
const grpc = require('@grpc/grpc-js');
const withAuth = require('../interceptores/withAuth');

const directorios = {
  fotosUsuarios: path.join(__dirname, '../../multimedia/fotos/usuarios'),
  fotosMascotas: path.join(__dirname, '../../multimedia/fotos/mascotas'),
  videosMascotas: path.join(__dirname, '../../multimedia/videos/mascotas'),
};

function crearManejadorStream({ directorioDestino, modeloBD, modeloPadre, campoFK, campoBD, extensionesPermitidas, subruta }) {
  return withAuth(async (call, callback) => {
    console.log('Inició la subida');
    let metadata, fileStream, nombreSeguro = '', ruta = '';
    let errorPrevio = false;

    function terminarConError(grpcError) {
      if (!errorPrevio) {
        console.error('Terminando con error:', grpcError);
        errorPrevio = true;
        if (fileStream) {
          fileStream.destroy();
        }
        callback(grpcError);
        call.end();
      }
    }

    try {
      const usuario = call.usuario;
      if (!usuario) {
        return terminarConError({
          code: grpc.status.UNAUTHENTICATED,
          message: 'Token inválido o no enviado',
        });
      }

      call.on('data', async (data) => {
        try {
          if (errorPrevio) return;

          const tipoContenido = data.contenido;

          if (tipoContenido === 'metadata' && data.metadata) {
            if (metadata) {
              return terminarConError({
                code: grpc.status.ALREADY_EXISTS,
                message: 'Los metadatos ya fueron enviados',
              });
            }

            metadata = data.metadata;
            const extension = path.extname(metadata.nombreArchivo).toLowerCase();

            if (!extensionesPermitidas.includes(extension)) {
              return terminarConError({
                code: grpc.status.INVALID_ARGUMENT,
                message: `Formato no permitido. Solo se permiten: ${extensionesPermitidas.join(', ')}`
              });
            }

            if (modeloPadre) {
              const existePadre = await modeloPadre.findByPk(metadata.idReferencia);
              if (!existePadre) {
                return terminarConError({
                  code: grpc.status.INVALID_ARGUMENT,
                  message: `El ${campoFK} ${metadata.idReferencia} no existe en la base de datos.`
                });
              }
            }

            nombreSeguro = `${Date.now()}_${metadata.nombreArchivo}`;
            ruta = path.join(directorioDestino, nombreSeguro);
            fs.mkdirSync(directorioDestino, { recursive: true });

            fileStream = fs.createWriteStream(ruta);
            fileStream.on('error', (err) => {
              console.error('Error al escribir en disco:', err);
              terminarConError({
                code: grpc.status.INTERNAL,
                message: 'Error al guardar el archivo en disco',
              });
            });
            
            console.log('Inicio escritura en archivo:', ruta);

          } else if (tipoContenido === 'chunk' && data.chunk) {
            if (!fileStream || fileStream.destroyed) {
              console.log('No se puede escribir, fileStream no existe o ya está destruido');
              return;
            }
            fileStream.write(data.chunk);

          } else {
            console.warn('ChunkArchivo no contiene datos válidos');
          }

        } catch (err) {
          console.error('Error en call.on("data"):', err);
          terminarConError({
            code: grpc.status.INTERNAL,
            message: 'Error procesando los datos del stream'
          });
        }
      });


      call.on('end', async () => {
        console.log('Stream finalizó (on end)');
        if (errorPrevio) {
          console.log('No se procesa porque hubo error previo');
          return;
        }

        if (!fileStream || !metadata || !modeloBD) {
          console.log('Faltan variables necesarias para continuar');
          return terminarConError({
            code: grpc.status.INTERNAL,
            message: 'Faltan datos para completar la carga',
          });
        }

        fileStream.end(async () => {
          const urlRelativa = `/multimedia/${subruta}/${nombreSeguro}`;

        try {
          const registrosAnteriores = await modeloBD.findAll({
            where: { [campoFK]: metadata.idReferencia }
          });

          for (const registro of registrosAnteriores) {
            const rutaAbsoluta = path.join(__dirname, '../../', registro[campoBD]);
            if (fs.existsSync(rutaAbsoluta)) {
              fs.unlinkSync(rutaAbsoluta);
              console.log('Archivo anterior eliminado:', rutaAbsoluta);
            }
            await registro.destroy();
          }

          await modeloBD.create({ [campoFK]: metadata.idReferencia, [campoBD]: urlRelativa });

          console.log('Inserción completada');
          callback(null, { exito: true, mensaje: 'Archivo guardado correctamente' });

        } catch (errorBD) {
          console.error('Error al guardar en la base de datos:', errorBD.message);
          console.error(errorBD.stack);
          return terminarConError({
            code: grpc.status.INTERNAL,
            message: 'Error al guardar el archivo en la base de datos',
          });
        }
        });
      });

      call.on('error', (err) => {
        console.error('Error durante la carga:', err);
        terminarConError({
          code: grpc.status.INTERNAL,
          message: err.message,
        });
      });

    } catch (err) {
      console.error('Error general en streaming:', err);
      console.error(err.stack);
      terminarConError({
        code: grpc.status.INTERNAL,
        message: err.message,
      });
    }
  });
}

module.exports = (db) => {
  return {
    SubirFotoUsuario: crearManejadorStream({
      directorioDestino: directorios.fotosUsuarios,
      modeloBD: db.FotoUsuario,
      modeloPadre: db.Usuario,
      campoFK: 'UsuarioID',
      campoBD: 'UrlFoto',
      extensionesPermitidas: ['.jpg', '.jpeg', '.png'],
      subruta: 'fotos/usuarios',
    }),
    SubirFotoMascota: crearManejadorStream({
      directorioDestino: directorios.fotosMascotas,
      modeloBD: db.FotoMascota,
      modeloPadre: db.Mascota,
      campoFK: 'MascotaID',
      campoBD: 'UrlFoto',
      extensionesPermitidas: ['.jpg', '.jpeg', '.png'],
      subruta: 'fotos/mascotas',
    }),
    SubirVideoMascota: crearManejadorStream({
      directorioDestino: directorios.videosMascotas,
      modeloBD: db.VideoMascota,
      modeloPadre: db.Mascota,
      campoFK: 'MascotaID',
      campoBD: 'UrlVideo',
      extensionesPermitidas: ['.mp4'],
      subruta: 'videos/mascotas',
    }),
  };
};
