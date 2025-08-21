import axios from "axios";
import dotenv from "dotenv";
import initializeDatabase from "../models/index.js";
import { Op } from "sequelize";

dotenv.config();

const CMC_API_KEY = process.env.COINMARKETCAP_API_KEY;
const CMC_BASE_URL = process.env.COINMARKETCAP_BASE_URL;
const COINGECKO_BASE_URL = process.env.COINGECKO_BASE_URL;

let Cryptocurrency, Price;

// Inicializa los modelos al arrancar el servidor
initializeDatabase().then(db => {
    Cryptocurrency = db.Cryptocurrency;
    Price = db.Price;
});

// ================================
// Función para actualizar y guardar precios en BD
// ================================
export const updatePricesJob = async () => {
    try {
        const response = await axios.get(
            `${CMC_BASE_URL}/cryptocurrency/listings/latest`,
            {
                headers: { "X-CMC_PRO_API_KEY": CMC_API_KEY },
                params: { start: 1, limit: 20, convert: "USD" },
            }
        );

        const updatedPrices = response.data.data;

        for (const crypto of updatedPrices) {
            // Guarda o actualiza la criptomoneda
            const [cryptoRecord] = await Cryptocurrency.findOrCreate({
                where: { symbol: crypto.symbol },
                defaults: {
                    name: crypto.name,
                    slug: crypto.slug,
                },
            });

            // Guarda el precio, asignando el cryptocurrencyId
            await Price.create({
                price_usd: crypto.quote.USD.price,
                volume_24h: crypto.quote.USD.volume_24h,
                percent_change_24h: crypto.quote.USD.percent_change_24h,
                date_time: new Date(),
                cryptocurrencyId: cryptoRecord.id,
            });
        }

        return { message: "Precios actualizados", data: updatedPrices };
    } catch (error) {
        console.error("❌ Error en updatePricesJob:", error.message);
        throw error;
    }
};

// ================================
// POST /cryptos/update → Actualizar precios y guardar en BD
// ================================
export const updatePrices = async (req, res) => {
    try {
        if (!Price || !Cryptocurrency) {
            return res.status(500).json({ error: "Modelos no inicializados" });
        }
        const result = await updatePricesJob();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar precios" });
    }
};

// ================================
// GET /cryptos → Obtener lista de criptos (desde API externa)
// ================================
export const getCryptos = async (req, res) => {
    try {
        const response = await axios.get(
            `${CMC_BASE_URL}/cryptocurrency/listings/latest`,
            {
                headers: { "X-CMC_PRO_API_KEY": CMC_API_KEY },
                params: { start: 1, limit: 50, convert: "USD" },
            }
        );

        res.json(response.data.data);
    } catch (error) {
        console.error("❌ Error en getCryptos:", error.message);
        res.status(500).json({ error: "Error al obtener lista de criptos" });
    }
};

// ================================
// GET /cryptos/:symbol → Detalle de una cripto
// ================================
export const getCryptoDetail = async (req, res) => {
    try {
        const { symbol } = req.params;

        const response = await axios.get(
            `${CMC_BASE_URL}/cryptocurrency/quotes/latest`,
            {
                headers: { "X-CMC_PRO_API_KEY": CMC_API_KEY },
                params: { symbol },
            }
        );

        res.json(response.data.data[symbol]);
    } catch (error) {
        console.error("❌ Error en getCryptoDetail:", error.message);
        res.status(500).json({ error: "Error al obtener detalles de la cripto" });
    }
};

// ================================
// GET /cryptos/history/:id → Históricos CoinGecko
// ================================
export const getCryptoHistory = async (req, res) => {
    try {
        const { id } = req.params; // Ejemplo: "bitcoin"
        const { from, to } = req.query; // timestamps UNIX

        const response = await axios.get(
            `${COINGECKO_BASE_URL}/coins/${id}/market_chart/range`,
            {
                params: { vs_currency: "usd", from, to },
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error("❌ Error en getCryptoHistory:", error.message);
        res.status(500).json({ error: "Error al obtener históricos de la cripto" });
    }
};

// ================================
// GET /cryptos/history-db/:symbol → Históricos desde BD
// ================================
export const getCryptoHistoryDB = async (req, res) => {
    try {
        if (!Price || !Cryptocurrency) {
            return res.status(500).json({ error: "Modelos no inicializados" });
        }
        const { symbol } = req.params;
        const { from, to } = req.query;

        // Busca la criptomoneda por símbolo
        const crypto = await Cryptocurrency.findOne({ where: { symbol } });
        if (!crypto) {
            return res.status(404).json({ error: "Criptomoneda no encontrada" });
        }

        // Construye el filtro de fechas
        const where = { cryptocurrencyId: crypto.id };
        if (from && to) {
            where.date_time = { [Op.between]: [new Date(from), new Date(to)] };
        } else if (from) {
            where.date_time = { [Op.gte]: new Date(from) };
        } else if (to) {
            where.date_time = { [Op.lte]: new Date(to) };
        }

        const prices = await Price.findAll({
            where,
            order: [["date_time", "ASC"]],
        });

        res.json(prices);
    } catch (error) {
        console.error("❌ Error en getCryptoHistoryDB:", error.message);
        res
            .status(500)
            .json({ error: "Error al consultar históricos en la base de datos" });
    }
};

// GET /cryptos/random → 4 criptomonedas aleatorias con su último precio y percent_change_24h
export const getRandomCryptocurrencies = async (req, res) => {
    try {
        const cryptos = await global.Cryptocurrency.findAll();

        if (cryptos.length < 4) {
            return res.status(400).json({ error: "No hay suficientes criptomonedas en la base de datos" });
        }

        // Selecciona 4 aleatorias
        const shuffled = cryptos.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 4);

        // Para cada cripto, busca el último registro de precio
        const result = [];
        for (const crypto of selected) {
            const lastPrice = await global.Price.findOne({
                where: { cryptocurrencyId: crypto.id },
                order: [["date_time", "DESC"]],
            });

            result.push({
                id: crypto.id,
                name: crypto.name,
                symbol: crypto.symbol,
                slug: crypto.slug,
                last_price: lastPrice ? lastPrice.price_usd : null,
                percent_change_24h: lastPrice ? lastPrice.percent_change_24h : null,
            });
        }

        res.json(result);
    } catch (error) {
        console.error("❌ Error en getRandomCryptocurrencies:", error.message);
        res.status(500).json({ error: "Error al obtener criptomonedas aleatorias" });
    }
};

// GET crypto por ID ultimo registro de prices en bd
export const getCryptocurrencyById = async (req, res) => {
  try {
    const { id } = req.params;

    const cryptocurrency = await Cryptocurrency.findByPk(id, {
      include: [
        {
          model: Price,
          as: "prices",
          order: [["date_time", "DESC"]],
          limit: 1, // Solo el último registro de precios
        },
      ],
    });

    if (!cryptocurrency) {
      return res.status(404).json({ message: "Cryptocurrency not found" });
    }

    res.json(cryptocurrency);
  } catch (error) {
    console.error("Error fetching cryptocurrency:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Obtener todas las criptomonedas
export const getAllCryptocurrencies = async (req, res) => {
  try {
    const cryptocurrencies = await Cryptocurrency.findAll();

    if (!cryptocurrencies || cryptocurrencies.length === 0) {
      return res.status(404).json({ message: "No cryptocurrencies found" });
    }

    res.json(cryptocurrencies);
  } catch (error) {
    console.error("Error fetching cryptocurrencies:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};