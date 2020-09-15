const express = require('express')
const router = express.Router()
const controller = require('../controllers/sale.js')



router.post('/newSale', controller.newSale)//Novo Venda

// router.get('/getSale/:id', controller.getSale) //buscar uma venda

// router.get('/getSales', controller.getSale) //buscar vendas

// router.put('/updateSale', controller.updateSale) //alterar uma venda

// router.post('/addItems', controller.addItems) //adicionar items a venda


module.exports = router
