const redis = require("../../config/clienteRedis");
const { getDb } = require('../../config/db');

const keyGeoUsuarios = "usuarios_ubicacion";
const keyGeoAdopciones = "adopciones_ubicacion"

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

async function registrarUbicacionAdopcion(adopcionId, longitud, latitud, estado, publicadorID) {
    try {
        await redis.geoAdd(keyGeoAdopciones, {
            longitude: parseFloat(longitud),
            latitude: parseFloat(latitud),
            member: `adopcion:${adopcionId}`
        });

        await redis.set(
            `adopcion:${adopcionId}`,
            JSON.stringify({
                estado,
                publicadorId: publicadorID
            })
        );
    } catch (error) {
        console.error('Error al registrar la ubicación de adopción en Redis: ', error);
        throw error;
    }


}

async function obtenerAdopcionesCercanas(Longitud, Latitud, UsuarioID) {
    try {
        const resultados = await redis.sendCommand([
            'GEOSEARCH',
            keyGeoAdopciones,
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

        const ids = resultados.map(r => r[0].replace("adopcion:", ""));

        if (ids.length === 0) return [];

        const db = getDb();

        const adopciones = await db.Adopcion.findAll({
            where: {
                AdopcionID: ids,
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
            const id = r[0].replace("adopcion:", "");
            coordenadasPorID[id] = {
                distancia: parseFloat(r[1]),
                longitud: parseFloat(r[2][0]),
                latitud: parseFloat(r[2][1])
            };
        });

        const resultadosRedis = adopciones.map(a => {
            const coords = coordenadasPorID[a.AdopcionID.toString()];
            return {
                solicitudAdopcionId: a.AdopcionID,
                latitud: coords.latitud,
                longitud: coords.longitud,
                distancia: coords.distancia,
                mascota: {
                    mascotaId: a.Mascota.MascotaID,
                    nombre: a.Mascota.Nombre,
                    especie: a.Mascota.Especie,
                    raza: a.Mascota.Raza,
                    edad: a.Mascota.Edad,
                    sexo: a.Mascota.Sexo,
                    tamano: a.Mascota.Tamaño,
                    descripcion: a.Mascota.Descripcion
                }
            };
        });

        return resultadosRedis;

    } catch (error) {
        console.error('Error obteniendo ubicaciones cercanas: ', error.message);
        console.error(error.stack);
        throw error;
    }
}

async function obtenerUsuariosCercanos(longitud, latitud, usuarioIDExcluido) {
    try {
        const resultados = await redis.sendCommand([
            'GEOSEARCH',
            keyGeoUsuarios,
            'FROMLONLAT',
            longitud.toString(),
            latitud.toString(),
            'BYRADIUS',
            '10000',
            'm',
            'WITHDIST',
            'COUNT',
            '100',
            'ASC'
        ]);

        const usuariosConDistancia = resultados
            .filter(r => r[0].startsWith('usuario:'))
            .map(r => {
                const usuarioId = parseInt(r[0].replace('usuario:', ''));
                const distanciaMetros = parseFloat(r[1]);
                return { usuarioId, distanciaKm: (distanciaMetros / 1000).toFixed(2) };
            })
            .filter(u => u.usuarioId !== usuarioIDExcluido);

        console.log('Usuarios con distancia obtenidos de Redis:', usuariosConDistancia);

        if (usuariosConDistancia.length === 0) return [];

        const db = getDb();
        const { Usuario } = db;

        const usuarios = await Usuario.findAll({
            where: { UsuarioID: usuariosConDistancia.map(u => u.usuarioId) }
        });

        const usuariosCercanos = usuarios.map(usuario => {
            const infoDistancia = usuariosConDistancia.find(u => u.usuarioId === usuario.UsuarioID);
            if (!infoDistancia) {
                console.warn(`No se encontró distancia para usuario ${usuario.UsuarioID}`);
                return null;
            }
            return {
                UsuarioID: usuario.UsuarioID,
                Nombre: usuario.Nombre,
                DistanciaKm: infoDistancia.distanciaKm
            };
        }).filter(u => u !== null);


        return usuariosCercanos;

    } catch (error) {
        console.error('Error al notificar usuarios cercanos:', error.message);
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

async function eliminarUbicacionAdopcion(adopcionId) {
    try {
        const keyGeo = keyGeoAdopciones;
        const member = `adopcion:${adopcionId}`;

        await redis.zRem(keyGeo, member);

        await redis.del(member);

        console.log(`Solicitud ${adopcionId} eliminada de Redis.`);
    } catch (error) {
        console.error('Error eliminando ubicacion de la adopcion: ', error.message);
        console.error(error.stack);
        throw error;
    }
}

module.exports = {
    actualizarUbicacionUsuario,
    registrarUbicacionAdopcion,
    obtenerAdopcionesCercanas,
    obtenerUsuariosCercanos,
    eliminarUbicacionUsuario,
    eliminarUbicacionAdopcion
};