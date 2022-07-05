const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const Users = require('../models/user.model')
const CONFIG = require('../configs/global.configs')
const configs = require('../configs/app.config')
const { to } = require('../services/utils.services')

module.exports = function (passport) {
    var opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    opts.secretOrKey = CONFIG.jwt_encryption;

    passport.use(new JwtStrategy(opts, async function (jwt_payload, done) {
        let err, user;
        try {
            [err, user] = await to(Users.query("id").eq(jwt_payload.user_id)
                .and().where("active").eq("true").and().where("disabled").eq(false)
                .attributes(configs.users_populatable).exec());
            if (err) return done(err, false);
            if (user.length > 0) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        } catch (error) {
            return done(null, false);
        }
    }));
};
