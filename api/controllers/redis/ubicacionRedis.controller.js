const redis = require("../../config/clienteRedis");
const { getDb } = require('../../config/db');

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

async function registrarUbicacionSolicitudAdopcion(solicitudAdopcionId, longitud, latitud, estado, publicadorID) {
    try {
        await redis.geoAdd(keyGeoSolicitudesAdopcion, {
            longitude: parseFloat(longitud),
            latitude: parseFloat(latitud),
            member: `solicitudAdopcion:${solicitudAdopcionId}`
        });

        await redis.set(
            `solicitudAdopcion:${solicitudAdopcionId}`,
            JSON.stringify({
                estado,
                publicadorId: publicadorID
            })
        );
    } catch (error) {
        console.error('Error al registrar la ubicación de solicitud de adopción en Redis: ', error);
        throw error;
    }


}

async function obtenerSolicitudesAdopcionCercanas(Longitud, Latitud, UsuarioID) {
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

        const ids = resultados.map(r => r[0].replace("solicitudAdopcion:", ""));

        if (ids.length === 0) return [];

        const db = getDb();

        const solicitudes = await db.SolicitudAdopcion.findAll({
            where: {
                SolicitudAdopcionID: ids,
                Estado: false,
                PublicadorID: { [db.Sequelize.Op.ne]: UsuarioID }
            },
            include: [{
                model: db.Mascota,
                as: 'Mascota'
            }]
        });

        const coordenadasPorID = {};
        resultados.forEach(r => {
            const id = r[0].replace("solicitudAdopcion:", "");
            coordenadasPorID[id] = {
                distancia: parseFloat(r[1]),
                longitud: parseFloat(r[2][0]),
                latitud: parseFloat(r[2][1])
            };
        });

        return solicitudes.map(s => ({
            solicitudAdopcionId: s.SolicitudAdopcionID,
            latitud: coordenadasPorID[s.SolicitudAdopcionID].latitud,
            longitud: coordenadasPorID[s.SolicitudAdopcionID].longitud,
            distancia: coordenadasPorID[s.SolicitudAdopcionID].distancia,
            mascota: {
                mascotaId: s.Mascota.MascotaID,
                nombre: s.Mascota.Nombre,
                especie: s.Mascota.Especie,
                raza: s.Mascota.Raza,
                edad: s.Mascota.Edad,
                sexo: s.Mascota.Sexo,
                tamano: s.Mascota.Tamaño,
                descripcion: s.Mascota.Descripcion
            }
        }));
    } catch (error) {
        console.error('Error obteniendo ubicaciones cercanas: ', error.message);
        console.error(error.stack);
        throw error;
    }
}

async function eliminarUbicacionUsuario(usuarioId) {
    try {
        await redis.zRem(keyGeoUsuarios, `usuario:${usuarioId}`);
    } catch (error) {
        console.error('Error eliminando ubicacion de usuario: ', error.message);
        console.error(error.stack);
        throw error;
    }
}

async function eliminarUbicacionSolicitudAdopcion(solicitudAdopcionId) {
    try {
        const keyGeo = keyGeoSolicitudesAdopcion;
        const member = `solicitudAdopcion:${solicitudAdopcionId}`;

        await redis.zRem(keyGeo, member);

        await redis.del(member);

        console.log(`Solicitud ${solicitudAdopcionId} eliminada de Redis.`);
    } catch (error) {
        console.error('Error eliminando ubicacion de la solicitudAdopcion: ', error.message);
        console.error(error.stack);
        throw error;
    }
}

module.exports = {
    actualizarUbicacionUsuario,
    registrarUbicacionSolicitudAdopcion,
    obtenerSolicitudesAdopcionCercanas,
    eliminarUbicacionUsuario,
    eliminarUbicacionSolicitudAdopcion
};