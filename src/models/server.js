require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('../config/db');

class Server {

    constructor() {
        this.app = express();
        this.port = process.env.PORT;
        this.connectDB();
        this.middlewares();
        this.routes();
        this.handleErrors();
    }

    async connectDB() {
        try {
            await sequelize.authenticate();
            console.log('Conexión a SQL Server establecida correctamente');
        } catch(error) {
            console.error('Error al conectar con la base de datos: ', error);
            process.exit(1);
        }
    }

    routes() {
        this.app.use('/api/usuario', require('../routes/usuario.routes'));
        this.app.use('/api/ubicacion', require('../routes/ubicacion.routes'));
    }

    middlewares() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.static('public'));
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
        })
    }
}

module.exports = Server;