const { conexionConReintentos, getDb } = require("../api/config/db");
const request = require("supertest");
const redis = require("../api/config/clienteRedis");

jest.setTimeout(60000);

let app;
let db;
let Usuario, Chat;
let usuario1, usuario2;
let token;

beforeAll(async () => {
  app = await require("./appTest");
  await conexionConReintentos();

  db = getDb();
  Usuario = db.Usuario;
  Chat = db.Chat;

  // Crear usuario 1
  await request(app)
    .post('/api/usuarios')
    .set('x-forwarded-for', '127.0.0.1')
    .send({
      Nombre: 'Usuario1',
      Telefono: '1111111111',
      Ubicacion: {
        Longitud: -99.1,
        Latitud: 19.4,
        Ciudad: 'CDMX',
        Estado: 'CDMX',
        Pais: 'México'
      },
      Acceso: {
        Correo: 'usuario1@test.com',
        ContrasenaHash: '123456',
        EsAdmin: false
      }
    });

  // Crear usuario 2
  await request(app)
    .post('/api/usuarios')
    .set('x-forwarded-for', '127.0.0.1')
    .send({
      Nombre: 'Usuario2',
      Telefono: '2222222222',
      Ubicacion: {
        Longitud: -99.2,
        Latitud: 19.5,
        Ciudad: 'CDMX',
        Estado: 'CDMX',
        Pais: 'México'
      },
      Acceso: {
        Correo: 'usuario2@test.com',
        ContrasenaHash: '123456',
        EsAdmin: false
      }
    });

  // Login de usuario1
  const login = await request(app)
    .post('/api/acceso/iniciar-sesion')
    .set('x-forwarded-for', '127.0.0.1')
    .send({
      Correo: 'usuario1@test.com',
      ContrasenaHash: '123456'
    });

  token = login.body.token;

  // Obtener usuarios desde la BD
  usuario1 = await Usuario.findOne({ where: { Correo: 'usuario1@test.com' } });
  usuario2 = await Usuario.findOne({ where: { Correo: 'usuario2@test.com' } });

  // Enviar mensaje previo para pruebas
  await Chat.create({
    RemitenteID: usuario1.UsuarioID,
    DestinatarioID: usuario2.UsuarioID,
    Contenido: 'Hola desde pruebas'
  });
});

afterAll(async () => {
  await Chat.destroy({ where: {}, cascade: true });
  await Usuario.destroy({ where: {}, cascade: true });

  await db.sequelize.query("DBCC CHECKIDENT ('dbo.Chat', RESEED, 0)");
  await db.sequelize.query("DBCC CHECKIDENT ('dbo.Usuario', RESEED, 0)");

  await redis.flushDb();
  await redis.quit();
  await db.sequelize.close();
});

describe('Pruebas de Chat', () => {
  test('Debe enviar un mensaje correctamente', async () => {
    const res = await request(app)
      .post('/api/chat')
      .set('x-forwarded-for', '127.0.0.1')
      .send({
        RemitenteID: usuario1.UsuarioID,
        DestinatarioID: usuario2.UsuarioID,
        Contenido: 'Mensaje nuevo'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('mensajeEnviado');
  });

  test('Debe fallar si faltan datos para enviar mensaje', async () => {
    const res = await request(app)
      .post('/api/chat')
      .set('x-forwarded-for', '127.0.0.1')
      .send({
        RemitenteID: usuario1.UsuarioID,
        Contenido: 'Mensaje sin destinatario'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('Debe obtener mensajes entre dos usuarios', async () => {
    const res = await request(app)
      .get(`/api/chat/${usuario1.UsuarioID}/${usuario2.UsuarioID}`)
      .set('x-forwarded-for', '127.0.0.1');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('Debe retornar 400 si los IDs son inválidos en obtener mensajes', async () => {
    const res = await request(app)
      .get(`/api/chat/abc/def`)
      .set('x-forwarded-for', '127.0.0.1');

    expect(res.statusCode).toBe(400);
  });

  test('Debe retornar 400 si el ID del usuario es inválido al obtener lista de chats', async () => {
    const res = await request(app)
      .get('/api/chat/usuario/abc')
      .set('x-forwarded-for', '127.0.0.1');

    expect(res.statusCode).toBe(400);
  });
});
