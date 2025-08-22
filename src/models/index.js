const { Sequelize } = require("sequelize");
const createDatabaseIfNotExists = require("../config/database");
require('dotenv').config();

// Importar modelos
const Cryptocurrency = require("./cryptocurrency.js");
const Price = require("./price.js");

// Leer la URL de conexión (recomendada en producción)
const DB_URL = process.env.DB_URL;

// Alternativamente, datos individuales (útiles en desarrollo local)
const DB_NAME = process.env.DB_NAME || "crypto_investment";
const DB_USER = process.env.DB_USER || "root";
const DB_PORT = process.env.DB_PORT || 3306; // Puerto por defecto de MySQL
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_HOST = process.env.DB_HOST || "localhost";

// Variable global para almacenar la instancia de la base de datos
let dbInstance = null;

async function initializeDatabase() {
  let sequelize;

  if (DB_URL) {
    // Producción o conexión directa con URL
    sequelize = new Sequelize(DB_URL, {
      dialect: "mysql",
      dialectOptions: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
      logging: false,
    });
  } else {

    // Desarrollo local: crear base de datos si no existe
    await createDatabaseIfNotExists();

    // Desarrollo local
    sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
      host: DB_HOST,
      dialect: "mysql",
      port: DB_PORT,
      logging: false,
    });
  }

  try {
    await sequelize.authenticate();
    console.log("✅ Conectado a la base de datos con Sequelize.");
  } catch (error) {
    console.error("❌ No se pudo conectar a la base de datos:", error);
    process.exit(1);
  }

  // Inicializar los modelos
  Cryptocurrency.init(sequelize);
  Price.init(sequelize);

  // Crear objeto de modelos
  const models = {
    Cryptocurrency,
    Price,
    sequelize
  };

  // Asociaciones de modelos
  Object.values(models).forEach((model) => {
    if (model.associate) model.associate(models);
  });

  // Sincronizar tablas
  await sequelize.sync({ force: false });
  console.log("📂 Tablas sincronizadas con la base de datos.");

  //Guardar la instancia globalmente
  dbInstance = {
    sequelize,
    ...models
  };

  return dbInstance;
}

// Función para obtener la instancia de la base de datos inicializada
function getDB() {
  if (!dbInstance) {
    throw new Error("❌ Base de datos no inicializada. Asegúrate de llamar a initializeDatabase() primero.");
  }
  return dbInstance;
}

// Función para obtener solo los modelos (sin sequelize)
function getModels() {
  const db = getDB();
  const { sequelize, ...models } = db;
  return models;
}

// Función para obtener solo sequelize
function getSequelize() {
  const db = getDB();
  return db.sequelize;
}

module.exports = {
  initializeDatabase,
  getDB,
  getModels,
  getSequelize
};