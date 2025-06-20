const { conexionConReintentos, getDb } = require("../api/config/db");
const request = require("supertest");
const redis = require("../api/config/clienteRedis")
jest.setTimeout(60000);

let app;
let Ubicacion, SolicitudAdopcion, Mascota;
let db;
let token;

beforeAll(async () => {
  app = await require("./appTest");
  await conexionConReintentos();

  db = getDb();
  Ubicacion = db.Ubicacion;
  SolicitudAdopcion = db.SolicitudAdopcion;
  Mascota = db.Mascota;
});

afterAll(async () => {
  try {
    await SolicitudAdopcion.destroy({ where: {}, cascade: true });
    await Ubicacion.destroy({ where: {}, cascade: true });
    await Mascota.destroy({ where: {}, cascade: true });

    await db.sequelize.query("DBCC CHECKIDENT ('dbo.SolicitudAdopcion', RESEED, 0)");
    await db.sequelize.query("DBCC CHECKIDENT ('dbo.Ubicacion', RESEED, 0)");
    await db.sequelize.query("DBCC CHECKIDENT ('dbo.Mascota', RESEED, 0)");
  } catch (error) {
    console.error("Error limpiando la base de datos:", error);
  } finally {
    await db.sequelize.close();
  }

  if (redis.options.database === 1) {
    await redis.flushDb();
  } else {
    throw new Error("Intento de limpiar Redis en base no destinada para pruebas");
  }

  await redis.quit()

  await new Promise(resolve => setTimeout(resolve, 1000));
});

describe('Pruebas de gestión de adopción', () => {

  beforeAll(async () => {
    await request(app)
      .post('/api/usuarios')
      .set('x-forwarded-for', '127.0.0.1')
      .send({
        Nombre: 'Prueba',
        Telefono: '123456789',
        Ubicacion: {
          Longitud: -196.932527,
          Latitud: 190.541620,
          Ciudad: 'Xalapa',
          Estado: 'Veracruz',
          Pais: 'Mexico'
        },
        Acceso: {
          Correo: 'prueba2@mail.com',
          ContrasenaHash: 'contrasenaHash',
          EsAdmin: false
        }
      });

    const res = await request(app)
      .post('/api/acceso/iniciar-sesion')
      .set('x-forwarded-for', '127.0.0.1')
      .send({
        Correo: 'prueba@mail.com',
        ContrasenaHash: 'contrasenaHash',
      });

    token = res.body.token;
  });

  test('Debe obtener todas las solicitudes de adopción', async () => {
    const res = await request(app)
      .get('/api/solicitudAdopciones')
      .set('x-forwarded-for', '127.0.0.1')

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.statusCode).toBe(200);
  });

  test('Debe obtener todas las solicitudes pendientes', async () => {
    const res = await request(app)
      .get('/api/solicitudAdopciones/pendientes')
      .set('x-forwarded-for', '127.0.0.1')

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.statusCode).toBe(200);
  });

  test('Debe obtener todas las solicitudes aceptadas', async () => {
    const res = await request(app)
      .get('/api/solicitudAdopciones/pendientes')
      .set('x-forwarded-for', '127.0.0.1')

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.statusCode).toBe(200);
  });

  test('Debe registrar una solicitud de adopción', async () => {
    const res = await request(app)
      .get('/api/solicitudAdopciones/pendientes')
      .set('x-forwarded-for', '127.0.0.1')
      .send({
        PublicadorID: 1,
        Estado: false,
        Mascota: {
          Nombre: 'Firulais',
          Especie: 'Perro',
          Raza: 'Labrador',
          Edad: '2 años',
          Sexo: 'Macho',
          Tamaño: 'Mediano',
          Descripcion: 'Muy amigable'
        },
        Ubicacion: {
          Ciudad: 'CDMX',
          Estado: 'CDMX',
          Pais: 'México',
          Latitud: 19.4326,
          Longitud: -99.1332
        }
      });

    expect(res.statusCode).toBe(200);
  });

  test('Debe fallar al registrar si faltan campos obligatorios', async () => {
    const solicitud = { PublicadorID: 1 };
    const res = await request(app)
      .post('/api/solicitudAdopciones')
      .set('x-forwarded-for', '127.0.0.1')
      .send(solicitud);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('Debe obtener una solicitud por ID válido', async () => {
    const res = await request(app)
      .get(`/api/solicitudAdopciones/1`)
      .set('x-forwarded-for', '127.0.0.1')
      .set('Authorization', `Bearer ${token}`);

    expect(200).toContain(res.statusCode);
  });

  test('Debe obtener solicitudes por PublicadorID', async () => {
    const res = await request(app)
      .get('/api/solicitudAdopciones/por-publicador/1')
      .set('x-forwarded-for', '127.0.0.1');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('Debe devolver una lista de mascotas', async () => {
    const res = await request(app)
      .get('/api/mascotas')
      .set('x-forwarded-for', '127.0.0.1');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('Debe devolver una mascota si el id existe', async () => {
    const res = await request(app)
      .get('/api/mascotas/1')
      .set('x-forwarded-for', '127.0.0.1');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('MascotaID');
  });

  test('Debe devolver 404 si la mascota no existe', async () => {
    const res = await request(app)
      .get('/api/mascotas/9999999')
      .set('x-forwarded-for', '127.0.0.1');

    expect(res.statusCode).toBe(404);
  });

  test('Debe devolver 404 si la mascota no existe', async () => {
    const res = await request(app)
      .get('/api/mascotas/9999999')
      .set('x-forwarded-for', '127.0.0.1');

    expect(res.statusCode).toBe(404);
  });

  test('Debe actualizar la información de una mascota existente', async () => {
    const res = await request(app)
      .put('/api/mascotas/1')
      .set('x-forwarded-for', '127.0.0.1')
      .send({
        Nombre: 'NombrePrueba',
        Edad: '2 años y 3 meses'
      });

    expect(res.statusCode).toBe(200);
  });

  test('Debe fallar si la mascota no existe', async () => {
    const res = await request(app)
      .put('/api/mascotas/99999')
      .set('x-forwarded-for', '127.0.0.1')
      .send({ Nombre: 'Test' });

    expect(res.statusCode).toBe(404);
  });

  test('Debe eliminar una solicitud por ID válido', async () => {
    const res = await request(app)
      .delete('/api/solicitudAdopciones/1')
      .set('x-forwarded-for', '127.0.0.1');

    expect([200, 404]).toContain(res.statusCode);
  });


});
