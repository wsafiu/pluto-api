const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = new Schema({
    address: { type: String, require: true },
    value: {type: Number, require: true, min: 0},
    blockHash: { type: String, require: true },
    n: Number,
    // time: Number,
    txid: String,
    paymentAmount: {type: Number, default: 0, min: 0},
    buyPrice: {type: Number, min: 0},
    sellPrice:{type: Number, min: 0},
    buyRate: {type: Number, min: 0},
    sellRate: {type: Number, min: 0}
}, { timestamps: true })

module.exports = mongoose.model('order', orderSchema);