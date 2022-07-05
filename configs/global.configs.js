require('dotenv').config();

let CONFIG = {}

CONFIG.app = process.env.APP || 'development';
CONFIG.port = process.env.PORT || '8082';

CONFIG.AWS_REGION = process.env.AWS_REGION;
CONFIG.AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
CONFIG.AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;

CONFIG.app_secret = process.env.APP_SECRET || 'remind-me-key-secret'
CONFIG.jwt_encryption = process.env.JWT_ENCRYPTION || 'remind-me-key-for-jwt-encryption';
CONFIG.jwt_expiration = process.env.JWT_EXPIRATION || '30000'

CONFIG.verify_email = process.env.VERIFY_EMAIL || 'false';

CONFIG.mail_email_id = process.env.MAIL_EMAIL_ID;
CONFIG.mail_password = process.env.MAIL_PASSWORD;

module.exports = CONFIG;
