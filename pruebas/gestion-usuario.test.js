const request = require("supertest")
const Server = require("../api/server/server")
const { sequelize } = require("../api/config/db");

let app;

beforeAll(async () => {
    app = new Server().app;

    await sequelize.sync();
});

afterAll(async () => {
    await sequelize.close();
});

describe('Pruebas de gestión de usuarios', () => {
    test('Debe registrar una ubicación', async () => {
        const res = await request(app)
            .post('/api/ubicaciones')
            .send({
                Longitud: '34.123423',
                Latitud: '35.123423'
            });
        
        console.log("Respuesta POST /api/ubicaciones: ", res.body)
        expect(res.statusCode).toBe(200);
    });

    test('Debe registrar un nuevo usuario', async () => {
        const res = await request(app)
            .post('/api/usuarios')
            .send({
                Nombre: 'Prueba',
                Correo: `prueba${Date.now()}@mail.com`,
                ContrasenaHash: 'contrasenaHash',
                Telefono: '123456789',
                Ciudad: 'Xalapa',
                UbicacionID: 1,
                EsAdmin: false
            });

        console.log("Respuesta POST /api/usuarios: ", res.body)
        expect(res.statusCode).toBe(200);
    });

    test('Debe obtener todos los usuarios', async () => {
        const res = await request(app).get('/api/usuarios');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});