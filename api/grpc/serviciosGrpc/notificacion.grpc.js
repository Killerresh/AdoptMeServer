const grpc = require('@grpc/grpc-js');
const withAuth = require('../interceptores/withAuth');
const EventEmitter = require('events');

class NotificacionManager extends EventEmitter {
    constructor() {
        super();
        this.clientes = new Map();
    }

    agregarCliente(usuarioID, call) {
        if (!this.clientes.has(usuarioID)) {
            this.clientes.set(usuarioID, new Set());
        }
        this.clientes.get(usuarioID).add(call);

        call.on('cancelled', () => {
            this.removerCliente(usuarioID, call);
        });
        call.on('end', () => {
            this.removerCliente(usuarioID, call);
        });
        call.on('close', () => {
            this.removerCliente(usuarioID, call);
        });
    }

    removerCliente(usuarioID, call) {
        if (this.clientes.has(usuarioID)) {
            const setCalls = this.clientes.get(usuarioID);
            setCalls.delete(call);
            if (setCalls.size === 0) {
                this.clientes.delete(usuarioID);
            }
        }
    }

    enviarNotificacion(usuarioId, notificacion) {
        if (this.clientes.has(usuarioId)) {
            console.log(`Enviando notificación a ${this.clientes.get(usuarioId).size} cliente(s) del usuario ${usuarioId}`);
            for (const call of this.clientes.get(usuarioId)) {
                call.write(notificacion);
            }
        } else {
            console.log(`No hay clientes conectados para usuario ${usuarioId}`);
        }
    }
}

const manager = new NotificacionManager();

function ServicioNotificacion(db) {
    return {
        EscucharNotificaciones: withAuth((call) => {
            const usuarioID = call.usuario.UsuarioID;

            console.log(`Usuario ${usuarioID} suscrito a notificaciones gRPC.`);

            manager.agregarCliente(usuarioID, call);

            call.on('data', (data) => {

            });

            call.on('error', (err) => {
                console.error(`Error en stream de usuario ${usuarioID}:`, err);
            });

            call.on('end', () => {
                console.log(`Usuario ${usuarioID} terminó conexión de notificaciones.`);
                call.end();
                manager.removerCliente(usuarioID, call);
            });
        }),

        EnviarNotificacion: withAuth(async (call, callback) => {
            try {
                console.log('Recibida petición EnviarNotificacion:', call.request);
                
                const { usuarioId, titulo, mensaje, tipo, referenciaID, referenciaTipo, fecha } = call.request;

                const notificacion = await db.Notificacion.create({
                    UsuarioID: usuarioId,
                    Titulo: titulo,
                    Mensaje: mensaje,
                    Tipo: tipo,
                    ReferenciaID: referenciaID,
                    ReferenciaTipo: referenciaTipo,
                    FechaCreacion: fecha ? new Date(fecha) : new Date(),
                    Leida: false
                });

                console.log(`📢 Enviando notificación push a usuario ${usuarioId}:`, notificacion.Mensaje);

                manager.enviarNotificacion(usuarioId, {
                    titulo: notificacion.Titulo,
                    mensaje: notificacion.Mensaje,
                    tipo: notificacion.Tipo,
                    referenciaId: notificacion.ReferenciaID,
                    referenciaTipo: notificacion.ReferenciaTipo,
                    fecha: notificacion.FechaCreacion.toISOString()
                });

                callback(null, { exito: true });
            } catch (error) {
                console.error('Error en EnviarNotificacion:', error);
                callback({
                    code: grpc.status.INTERNAL,
                    message: error.message
                });
            }
        })
    };
}

module.exports = ServicioNotificacion;
