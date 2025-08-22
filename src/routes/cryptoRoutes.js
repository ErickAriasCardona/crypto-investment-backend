const express = require("express");
const { getCryptos, getGainers, getLosers, getAllCryptocurrencies, getCryptocurrencyById, getRandomCryptocurrencies, getCryptoHistoryDB, getCryptoDetail, updatePrices, getCryptoHistory } = require("../controllers/cryptoController");;

const router = express.Router();

router.get("/AllCryptocurrencies", getAllCryptocurrencies);
router.get('/gainers', getGainers);
router.get('/losers', getLosers);
router.get("/", getCryptos);
router.get("/random", getRandomCryptocurrencies);
router.get("/:symbol", getCryptoDetail);
router.post("/update", updatePrices);
router.get("/history/:id", getCryptoHistory);
router.get("/history-db/:symbol", getCryptoHistoryDB);
router.get("/cryptocurrencies/:id", getCryptocurrencyById);


module.exports = router;  