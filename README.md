# 🚀 CryptoInvestment - Backend

Backend del proyecto **CryptoInvestment**, encargado de gestionar la persistencia de datos, la integración con APIs externas (CoinMarketCap y CoinGecko) y la exposición de servicios REST para el frontend.

---

## 📂 Tecnologías utilizadas
- Node.js + Express
- Sequelize (ORM)
- MySQL (Base de datos)
- node-cron (tareas programadas)
- CoinMarketCap API / CoinGecko API

---

## 📊 Base de Datos

**Modelo Entidad-Relación (MER):**

cryptocurrencies (1) ------< prices (N)


**Tablas:**
- `cryptocurrencies`: id, name, symbol, slug  
- `prices`: id, cryptocurrencyId (FK), price_usd, volume_24h, percent_change_24h, date_time  

---

## 🔗 Endpoints disponibles

- `GET /cryptos` → lista de criptos almacenadas en BD.  
- `GET /cryptos/:symbol` → detalles de una cripto por símbolo.  
- `GET /prices/:id` → historial de precios de una cripto por ID.  
- `GET /cryptos/random` → lista de criptos aleatorias desde BD.  
- `GET /cryptos/history-coingecko/:slug` → historial desde la API de Coingecko.  
- `GET /cryptos/AllCryptocurrencies` → lista completa de criptomonedas en BD.  
- `GET /cryptos/history-db/:symbol` → historial de precios desde BD.  
- `GET /cryptos/gainers` → criptos con mayor ganancia.  
- `GET /cryptos/losers` → criptos con mayor pérdida.  

---

## ⚙️ Instalación y ejecución

### 1. Clonar el repositorio

git clone https://github.com/ErickAriasCardona/crypto-investment-backend.git

cd crypto-investment-backend

2. Instalar dependencias

npm install

3. Configurar variables de entorno
Crear un archivo .env en la raíz del proyecto:
"
# Puerto donde corre el backend
PORT=3001

# API KEY de CoinMarketCap
COINMARKETCAP_API_KEY=tu-api-key

# API URLS
COINMARKETCAP_BASE_URL=https://pro-api.coinmarketcap.com/v1
COINGECKO_BASE_URL=https://api.coingecko.com/api/v3

# MySQL Config
DB_NAME=crypto_investment
DB_USER=root
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=3306
DB_DIALECT=mysql
"

4. Levantar el servidor

npm run dev

El backend quedará corriendo en:
👉 http://localhost:3001

📌 Observaciones Técnicas
Actualización de datos con node-cron.

Estructura en capas: modelos, controladores y rutas.

Uso de Sequelize para abstracción de la base de datos.