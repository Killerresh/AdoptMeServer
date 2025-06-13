const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const grpcDir = path.join(__dirname);

function cargarProto(protoFilePath) {
    const definition = protoLoader.loadSync(protoFilePath, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    });
    return grpc.loadPackageDefinition(definition);
}

const server = new grpc.Server();

const servicios = [
    {
        nombre: 'ServicioChat',
        protoPath: path.join(grpcDir, '/protos/chat.proto'),
        implementacion: require('./serviciosGrpc/chat.grpc'),
    },
    {
        nombre: 'ServicioUbicacion',
        protoPath: path.join(grpcDir, '/protos/ubicacion.proto'),
        implementacion: require('./serviciosGrpc/ubicacion.grpc'),
    }
];

function iniciarServiciosGrpc(db, puerto = '0.0.0.0:50051') {
    for (const servicio of servicios) {
        const paquete = cargarProto(servicio.protoPath);
        const nombrePaquete = Object.keys(paquete)[0];
        const paqueteServicio = paquete[nombrePaquete];

        const implementacion = typeof servicio.implementacion === 'function'
            ? servicio.implementacion(db)
            : servicio.implementacion;

        server.addService(
            paqueteServicio[servicio.nombre].service,
            implementacion
        );
    }

    server.bindAsync(puerto, grpc.ServerCredentials.createInsecure(), (err, port) => {
        if (err) {
            console.error('Error al iniciar gRPC: ', err);
            return;
        }
        console.log(`Servidor gRPC corriendo en puerto ${port}`);
    });
}

module.exports = { iniciarServiciosGrpc };