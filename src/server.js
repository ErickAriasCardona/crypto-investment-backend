import express from "express";
import dotenv from "dotenv";
import cors from "cors"; // <-- Importa cors
import initializeDatabase from "./models/index.js";
import cryptoRoutes from "./routes/cryptoRoutes.js";
import { updatePricesJob } from "./controllers/cryptoController.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configura CORS para permitir tu frontend
app.use(cors({
  origin: "http://localhost:5173", // Permite solo tu frontend
  credentials: true
}));

app.use(express.json());

initializeDatabase().then(async db => {
  global.Cryptocurrency = db.Cryptocurrency;
  global.Price = db.Price;

  await updatePricesJob();
  console.log("🚀 Precios iniciales actualizados y guardados en BD");

  import("./jobs/updatePrices.js");

  app.use("/cryptos", cryptoRoutes);

  app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  });
});