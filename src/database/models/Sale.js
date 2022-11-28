const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const saleSchema = new Schema({
    orderId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true, min: 0 },
    sellPrice: { type: Number, required: true, min: 0 },
    time: { type: Number, required: true, min: 0 },
    blockHash: { type: String, required: true }
}, {timestamps: true});

module.exports = mongoose.model('sale', saleSchema);