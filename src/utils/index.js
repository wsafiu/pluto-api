const axios = require('axios');
const {default: Binance} = require("binance-api-node");
const FormatData = (data) => {
    if(data){
        return { data }
    }else{
        throw new Error('Data Not found!')
    }
}

const initiateError = (code, msg) => {
    const e = new Error()
    e.statusCode = code;
    e.message = msg;
    throw e;
}

const getC2cPrice = async () => {
    let arr = [];
    try {
        const { data } = await axios.post("https://c2c.binance.com/bapi/c2c/v2/friendly/c2c/adv/search",
            {
                "page": 1,
                "rows": 5,
                "payTypes": ["BANK"],
                "asset": "BUSD",
                "tradeType": "SELL",
                "fiat": "NGN",
                "publisherType": "merchant",
                "merchantCheck": "True"
            })
        for (const entity of data.data) arr.push(parseFloat(entity.adv.price))
        return  Math.floor(arr.reduce((a, b) => a + b)/arr.length) - 1;
    }catch (err) { throw err };
}

const getBTCPrice = async () => {
    const client = Binance({
        apiKey: process.env.BTC_API_KEY,
        apiSecret: process.env.BTC_API_SECRET,
        // getTime: xxx
    })
    try {
        const { price } = await client.avgPrice({ symbol: 'BTCBUSD' });
        return price
    }catch (err) { throw err}
}


module.exports = {
    FormatData,
    SendMail: require('./mailer'),
    initiateError,
    getC2cPrice,
    getBTCPrice,
}
