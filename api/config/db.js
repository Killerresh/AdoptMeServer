const { Sequelize } = require("sequelize");
const path = require("path");
const initModels = require("../models");

let sequelize;
let db;

function obtenerSequelize() {
  const esPrueba = (process.env.NODE_ENV || "").trim() === "test";

  return new Sequelize(
    esPrueba ? process.env.DB_PRUEBA_NAME : process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: process.env.DB_DIALECT,
      dialectOptions: {
        options: {
          encrypt: true,
          trustServerCertificate: true
        }
      },
      logging: console.log
    }
  );
}

async function conexionConReintentos(intentos = 20, espera = 15000) {
  let conectado = false;
  let intentosRestantes = intentos;

  sequelize = obtenerSequelize();

  while (!conectado && intentosRestantes > 0) {
    try {
      await sequelize.authenticate();
      console.log("Conexión a SQL Server establecida correctamente.");
      conectado = true;
    } catch (error) {
      intentosRestantes--;
      console.error(`Error al conectar con la base de datos (${intentos - intentosRestantes} intento): `, error.message);
      if (intentosRestantes > 0) {
        console.log(`Reintentando en ${espera / 1000} segundos...`);
        await new Promise(resolve => setTimeout(resolve, espera));
      } else {
        throw new Error("No se pudo establecer conexión con la base de datos después de múltiples intentos.");
      }
    }
  }

  db = initModels(sequelize);

  return db;
}

function getDb() {
  if (!sequelize || !db) {
    throw new Error("Sequelize no ha sido inicializado. Llama a conexionConReintentos() primero.");
  }
  return db;
}

module.exports = {
  obtenerSequelize,
  conexionConReintentos,
  getDb
};
