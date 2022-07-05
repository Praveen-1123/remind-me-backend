const bcrypt = require('bcryptjs')

const getPasswordHash = async function (password) {
    let salt, hash;

    salt = await bcrypt.genSalt(10)

    hash = await bcrypt.hash(password, salt)
    return hash
}

module.exports.getPasswordHash = getPasswordHash

const comparePassword = async function (password, hash) {
    let pass;

    pass = await bcrypt.compare(password, hash)
    if (!pass) return false;

    return true
}

module.exports.comparePassword = comparePassword