import cron from "node-cron";
import { updatePricesJob } from "../controllers/cryptoController.js";

// Corre cada 10 minutos
cron.schedule("*/60 * * * *", async () => {
  console.log("⏳ Actualizando precios...");
  try {
    await updatePricesJob();
    console.log("✅ Precios actualizados y guardados en BD");
  } catch (error) {
    console.error("❌ Error al actualizar precios en job:", error.message);
  }
});