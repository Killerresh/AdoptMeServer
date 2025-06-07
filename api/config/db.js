const { Sequelize } = require('sequelize');

const esPrueba = process.env.NODE_ENV === 'test';

const sequelize = new Sequelize(
    esPrueba ? process.env.DB_PRUEBA_NAME : process.env.DB_NAME, 
    process.env.DB_USER, 
    process.env.DB_PASSWORD, 
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        port: process.env.DB_PORT,
        dialectOptions: {
            options: {
                encrypt: false,
                trustServerCertificate: true
            }
        }
});

async function conexionConReintentos(reintentos = 20, delay = 15000) {
    while (reintentos > 0) {
        try {
            await sequelize.authenticate();
            console.log('Conexión a SQL Server establecida correctamente.');
            return;
        } catch (error) {
            console.error(`Error al conectar con la base de datos (${20 - reintentos + 1} intento): `, error.message);
            reintentos--;
            if (reintentos === 0) {
                console.error('No se pudo conectar con la base de datos. Abortando...');
                process.exit(1);
            }
            console.log(`Reintentando en ${delay / 1000} segundos...`);
            await new Promise(res => setTimeout(res, delay));
        }
    }
}

module.exports = { sequelize, conexionConReintentos };