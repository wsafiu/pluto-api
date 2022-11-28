require('dotenv').config();

module.exports = {
    MONGO_URL: process.env.MONGO_URL,
    MONG0_DEV: process.env.MONG0_DEV,
    SECRET_KEY: process.env.SECRET_KEY,
    X_PUB: process.env.X_PUB,
    BTC_API_KEY: process.env.BTC_API_KEY,
    BTC_API_SECRET: process.env.BTC_API_SECRET
}