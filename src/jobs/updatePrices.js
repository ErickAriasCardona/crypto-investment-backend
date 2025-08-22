const cron = require('node-cron');
const {updatePricesJob} = require( "../controllers/cryptoController");

// Corre cada 60 minutos
cron.schedule("*/1 * * * *", async () => {
  console.log("⏳ Actualizando precios...");
  try {
    await updatePricesJob();
    console.log("✅ Precios actualizados y guardados en BD");
  } catch (error) {
    console.error("❌ Error al actualizar precios en job:", error.message);
  }
});