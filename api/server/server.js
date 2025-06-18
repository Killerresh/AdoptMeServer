require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { conexionConReintentos, getDb }  = require('../config/db');
const bloquearAccesoDireto = require('../middlewares/bloquear-acceso-direto');
const { iniciarServiciosGrpc } = require('../grpc/grpcServer');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

class Server {

    constructor() {
        this.app = express();
        this.port = process.env.PORT;
        this.documentoSwagger = YAML.load(path.join(__dirname, '../swagger.yaml'));
        this.middlewares();
        this.configuracionSwagger();
    }

    async init() {
        await conexionConReintentos();
        this.routes();
        this.handleErrors();
    }

    async start() {
        await this.init();

        const httpServer = require('http').createServer(this.app);
        httpServer.listen(this.port, () => {
            console.log(`API Express corriendo en puerto ${this.port}`);
        });
        
        const db = getDb();
        iniciarServiciosGrpc(db);
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
        this.app.use(bloquearAccesoDireto)
        this.app.use('/multimedia', express.static(path.join(__dirname, 'multimedia')));
    }

    handleErrors() {
        this.app.use((err, req, res, next) => {
            console.error(err.stack);
            res.status(500).json({ error: 'Ocurrió un error en el servidor' });
        });
    }

    configuracionSwagger() {
        this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(this.documentoSwagger));
    }

    getApp() {
        return this.app;
    }
}

module.exports = Server;