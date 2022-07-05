const dynamoose = require("dynamoose");

const config = require('../configs/app.config')

const UsersSchema = new dynamoose.Schema({
    id: {
        type: String,
        required: true,
        hashKey: true
    },
    active: {
        type: String,
        index: {
            name: "active-index",
            global: true
        },
        default: "false",
        enum: ["true", "false"]
    },
    email: {
        type: String,
        index: {
            name: "email-index",
            global: true
        },
        required: true
    },
    password: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        default: config.user_image_url
    },
    status: {
        type: String,
        default: "None"
    },
    about: {
        type: String,
        default: "None"
    },
    firstName: {
        type: String,
        default: "None"
    },
    lastName: {
        type: String,
        default: "None"
    },
    gender: {
        type: String,
        default: "None"
    },
    popularity: {
        type: Number,
        default: 0
    },
    verificationCode: {
        type: Number
    },
    disabled: {
        type: Boolean,
        default: false
    },
    verified: {
        type: Boolean,
        default: false
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    private: {
        type: Boolean,
        default: false
    }
}, {
    "saveUnknown": false,
    "timestamps": true
});

const Users = module.exports = dynamoose.model('Users', UsersSchema);
