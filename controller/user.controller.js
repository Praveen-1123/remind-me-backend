const AWS = require("aws-sdk")
const validator = require('validator')
const { v4: uuidv4 } = require('uuid');

const { signJWT } = require('../authentication/jwt.auth')
const { to, isNull, isEmpty } = require('../services/utils.services')
const { ReE, ReS, ReF } = require('../services/response.services')
const { sendVerificationEmail } = require('../services/nodemailer')
const { getPasswordHash, comparePassword } = require('../utils/password.validation')

const Users = require('../models/user.model');
const CONFIG = require("../configs/global.configs");
const configs = require('../configs/app.config')
const { isEmail } = validator

const registerUser = async function (req, res) {

    let err, user, jwt;
    let uuid = uuidv4();

    let body = req.body;
    let verificationCode = Math.floor(100000 + Math.random() * 900000);

    if (isNull(body.email)) return ReF(res, "Email")
    if (isNull(body.password)) return ReF(res, "Password")
    if (!isEmail(body.email)) return ReE(res, "Email id is not valid")

    let password_hash = await getPasswordHash(body.password);
    let auth_token = await signJWT(uuid, body.email);

    let db_data = {
        id: uuid,
        email: body.email,
        password: password_hash,
        verificationCode: verificationCode
    }

    try {

        [err, user] = await to(Users.query("email").eq(body.email).using("email-index").exec());

        if (err) {

            console.log("error::fetch::user", err)
            return ReE(res, "Unknown error occurred, Please contact support.")
        }
        else if (user.length > 0) {

            return ReE(res, "Email already registered, Please login to continue")
        } else {

            if (CONFIG.verify_email === 'true') {

                let info = await sendVerificationEmail(body.email, verificationCode);

                [err, user] = await to(Users.create(db_data));

                if (err) {
                    console.log("error::create::user", err)
                    return ReE(res, "Unknown error occurred, Please contact support.")
                }

                return ReS(res, { id: user.id, email: user.email });
            }
            else {

                [err, user] = await to(Users.create(db_data));

                if (err) {
                    console.log("error::create::user", err)
                    return ReE(res, "Unknown error occurred, Please contact support.")
                }

                return ReS(res, { id: user.id, email: user.email, token: auth_token, code: user.verificationCode });
            }

        }

    } catch (error) {

        console.log("catch::create::user", error)
        return ReE(res, "Unknown error occurred, Please contact support.")
    }

}

const verifyEmail = async function (req, res) {

    let err, user;

    const email = req.body.email;
    const code = req.body.verificationCode;

    if (isNull(email)) return ReF(res, "Email")
    if (isNull(code)) return ReF(res, "Verification code")
    if (!isEmail(email)) return ReE(res, "Email id is not valid")
    if (code.toString().length != 6) return ReE(res, "Invalid verification code format")

    try {

        [err, user] = await to(Users.query("email").eq(email).using('email-index').exec());

        if (err) {

            console.log("error::fetch::user", err)
            return ReE(res, "Unknown error occurred, Please contact support.")
        }

        if (user.length === 0) {

            return ReE(res, "No user found. Please register and try again.")
        }
        let current_user = user[0];

        if (code === current_user.verificationCode) {

            let auth_token = await signJWT(current_user.id, current_user.email);

            [err, user] = await to(Users.update({ id: current_user.id },
                { active: "true", emailVerified: true, verificationCode: 0 }));

            if (err) {

                console.log("error::update::user", err)
                return ReE(res, "Unknown error occurred, Please contact support.")
            }

            return ReS(res, { id: user.id, email: user.email, token: auth_token });
        }
        else {

            return ReE(res, "Code doesn't match, please try again.")
        }

    } catch (error) {

        console.log("catch::verify::email", error)
        return ReE(res, "Unknown error occurred, Please contact support.")
    }
}

const resendCode = async function (req, res) {

    let err, user;

    const email = req.body.email;
    let verificationCode = Math.floor(100000 + Math.random() * 900000);

    if (isNull(email)) return ReF(res, "Email")
    if (!isEmail(email)) return ReE(res, "Email id is not valid")

    try {

        [err, user] = await to(Users.query("email").eq(email).using('email-index').exec());

        if (err) {

            console.log("error::fetch::user", err)
            return ReE(res, "Unknown error occurred, Please contact support.")
        }

        if (user.length === 0) {

            return ReE(res, "No user found. Please register and try again.")
        }

        current_user = user[0];

        let info = await sendVerificationEmail(email, verificationCode);

        [err, user] = await to(Users.update({ id: current_user.id }, { verificationCode: verificationCode }))

        if (err) {

            console.log("error::update::user", err)
            return ReE(res, "Unknown error occurred, Please contact support.")
        }

        return ReS(res, "Code sent successfully");

    } catch (error) {

        console.log("catch::resend::email", error)
        return ReE(res, "Unknown error occurred, Please contact support.")
    }
}

const login = async function (req, res) {

    let err, user, newuser;
    let current_user;

    const email = req.body.email
    const password = req.body.password

    if (isNull(email)) return ReF(res, "Email")
    if (!isEmail(email)) return ReE(res, "Email id is not valid")
    if (isNull(password)) return ReF(res, "Password")

    try {

        [err, user] = await to(Users.query("email").eq(email).exec());

        if (err) {

            console.log("error::fetch::user", err)
            return ReE(res, "Unknown error occurred, Please contact support.")
        }
        if (user.length === 0) {

            return ReE(res, "No user found. Please register and try again.")
        }
        current_user = user[0];
        let verification = await comparePassword(password, current_user.password);

        if (!verification) {

            return ReE(res, "Incorrect password. please try again")
        }

        if (CONFIG.verify_email === 'true') {

            if (!current_user.emailVerified) {

                return ReS(res, { auth: false, message: "User not verified. please verify your email and try again." })
            }

        }

        let auth_token = await signJWT(current_user.id, current_user.email);

        return ReS(res, { auth: true, id: current_user.id, email: current_user.email, token: auth_token })

    } catch (error) {

        console.log("catch::login::user", error)
        return ReE(res, "Unknown error occurred, Please contact support.")
    }
}

const updateUser = async function (req, res) {

    let err, newuser;

    let user = req.user[0];
    let data = req.body;

    if (isNull(user) || isEmpty(user)) {

        return ReE(res, 'User not found')
    }

    if (user.disabled) {

        return ReE(res, 'Can not update disabled user')
    }

    if (user.active === "false") {

        return ReE(res, 'User is deleted')
    }

    if (isNull(data) || isEmpty(data)) {

        return ReE(res, 'Nothing to update. please specify a field.')
    }

    try {

        [err, newuser] = await to(Users.update({ id: user.id }, data));

        if (err) {

            console.log("error::update::user", err)
            return ReE(res, "Unknown error occurred, Please contact support.")
        }

        return ReS(res, newuser)

    } catch (error) {

        console.log("catch::update::user", error)
        return ReE(res, "Unknown error occurred, Please contact support.")
    }

}

const verifyResetPassword = async function (req, res) {

    let err, user;

    const email = req.body.email;
    let verificationCode = Math.floor(100000 + Math.random() * 900000);

    if (isNull(email)) return ReF(res, "Email")
    if (!isEmail(email)) return ReE(res, "Email id is not valid")

    try {

        [err, user] = await to(Users.query("email").eq(email).and("active").exec());

        if (err) {

            console.log("error::reset::password", err)
            return ReE(res, "Unknown error occurred, Please contact support.")
        }

        if (user.length === 0) {

            return ReE(res, "No user found.")
        }

        current_user = user[0];

        let info = await sendVerificationEmail(email, verificationCode);

        [err, user] = await to(Users.update({ id: current_user.id }, { verificationCode: verificationCode }))

        if (err) {

            console.log("error::verify::password", err)
            return ReE(res, "Unknown error occurred, Please contact support.")
        }

        return ReS(res, "Code sent successfully");

    } catch (error) {

        console.log("catch::verify::password", error)
        return ReE(res, "Unknown error occurred, Please contact support.")
    }
}

const resetPassword = async function (req, res) {

    let err, user, current_user;

    const email = req.body.email
    const password = req.body.password
    const code = req.body.verificationCode

    if (isNull(email)) return ReF(res, "Email")
    if (!isEmail(email)) return ReE(res, "Email id is not valid")
    if (isNull(password)) return ReF(res, "Password")
    if (isNull(code)) return ReF(res, "VerificationCode")
    if (code.toString().length != 6) return ReE(res, "Invalid verification code format")

    try {

        [err, user] = await to(Users.query("email").eq(email).and("active").exec());

        if (err) {

            console.log("error::reset::password", err)
            return ReE(res, "Unknown error occurred, Please contact support.")
        }

        if (user.length === 0) {

            return ReE(res, "No user found.")
        }

        current_user = user[0];

        if (current_user.disabled) {

            return ReE(res, 'Can not reset password for disabled user')
        }
        if (current_user.active === "false") {

            return ReE(res, 'User is deleted')
        }

        if (code === current_user.verificationCode) {

            let password_hash = await getPasswordHash(password);

            [err, user] = await to(Users.update({ id: current_user.id }, { password: password_hash, verificationCode: 0, }))

            if (err) {

                console.log("error::password::user", err)
                return ReE(res, "Unknown error occurred, Please contact support.")
            }

            return ReS(res, "Password reset successfully")

        } else {

            return ReE(res, "Code doesn't match, please try again.")
        }

    } catch (error) {

        console.log("catch::reset::password", error)
        return ReE(res, "Unknown error occurred, Please contact support.")
    }

}

const getUser = async function (req, res) {
    let err, user;

    let userId = req.params.userId;
    let current_user = req.user[0];

    if (userId === ':userId') return ReF(res, "UserId")

    if (userId === current_user.id) {

        return ReS(res, current_user);
    }

    try {

        [err, user] = await to(Users.query("id").eq(userId).attributes(configs.users_populatable).exec());

        if (err) {

            console.log("error::fetch::user", err)
            return ReE(res, "Unknown error occurred, Please contact support.")
        }

        if (user.length === 0) {

            return ReE(res, "No user found")
        }

        if (user[0].disabled) {

            return ReE(res, 'User is disabled')
        }
        if (user[0].active === "false") {

            return ReE(res, 'User is deleted')
        }

        return ReS(res, user[0]);

    } catch (error) {

        console.log("catch::fetch::user", error)
        return ReE(res, "Unknown error occurred, Please contact support.")
    }
}

const getAllUsers = async function (req, res) {

    let err, users;

    let limit = req.query.limit;
    let lastKey = req.body;

    if (isNull(lastKey) || isEmpty(lastKey)) {

        lastKey = null;
    }

    try {

        [err, users] = await to(Users.query("active").eq("true").using("active-index")
            .and().where("disabled").eq(false).attributes(configs.users_populatable)
            .limit(limit).startAt(lastKey).exec());

        if (err) {

            console.log("error::fetch::users", err)
            return ReE(res, "Unknown error occurred, Please contact support.")
        }

        if (users.length === 0) {

            return ReE(res, "No users found")
        }

        lastKey = users.lastKey;

        return ReS(res, { data: users, lastKey: lastKey })

    } catch (error) {

        console.log("catch::fetch::users", error)
        return ReE(res, "Unknown error occurred, Please contact support.")
    }
}

module.exports = {
    registerUser,
    verifyEmail,
    resendCode,
    login,
    updateUser,
    verifyResetPassword,
    resetPassword,
    getUser,
    getAllUsers
}