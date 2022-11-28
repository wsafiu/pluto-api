const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const blockHashSchema = new Schema({
    blockHash: { type: String, require: true },
    transactions: [{type: Schema.Types.ObjectId, ref: "invoice"}],
    createdAt: {type: Date, default: Date.now()}
})

module.exports = mongoose.model("block", blockHashSchema)