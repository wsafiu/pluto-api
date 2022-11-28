const passport = require('passport');
const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require('passport-jwt').Strategy; //authenticating RESTful endpoint without session
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require("jsonwebtoken");

const User = require("../../database/models/User");
const { SECRET_KEY } = require('../../config');

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser())

exports.getToken = (payload) => {
    return jwt.sign(payload, SECRET_KEY, {expiresIn: 3600});
}

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.SECRET_KEY;

exports.jwtPassport = passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
    User.findById(jwt_payload._id, (err, user) => {
        if(err) return done(err, false);
        if(user) return done(null, user);
        else  return done(null, false)
    })
}))

exports.verifyUser = passport.authenticate('jwt', {session: false});