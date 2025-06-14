const { obtenerUbicacionesCercanas } = require('../../controllers/redis/ubicacionRedis.controller');
const grpc = require('@grpc/grpc-js');
const verificarJWT = require('../../middlewares/verificarJWT');

module.exports = () => {
    return {
        ObtenerSolicitudesCercanas: async (call, callback) => {
            try {
                const token = call.metadata.get('authorization')[0];
                const usuario = verificarJWT(token);

                if (!usuario) {
                    return callback({
                    code: grpc.status.UNAUTHENTICATED,
                    message: 'Token inválido o no enviado'
                    });
                }

                const { longitud, latitud } = call.request;
                const resultados = await obtenerUbicacionesCercanas(longitud, latitud);

                callback(null, { resultados });
            } catch (error) {
                console.error("Error en auth o solicitud:", error.message);
                console.error(error.stack);
                callback({
                    code: grpc.status.UNAUTHENTICATED,
                    message: error.message
                });
            }
        }
    };
};
