const redis = require("../../config/clienteRedis");

const keyGeoUsuarios = "usuarios_ubicacion";
const keyGeoSolicitudesAdopcion = "solicitudesAdopcion_ubicacion"

async function actualizarUbicacionUsuario(usuarioId, longitud, latitud) {
    try {
        await redis.geoAdd(keyGeoUsuarios, {
            longitude: parseFloat(longitud),
            latitude: parseFloat(latitud),
            member: `usuario:${usuarioId}`
        });
    } catch (error) {
        console.error('Error agregando ubicación en Redis: ', error);
        throw error;
    }
}

async function registrarUbicacionSolicitudAdopcion(solicitudAdopcionId, longitud, latitud) {
    try {
        await redis.geoAdd(keyGeoSolicitudesAdopcion, {
            longitude: parseFloat(longitud),
            latitude: parseFloat(latitud),
            member: `solicitudAdopcion:${solicitudAdopcionId}`
        });
    } catch (error) {
        console.error('Error al registrar la ubicación de solicitud de adopción en Redis: ', error);
        throw error;
    }
}

async function obtenerUbicacionesCercanas(Longitud, Latitud) {
    try {
        const resultados = await redis.sendCommand([
            'GEOSEARCH',
            keyGeoSolicitudesAdopcion,
            'FROMLONLAT',
            Longitud.toString(),
            Latitud.toString(),
            'BYRADIUS',
            '5000',
            'm',
            'WITHDIST',
            'WITHCOORD',
            'COUNT',
            '20',
            'ASC'
        ]);

        return resultados.map(r => ({
            solicitudAdopcionId: r[0].replace("solicitudAdopcion:", ""),
            distancia: parseFloat(r[1]),
            longitud: parseFloat(r[2][0]),
            latitud: parseFloat(r[2][1])
        }));

    } catch (error) {
        console.error('Error obteniendo ubicaciones cercanas: ', error);
        throw error;
    }
}

async function eliminarUbicacionUsuario(usuarioId) {
    try {
        await redis.zRem(keyGeoUsuarios, `usuario:${usuarioId}`);
    } catch (error) {
        console.error('Error eliminando ubicacion de usuario: ', error);
        throw error;
    }
}

async function eliminarUbicacionSolicitudAdopcion(solicitudAdopcionId) {
    try {
        await redis.zRem(keyGeoSolicitudesAdopcion, `solicitudAdopcion:${solicitudAdopcionId}`);
    } catch (error) {
        console.error('Error eliminando ubicacion de la solicitudAdopcion: ', error);
        throw error;
    }
}

module.exports = {
    actualizarUbicacionUsuario,
    registrarUbicacionSolicitudAdopcion,
    obtenerUbicacionesCercanas,
    eliminarUbicacionUsuario,
    eliminarUbicacionSolicitudAdopcion
};