const { conexionConReintentos, getDb } = require("../api/config/db");
const request = require("supertest");
const redis = require("../api/config/clienteRedis")
jest.setTimeout(60000);

let app;
let Usuario, Acceso, Ubicacion;
let db;
let token;
let usuario;

beforeAll(async () => {
  app = await require("./appTest");
  await conexionConReintentos();

  db = getDb();
  Usuario = db.Usuario;
  Acceso = db.Acceso;
  Ubicacion = db.Ubicacion;
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

  if (redis.options.database === 1) {
    await redis.flushDb();
  } else {
    throw new Error("Intento de limpiar Redis en base no destinada para pruebas");
  }

  await redis.quit()

  await new Promise(resolve => setTimeout(resolve, 1000));
});

describe('Pruebas de gestión de usuarios', () => {

  test('Debe registrar un nuevo usuario', async () => {
    const res = await request(app)
      .post('/api/usuarios')
      .set('x-forwarded-for', '127.0.0.1')
      .send({
        Nombre: 'Prueba',
        Telefono: '123456789',
        Ubicacion: {
          Longitud: -96.932527,
          Latitud: 19.541620,
          Ciudad: 'Xalapa',
          Estado: 'Veracruz',
          Pais: 'Mexico'
        },
        Acceso: {
          Correo: 'prueba@mail.com',
          ContrasenaHash: 'contrasenaHash',
          EsAdmin: false
        }
      });

    expect(res.statusCode).toBe(201);
  });

  test('No debe registrar por correo existente', async () => {
    const res = await request(app)
      .post('/api/usuarios')
      .set('x-forwarded-for', '127.0.0.1')
      .send({
        Nombre: 'Prueba',
        Telefono: '123456789',
        Ubicacion: {
          Longitud: -96.932527,
          Latitud: 19.541620,
          Ciudad: 'Xalapa',
          Estado: 'Veracruz',
          Pais: 'Mexico'
        },
        Acceso: {
          Correo: 'prueba@mail.com',
          ContrasenaHash: 'contrasenaHash',
          EsAdmin: false
        }
      });

    expect(res.statusCode).toBe(409);
  });

  test('No debe registrar por coordenadas nulas', async () => {
    const res = await request(app)
      .post('/api/usuarios')
      .set('x-forwarded-for', '127.0.0.1')
      .send({
        Nombre: 'Prueba',
        Telefono: '123456789',
        Ubicacion: {
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

    expect(res.statusCode).toBe(400);
  });

  test('No debe registrar por coordenadas fueras de rango', async () => {
    const res = await request(app)
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

    expect(res.statusCode).toBe(400);
  });

  test('Debe iniciar sesión exitosamente', async () => {
    const res = await request(app)
      .post('/api/acceso/iniciar-sesion')
      .set('x-forwarded-for', '127.0.0.1')
      .send({
        Correo: 'prueba@mail.com',
        ContrasenaHash: 'contrasenaHash',
      });

    token = res.body.token;
    usuario = res.body.usuario;
    expect(res.statusCode).toBe(200);
  });

  test('No debe iniciar sesión por correo incorrecto', async () => {
    const res = await request(app)
      .post('/api/acceso/iniciar-sesion')
      .set('x-forwarded-for', '127.0.0.1')
      .send({
        Correo: 'inexistente@mail.com',
        ContrasenaHash: 'contrasenaHash',
      });

    expect(res.statusCode).toBe(401);
  });

  test('No debe iniciar sesión por contraseña incorrecta', async () => {
    const res = await request(app)
      .post('/api/acceso/iniciar-sesion')
      .set('x-forwarded-for', '127.0.0.1')
      .send({
        Correo: 'prueba@mail.com',
        ContrasenaHash: 'contrasenaHashInvalida',
      });

    expect(res.statusCode).toBe(401);
  });

  test('Debe registrar la ubicación', async () => {
    const res = await request(app)
      .put(`/api/ubicaciones`)
      .set('x-forwarded-for', '127.0.0.1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        Longitud: -96.932527,
        Latitud: 19.541620,
        Ciudad: 'Xalapa',
        Estado: 'Veracruz',
        Pais: 'Mexico'
      });

    expect(res.statusCode).toBe(200);
  });

  test('No debe registrar la ubicación por un token inexistente', async () => {
    const res = await request(app)
      .put(`/api/ubicaciones`)
      .set('x-forwarded-for', '127.0.0.1')
      .send({
        Longitud: -96.932527,
        Latitud: 19.541620,
        Ciudad: 'Xalapa',
        Estado: 'Veracruz',
        Pais: 'Mexico'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Token no proporcionado');
  });

  test('No debe registrar la ubicación por un token inválido', async () => {
    const res = await request(app)
      .put(`/api/ubicaciones`)
      .set('x-forwarded-for', '127.0.0.1')
      .set('Authorization', `Bearer token.invalido.1212`)
      .send({
        Longitud: -96.932527,
        Latitud: 19.541620,
        Ciudad: 'Xalapa',
        Estado: 'Veracruz',
        Pais: 'Mexico'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Token inválido');
  });

  test('Debe actualizar los datos de usuario', async () => {
    const res = await request(app)
      .put(`/api/usuarios`)
      .set('x-forwarded-for', '127.0.0.1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        Nombre: 'Pedro',
        Telefono: '9876543210',
      });

    expect(res.statusCode).toBe(200);
  });

});
