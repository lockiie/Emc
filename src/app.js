const express = require('express')
const bodyParser = require('body-parser')
const compression = require('compression')

//const auth = require('./auth');
const app = express()

require('../database/dbConfig')

const helmet = require('helmet')

//variaveis globais 
global.SALT_KEY = "moises"

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, X-XSRF-TOKEN, x-access-token, Authorization, Content-Type, Accept")
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.header("Access-Control-Expose-Headers", "x-access-token")
    if (req.method == 'OPTIONS') {
        res.sendStatus(200)
    } else {
        next()
    }
})

app.use(helmet())

app.use(bodyParser.json({ limit: '5mb' }))
app.use(bodyParser.urlencoded({ limit: '5mb', extended: false }))

app.use(compression())

//Load Routes

const index = require('../routes/index')
const user = require('../routes/user')
const product = require('../routes/product')
const sale = require('../routes/sale')
const address = require('../routes/address')



//Use Routes
app.use('/', index)
app.use('/user', user)
app.use('/product', product)
app.use('/sale', sale)
app.use('/address', address)





module.exports = app

