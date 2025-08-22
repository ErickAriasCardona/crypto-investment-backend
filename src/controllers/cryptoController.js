const Cryptocurrency = require("../models/cryptocurrency")
const Price = require("../models/price")
const { Op } = require("sequelize");
const axios = require("axios");

const { getModels } = require('../models/index');

const CMC_API_KEY = process.env.COINMARKETCAP_API_KEY;
const CMC_BASE_URL = process.env.COINMARKETCAP_BASE_URL;
const COINGECKO_BASE_URL = process.env.COINGECKO_BASE_URL;


// ================================
// Función para actualizar y guardar precios en BD
// ================================
const updatePricesJob = async (req, res) => {
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
const updatePrices = async (req, res) => {
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
const getCryptos = async (req, res) => {
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
const getCryptoDetail = async (req, res) => {
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
const getCryptoHistory = async (req, res) => {
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
const getCryptoHistoryDB = async (req, res) => {
    try {
        if (!Price || !Cryptocurrency) {
            return res.status(500).json({ error: "Modelos no inicializados" });
        }
        const { symbol } = req.params;

        // Busca la criptomoneda por símbolo
        const crypto = await Cryptocurrency.findOne({ where: { symbol } });
        if (!crypto) {
            return res.status(404).json({ error: "Criptomoneda no encontrada" });
        }

        // Obtener solo los precios de los últimos 7 registros
        const prices = await Price.findAll({
            where: {
                cryptocurrencyId: crypto.id
            },
            order: [["date_time", "DESC"]],
            limit: 7,
            attributes: ['price_usd', 'date_time']
        });

        // Formatear la respuesta para solo incluir precio y fecha
        const formattedPrices = prices.map(price => ({
            price: price.price_usd,
            date: price.date_time
        }));

        res.json(formattedPrices);
    } catch (error) {
        console.error("❌ Error en getCryptoHistoryDB:", error.message);
        res.status(500).json({ error: "Error al consultar históricos en la base de datos" });
    }
};
// GET /cryptos/random → 4 criptomonedas aleatorias con su último precio y percent_change_24h
const getRandomCryptocurrencies = async (req, res) => {
    try {
        const cryptos = await Cryptocurrency.findAll();

        if (cryptos.length < 4) {
            return res.status(400).json({ error: "No hay suficientes criptomonedas en la base de datos" });
        }

        // Selecciona 4 aleatorias
        const shuffled = cryptos.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 4);

        const result = [];
        for (const crypto of selected) {
            const lastPrice = await Price.findOne({
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
const getCryptocurrencyById = async (req, res) => {
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

//Obtener todas las criptomonedas (versión mejorada)
const getAllCryptocurrencies = async (req, res) => {
    try {
        //Obtener todas las cryptos con su último precio usando JOIN
        const cryptocurrencies = await Cryptocurrency.findAll({
            include: [{
                model: Price,
                as: 'prices',
                required: false, // LEFT JOIN (incluye cryptos sin precios)
                limit: 1,
                order: [['date_time', 'DESC']],
                attributes: [
                    'id',
                    'price_usd', 
                    'volume_24h',
                    'percent_change_24h', 
                    'date_time'
                ]
            }],
        });

        
        if (!cryptocurrencies || cryptocurrencies.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No se encontraron criptomonedas en la base de datos"
            });
        }

        //Formatear los datos para incluir el último precio
        const formattedData = cryptocurrencies.map(crypto => {
            const cryptoData = crypto.toJSON();
            const lastPrice = cryptoData.prices && cryptoData.prices.length > 0 
                ? cryptoData.prices[0] 
                : null;

            return {
                id: cryptoData.id,
                name: cryptoData.name,
                symbol: cryptoData.symbol,
                slug: cryptoData.slug,
                //Datos del último precio (si existe)
                last_price: lastPrice?.price_usd || null,
                volume_24h: lastPrice?.volume_24h || null,
                percent_change_24h: lastPrice?.percent_change_24h || null,
                last_updated: lastPrice?.date_time || null,
                //Indicador si tiene datos de precio
                has_price_data: lastPrice !== null
            };
        });


        res.status(200).json({
            success: true,
            count: cryptocurrencies.length,
            data: formattedData
        });

    } catch (error) {
        console.error("❌ Error en getAllCryptocurrencies:", error.message);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message
        });
    }
};

module.exports = {
    getCryptos,
    getCryptoDetail,
    getCryptoHistory,
    getCryptoHistoryDB,
    getRandomCryptocurrencies,
    updatePrices,
    getCryptocurrencyById,
    getAllCryptocurrencies,
    updatePricesJob
};