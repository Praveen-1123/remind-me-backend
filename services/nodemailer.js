const nodemailer = require("nodemailer");
const CONFIG = require("../configs/global.configs");

let transporter = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
        user: CONFIG.mail_email_id,
        pass: CONFIG.mail_password,
    },
});

const sendVerificationEmail = async function (to, code) {
    let options = {
        from: CONFIG.mail_email_id,
        to: to,
        subject: "Verify your email for RemindME",
        text: "Your verification code is: " + code.toString()
    }

    let info = await transporter.sendMail(options);

    if (info.accepted.length > 0) {
        return true;
    } else {
        return false
    }
}

module.exports.sendVerificationEmail = sendVerificationEmail;