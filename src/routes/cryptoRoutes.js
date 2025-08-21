import express from "express";
import { getCryptos,getAllCryptocurrencies, getCryptocurrencyById, getRandomCryptocurrencies, getCryptoHistoryDB, getCryptoDetail, updatePrices, getCryptoHistory } from "../controllers/cryptoController.js";

const router = express.Router();

router.get("/", getCryptos);
router.get("/random", getRandomCryptocurrencies);
router.get("/:symbol", getCryptoDetail);
router.post("/update", updatePrices);
router.get("/history/:id", getCryptoHistory);
router.get("/history-db/:symbol", getCryptoHistoryDB);
router.get("/cryptocurrencies/:id", getCryptocurrencyById);
router.get("/cryptocurrencies", getAllCryptocurrencies);



export default router;
