const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const invoiceSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "user", required: true },
    amount: { type: Number, required: true, min: 0 },
    walletAddresses: { type: String, required: true },
    amountInSatoshi: { type: String, required: true },
    status: { type: String, default: "pending" },
    phone: { type: String, required: true },
    prevInvoiceId: { type: String }


}, { timestamps: true })

module.exports = mongoose.model("invoice", invoiceSchema);