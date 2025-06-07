const db = require("../api/config/db");
const request = require("supertest");
jest.setTimeout(60000);

let app;
let Acceso, Usuario, Ubicacion;

beforeAll(async () => {
    app = await require("./appTest");
    
    await db.conexionConReintentos();
    await db.sequelize.sync();

    ({ Acceso, Usuario, Ubicacion } = require("../api/models"));
});

afterAll(async () => {
    try {
        await Usuario.destroy({ where: {}, cascade: true });
        await Ubicacion.destroy({ where: {}, cascade: true });
        await Acceso.destroy({ where: {}, cascade: true });

        await db.sequelize.query("DBCC CHECKIDENT ('dbo.Ubicacion', RESEED, 0)");
        await db.sequelize.query("DBCC CHECKIDENT ('dbo.Acceso', RESEED, 0)");
        await db.sequelize.query("DBCC CHECKIDENT ('dbo.Usuario', RESEED, 0)");
    } catch (error) {
        console.error("Error limpiando la base de datos:", error);
    } finally {
        await db.sequelize.close();
    }
});

describe('Pruebas de gestión de usuarios', () => {

    test('Debe registrar un nuevo usuario', async () => {
        const res = await request(app)
            .post('/api/usuarios')
            .set('x-forwarded-for', '127.0.0.1')
            .send({
                Nombre: 'Prueba',
                Correo: `prueba${Date.now()}@mail.com`,
                Contrasena: 'contrasenaHash',
                Telefono: '123456789',
                Ciudad: 'Xalapa',
                EsAdmin: false,
                UbicacionUsuario:
                    {
                        Longitud: 4512.1567342894516,
                        Latitud: 2437.5134278461275,
                        Ciudad: 'Xalapa',
                        Estado: 'Veracruz',
                        Pais: 'Mexico'
                    }
            });

        console.log("Respuesta POST /api/usuarios: ", res.body)
        expect(res.statusCode).toBe(201);
    });
});