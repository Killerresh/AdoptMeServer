const { redisPub, redisSub } = require('../../config/redisPubSub');

const obtenerCanalPrivado = (id1, id2) => {
    const idsOrdenados = [id1, id2].sort((a, b) => a - b);
    return `chat:${idsOrdenados[0]}_${idsOrdenados[1]}`;
};

module.exports = (db) => {
    const { Mensaje, Usuario, Sequelize } = db;

    return {
        PublicarMensaje: async (call, callback) => {
            const mensaje = call.request;

            await Mensaje.create({
                RemitenteID: mensaje.remitenteID,
                ReceptorID: mensaje.receptorID,
                Contenido: mensaje.contenido,
                FechaEnvio: new Date(),
                Leido: false
            });

            const canal = obtenerCanalPrivado(mensaje.remitenteID, mensaje.receptorID);
            await redisPub.publish(canal, JSON.stringify(mensaje));
            callback(null, {});
        },

        SuscribirMensajes: (call) => {
            const { remitenteID, receptorID } = call.metadata.getMap();
            const canal = obtenerCanalPrivado(remitenteID, receptorID);

            const receptor = (msj) => {
                const dato = JSON.parse(msj);
                call.write(dato);
            };

            redisSub.subscribe(canal, receptor);

            call.on('cancelled', () => {
                redisSub.unsubscribe(canal, receptor);
            });
        },

        ObtenerMensajes: async (call, callback) => {
            const { usuarioID, otroUsuarioID } = call.request;

            const mensajes = await Mensaje.findAll({
                where: {
                    [Sequelize.Op.or]: [
                        { RemitenteID: usuarioID, ReceptorID: otroUsuarioID },
                        { RemitenteID: otroUsuarioID, ReceptorID: usuarioID }
                    ]
                },
                order: [['FechaEnvio', 'ASC']]
            });

            const respuesta = {
                mensajes: mensajes.map(m => ({
                    remitenteID: m.RemitenteID,
                    receptorID: m.ReceptorID,
                    contenido: m.Contenido,
                    fecha: m.FechaEnvio.toISOString()
                }))
            };

            callback(null, respuesta);
        },

        ObtenerContactos: async (call, callback) => {
            const { usuarioID } = call.request;

            const mensajes = await Mensaje.findAll({
                where: {
                    [Sequelize.Op.or]: [
                        { RemitenteID: usuarioID },
                        { ReceptorID: usuarioID }
                    ]
                }
            });

            const ids = new Set();

            for (const m of mensajes) {
                if (m.RemitenteID !== usuarioID) ids.add(m.RemitenteID);
                if (m.ReceptorID !== usuarioID) ids.add(m.ReceptorID);
            }

            const contactos = await Usuario.findAll({
                where: {
                    UsuarioId: [...ids]
                }
            });

            const respuesta = {
                contactos: contactos.map(u => ({
                    usuarioID: u.UsuarioId,
                    nombre: u.Nombre
                }))
            };

            callback(null, respuesta);
        }
    };
};
