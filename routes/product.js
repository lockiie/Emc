const express = require('express')
const router = express.Router()
const controller = require('../controllers/product')

router.post('/newProduct', controller.newProduct)//Novo Produto

router.post('/updateProduct', controller.updateProduct)//Editar produto

router.delete('/deleteProductImage/:id', controller.deleteProductImage)//Editar produto

router.post('/updateStockAdd', controller.updateStockAdd)//Adicionar novos produtos ao estoque

router.post('/updateStock', controller.updateStock)//Substituir estoque



module.exports = router