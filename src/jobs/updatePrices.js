const cron = require('node-cron');
const { updatePricesJob } = require("../controllers/cryptoController");

// Corre cada 10 minutos
cron.schedule("*/10 * * * *", async () => {
  console.log("⏳ Actualizando precios...");
  try {
    await updatePricesJob();
    console.log("✅ Precios actualizados y guardados en BD");
  } catch (error) {
    console.error("❌ Error al actualizar precios en job:", error.message);
  }
});