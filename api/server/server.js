require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { conexionConReintentos }  = require('../config/db');
const bloquearAccesoDireto = require('../middlewares/bloquear-acceso-direto');

class Server {

    constructor() {
        this.app = express();
        this.port = process.env.PORT;
        this.middlewares();
    }

    async init() {
        await conexionConReintentos();
        this.routes();
        this.handleErrors();
    }

    async start() {
        await this.init();
        this.listen();
    }

    routes() {
        this.app.use('/api/usuarios', require('../servicios/routes/usuario.routes'));
        this.app.use('/api/ubicaciones', require('../servicios/routes/ubicacion.routes'));
        this.app.use('/api/mascotas', require('../servicios/routes/mascota.routes'));
        this.app.use('/api/solicitudAdopciones', require('../servicios/routes/solicitudAdopcion.routes'));
        this.app.use('/api/acceso', require('../servicios/routes/acceso.routes'));
    }

    middlewares() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.static('public'));
        this.app.use(bloquearAccesoDireto)
        this.app.use('/uploads', express.static(path.join(__dirname, "..", "uploads")));
    }

    handleErrors() {
        this.app.use((err, req, res, next) => {
            console.error(err.stack);
            res.status(500).json({ error: 'Ocurrió un error en el servidor' });
        });
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log(`Server listening on port ${this.port}`)
        });
    }

    getApp() {
        return this.app;
    }
}

module.exports = Server;