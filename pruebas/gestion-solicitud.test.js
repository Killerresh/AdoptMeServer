const { conexionConReintentos, getDb } = require("../api/config/db");
const request = require("supertest");
const redis = require("../api/config/clienteRedis");

jest.setTimeout(60000);

let app;
let db;
let Usuario, Adopcion, Solicitud;
let token;
let adopcionID;
let solicitudID;

beforeAll(async () => {
  app = await require("./appTest");
  await conexionConReintentos();

  db = getDb();
  Usuario = db.Usuario;
  Adopcion = db.Adopcion;
  Solicitud = db.Solicitud;

  // Crear usuario adoptante
  await request(app)
    .post('/api/usuarios')
    .set('x-forwarded-for', '127.0.0.1')
    .send({
      Nombre: 'AdoptanteTest',
      Telefono: '123456789',
      Ubicacion: {
        Longitud: -99.1332,
        Latitud: 19.4326,
        Ciudad: 'CDMX',
        Estado: 'CDMX',
        Pais: 'México'
      },
      Acceso: {
        Correo: 'adoptante@test.com',
        ContrasenaHash: '12345678',
        EsAdmin: false
      }
    });

  const login = await request(app)
    .post('/api/acceso/iniciar-sesion')
    .set('x-forwarded-for', '127.0.0.1')
    .send({
      Correo: 'adoptante@test.com',
      ContrasenaHash: '12345678'
    });

  token = login.body.token;

  // Crear usuario publicador
  const usuarioPublicador = await Usuario.create({
    Nombre: 'PublicadorTest',
    Telefono: '987654321',
    UbicacionID: 1,
    Correo: 'publicador@test.com',
    ContrasenaHash: '12345678'
  });

  // Crear adopción
  const adopcion = await Adopcion.create({
    PublicadorID: usuarioPublicador.UsuarioID,
    Estado: false
  });

  adopcionID = adopcion.AdopcionID;
});

afterAll(async () => {
  await Solicitud.destroy({ where: {}, cascade: true });
  await Adopcion.destroy({ where: {}, cascade: true });
  await Usuario.destroy({ where: {}, cascade: true });

  await db.sequelize.query("DBCC CHECKIDENT ('dbo.Solicitud', RESEED, 0)");
  await db.sequelize.query("DBCC CHECKIDENT ('dbo.Adopcion', RESEED, 0)");
  await db.sequelize.query("DBCC CHECKIDENT ('dbo.Usuario', RESEED, 0)");

  await redis.flushDb();
  await redis.quit();
  await db.sequelize.close();
});

describe('Pruebas de solicitudes', () => {
  test('Debe registrar una nueva solicitud de adopción', async () => {
    const res = await request(app)
      .post('/api/solicitudes')
      .set('Authorization', `Bearer ${token}`)
      .set('x-forwarded-for', '127.0.0.1')
      .send({ AdopcionID: adopcionID });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('solicitud');
    solicitudID = res.body.solicitud.SolicitudID;
  });

  test('Debe fallar si se intenta registrar la misma solicitud otra vez', async () => {
    const res = await request(app)
      .post('/api/solicitudes')
      .set('Authorization', `Bearer ${token}`)
      .set('x-forwarded-for', '127.0.0.1')
      .send({ AdopcionID: adopcionID });

    expect(res.statusCode).toBe(409);
    expect(res.body).toHaveProperty('error');
  });

  test('Debe retornar error 400 si AdopcionID es inválido', async () => {
    const res = await request(app)
      .post('/api/solicitudes')
      .set('Authorization', `Bearer ${token}`)
      .set('x-forwarded-for', '127.0.0.1')
      .send({ AdopcionID: 'abc' });

    expect(res.statusCode).toBe(400);
  });

  test('Debe obtener solicitudes con nombres por AdopcionID', async () => {
    const res = await request(app)
      .get(`/api/solicitudes/por-adopcion/${adopcionID}`)
      .set('x-forwarded-for', '127.0.0.1');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('NombreAdoptante');
  });

  test('Debe retornar 400 si AdopcionID es inválido en consulta', async () => {
    const res = await request(app)
      .get('/api/solicitudes/por-adopcion/abc')
      .set('x-forwarded-for', '127.0.0.1');

    expect(res.statusCode).toBe(400);
  });

  test('Debe retornar 404 si no hay solicitudes para esa adopción', async () => {
    const res = await request(app)
      .get('/api/solicitudes/por-adopcion/999999')
      .set('x-forwarded-for', '127.0.0.1');

    expect(res.statusCode).toBe(404);
  });

  test('Debe eliminar la solicitud registrada', async () => {
    const res = await request(app)
      .delete(`/api/solicitudes/${solicitudID}`)
      .set('x-forwarded-for', '127.0.0.1');

    expect(res.statusCode).toBe(200);
    expect(res.body.mensaje).toMatch(/eliminada exitosamente/i);
  });

  test('Debe retornar 404 al intentar eliminar una solicitud inexistente', async () => {
    const res = await request(app)
      .delete('/api/solicitudes/9999999')
      .set('x-forwarded-for', '127.0.0.1');

    expect(res.statusCode).toBe(404);
  });

  test('Debe retornar 400 si el ID a eliminar no es válido', async () => {
    const res = await request(app)
      .delete('/api/solicitudes/abc')
      .set('x-forwarded-for', '127.0.0.1');

    expect(res.statusCode).toBe(400);
  });
});
