const AWS = require("aws-sdk");
const express = require('express')
const cors = require('cors')

const routes = require('./router/v1.router');
const CONFIG = require("./configs/global.configs");

let awsConfig = {
    "region": CONFIG.AWS_REGION,
    "accessKeyId": CONFIG.AWS_ACCESS_KEY,
    "secretAccessKey": CONFIG.AWS_SECRET_KEY
};

AWS.config.update(awsConfig);

const app = express()
const port = CONFIG.port

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    return res.json({
        message: 'Welcome to RemindME API',
    })
})

app.use('/v1', routes);

app.listen(port, () => {
    console.log(`App Listening at http://localhost:${port}`)
})
