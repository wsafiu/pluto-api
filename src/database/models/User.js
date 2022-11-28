const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose")
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {type: String, required: true, unique: true},
    fullname: {type: String, required: true, unique: true},
    isActivate: {type: Boolean, default: false},
    linkExpired : { type: Number, default: 0, min: 0}
}, {timestamps: true})

userSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("user", userSchema);