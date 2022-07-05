var CryptoJS = require("crypto-js");
const CONFIG = require("../configs/global.configs");

const secretKey = CONFIG.app_secret;

const encryptData = (text) => {
    return CryptoJS.AES.encrypt(text, secretKey).toString()
}

const decryptData = (text) => {
    var bytes = CryptoJS.AES.decrypt(text, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8)
}

module.exports = {
    encryptData,
    decryptData
}