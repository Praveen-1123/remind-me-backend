const express = require('express');
const router = express.Router();
const UserController = require('../controller/user.controller')

const passport = require('passport')
const needsAuth = passport.authenticate('jwt', { session: false })
require('./../middleware/passport')(passport)

router.post('/user/register', UserController.registerUser)
router.post('/user/login', UserController.login)
router.post('/user/verify/email', UserController.verifyEmail)
router.post('/user/verify/resendcode', UserController.resendCode)
router.post('/user/verify/password', UserController.verifyResetPassword)
router.post('/user/resetpassword', UserController.resetPassword)
router.post('/user/update', needsAuth, UserController.updateUser)
router.get('/user/fetch/:userId', needsAuth, UserController.getUser)
router.post('/user/allusers', needsAuth, UserController.getAllUsers)

router.use('/', (req, res, next) => {
    return res.json({
        message: 'Welcome to RemindME API',
    })
});

module.exports = router;
