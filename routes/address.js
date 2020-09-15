const express = require('express')
const router = express.Router()
const controller = require('../controllers/address')
const success = require('../functions/defoult').success



router.post('/newAddress', controller.newAddress, success)  //Novo endereço


module.exports = router
