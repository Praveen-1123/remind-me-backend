const jwt = require('jsonwebtoken')
const CONFIG = require('../configs/global.configs')

const signJWT = function (userId, email) {
    let expiration_time = CONFIG.jwt_expiration
    return 'Bearer ' + jwt.sign({ user_id: userId, email: email }, CONFIG.jwt_encryption,
        { expiresIn: expiration_time })
}

module.exports.signJWT = signJWT