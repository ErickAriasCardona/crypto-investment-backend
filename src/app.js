import express from "express";
import cors from "cors";
import cryptoRoutes from "./routes/cryptoRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use("/cryptos", cryptoRoutes);

export default app;
