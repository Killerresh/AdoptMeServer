const { conexionConReintentos, getDb } = require("../api/config/db");
const request = require("supertest");
const redis = require("../api/config/clienteRedis");
jest.setTimeout(60000);

let app;
let db;
let Mascota, FotoMascota, VideoMascota;
let token;

beforeAll(async () => {
  app = await require("./appTest");
  await conexionConReintentos();
  db = getDb();

  Mascota = db.Mascota;
  FotoMascota = db.FotoMascota;
  VideoMascota = db.VideoMascota;

  // Crear usuario y obtener token
  await request(app)
    .post('/api/usuarios')
    .set('x-forwarded-for', '127.0.0.1')
    .send({
      Nombre: 'PruebaMascota',
      Telefono: '123456789',
      Ubicacion: {
        Longitud: -99.1332,
        Latitud: 19.4326,
        Ciudad: 'CDMX',
        Estado: 'CDMX',
        Pais: 'México'
      },
      Acceso: {
        Correo: 'mascota@mail.com',
        ContrasenaHash: '12345678',
        EsAdmin: false
      }
    });

  const res = await request(app)
    .post('/api/acceso/iniciar-sesion')
    .set('x-forwarded-for', '127.0.0.1')
    .send({
      Correo: 'mascota@mail.com',
      ContrasenaHash: '12345678',
    });

  token = res.body.token;
});

afterAll(async () => {
  await FotoMascota.destroy({ where: {}, cascade: true });
  await VideoMascota.destroy({ where: {}, cascade: true });
  await Mascota.destroy({ where: {}, cascade: true });

  await db.sequelize.query("DBCC CHECKIDENT ('dbo.Mascota', RESEED, 0)");
  await redis.flushDb();
  await redis.quit();
  await db.sequelize.close();

  await new Promise(resolve => setTimeout(resolve, 1000));
});

describe('Pruebas de gestión de mascotas', () => {
  let mascotaID;

  test('Debe crear una mascota de prueba', async () => {
    const mascota = await Mascota.create({
      Nombre: 'Firulais',
      Especie: 'Perro',
      Raza: 'Labrador',
      Edad: '2 años',
      Sexo: 'Macho',
      Tamaño: 'Grande',
      Descripcion: 'Amigable'
    });

    mascotaID = mascota.MascotaID;
    expect(mascotaID).toBeDefined();
  });

  test('Debe obtener todas las mascotas', async () => {
    const res = await request(app)
      .get('/api/mascotas')
      .set('x-forwarded-for', '127.0.0.1');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('Debe obtener una mascota por ID', async () => {
    const res = await request(app)
      .get(`/api/mascotas/${mascotaID}`)
      .set('x-forwarded-for', '127.0.0.1');

    expect(res.statusCode).toBe(200);
    expect(res.body.MascotaID).toBe(mascotaID);
  });

  test('Debe retornar 404 si la mascota no existe', async () => {
    const res = await request(app)
      .get('/api/mascotas/999999')
      .set('x-forwarded-for', '127.0.0.1');

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('Debe modificar una mascota existente', async () => {
    const res = await request(app)
      .put(`/api/mascotas/${mascotaID}`)
      .set('x-forwarded-for', '127.0.0.1')
      .send({ Nombre: 'NombreActualizado' });

    expect(res.statusCode).toBe(200);
    expect(res.body.mascota.Nombre).toBe('NombreActualizado');
  });

  test('Debe retornar 404 al modificar mascota inexistente', async () => {
    const res = await request(app)
      .put('/api/mascotas/999999')
      .set('x-forwarded-for', '127.0.0.1')
      .send({ Nombre: 'Fantasma' });

    expect(res.statusCode).toBe(404);
  });

  test('Debe retornar 401 si no hay token en foto', async () => {
    const res = await request(app)
      .get(`/api/mascotas/${mascotaID}/foto`)
      .set('x-forwarded-for', '127.0.0.1');

    expect(res.statusCode).toBe(401);
  });

  test('Debe retornar 404 si no existe foto en BD', async () => {
    const res = await request(app)
      .get(`/api/mascotas/${mascotaID}/foto`)
      .set('x-forwarded-for', '127.0.0.1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toMatch(/foto/);
  });

  test('Debe retornar 404 si no existe video en BD', async () => {
    const res = await request(app)
      .get(`/api/mascotas/${mascotaID}/video`)
      .set('x-forwarded-for', '127.0.0.1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toMatch(/video/);
  });

  test('Debe retornar 400 si ID no es numérico en foto', async () => {
    const res = await request(app)
      .get('/api/mascotas/abc/foto')
      .set('x-forwarded-for', '127.0.0.1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
  });

  test('Debe retornar 400 si ID no es numérico en video', async () => {
    const res = await request(app)
      .get('/api/mascotas/abc/video')
      .set('x-forwarded-for', '127.0.0.1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
  });
});
