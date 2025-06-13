const WebSocket = require('ws');
const { redisPub, redisSub } = require('../../config/clienteRedis');
const Mensaje = require('../../models/Mensaje');

const chatWebSocket = (server) => {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        console.log('Cliente conectado al chat');

        ws.on('message', async (datos) => {
            const msg = JSON.parse(datos);

            try {
                await Mensaje.create({
                    RemitenteID: msg.RemitenteID,
                    ReceptorID: msg.ReceptorID,
                    Contenido: msg.Contenido
                });
            } catch (error) {
                console.error('Error al guardar el mensaje: ', error);
            }

            await redisPub.publish('canal-chat', JSON.stringify(msg));
        });

        redisSub.subscribe('canal-chat', (mensaje) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(mensaje);
            }
        });

        ws.on('close', () => {
            console.log('Cliente desconectado del chat');
        });
    });
};

MediaSourceHandle.exports = chatWebSocket;