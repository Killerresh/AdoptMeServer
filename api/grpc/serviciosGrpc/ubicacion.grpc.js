const { obtenerSolicitudesAdopcionCercanas } = require('../../controllers/redis/ubicacionRedis.controller');
const grpc = require('@grpc/grpc-js');
const withAuth = require('../interceptores/withAuth');

module.exports = () => {
    return {
        ObtenerSolicitudesCercanas: withAuth(async (call, callback) => {
            try {
                let usuario = call.usuario;

                if (!usuario) {
                    return callback({
                    code: grpc.status.UNAUTHENTICATED,
                    message: 'Usuario no autenticado'
                    });
                }

                const { longitud, latitud } = call.request;
                const resultados = await obtenerSolicitudesAdopcionCercanas(longitud, latitud, usuario.UsuarioID);

                callback(null, { resultados });
            } catch (error) {
                console.error("Error al obtener solicitudes cercanas", error.message);
                console.error(error.stack);
                
                callback({
                    code: grpc.status.INTERNAL,
                    message: error.message
                });
            }
        })
    };
};
