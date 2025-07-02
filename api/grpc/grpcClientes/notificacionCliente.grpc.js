const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../protos/notificacion.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const notificacionProto = grpc.loadPackageDefinition(packageDefinition).notificacion;

const cliente = new notificacionProto.ServicioNotificacion(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

function enviarNotificacionGrpc(token, notificacionData) {
  return new Promise((resolve, reject) => {
    const metadata = new grpc.Metadata();
    metadata.add('authorization', `Bearer ${token}`);

    cliente.EnviarNotificacion(notificacionData, metadata, (err, response) => {
      if (err) {
        console.error('Error al enviar notificación:', err.message);
        return reject(err);
      }

      console.log('Respuesta del servidor:', response);
      resolve(response);
    });
  });
}

module.exports = {
  enviarNotificacionGrpc
};
