import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import createDatabaseIfNotExists from "../config/database.js";
import Cryptocurrency from "./cryptocurrency.js";
import Price from "./price.js";

// Cargar variables de entorno
dotenv.config();

// Leer la URL de conexión (recomendada en producción)
const DB_URL = process.env.DB_URL;

// Alternativamente, datos individuales (útiles en desarrollo local)
const DB_NAME = process.env.DB_NAME || "formacion_complementaria";
const DB_USER = process.env.DB_USER || "root";
const DB_PORT = process.env.DB_PORT || 3306; // Puerto por defecto de MySQL
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_HOST = process.env.DB_HOST || "localhost";

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

  // Inicializar los modelos...
  Cryptocurrency.initModel(sequelize);
  Price.initModel(sequelize);

  Cryptocurrency.associate({ Price });
  Price.associate({ Cryptocurrency });

  // Colección de modelos
  const models = {
    Cryptocurrency,
    Price
  };


  // Sincronizar tablas
  await sequelize.sync({ force: false });
  console.log("📂 Tablas sincronizadas con la base de datos.");

  return {
    sequelize,
    ...models
  };
}

export default initializeDatabase;
