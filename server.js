require('dotenv').config();
const express = require("express");
const cors = require("cors");
const { initializeDatabase } = require("./src/models/index"); // ✅ Destructuring
const cryptoRoutes = require("./src/routes/cryptoRoutes");
const { updatePricesJob } = require("./src/controllers/cryptoController");
require("./src/jobs/updatePrices");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

app.use("/cryptos", cryptoRoutes);

async function startServer() {
  try {
    // ✅ Inicializar base de datos y guardar modelos globalmente
    const db = await initializeDatabase();
    
    // ✅ Hacer los modelos disponibles globalmente (opcional)
    global.db = db;

    console.log("⏳ Actualizando precios iniciales...");
    await updatePricesJob();
    console.log("✅ Precios iniciales actualizados y guardados en BD");

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
    });

  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
    process.exit(1);
  }
}

startServer();