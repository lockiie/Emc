const express = require('express')
const router = express.Router()
const controller = require('../controllers/user')



router.post('/newUser', controller.newUser)//Novo Usuário

router.get('/getUser/:id', controller.getUser) //buscar um usuário

router.put('/updateUser', controller.updateUser) //alterar um usuário

router.put('/updatePassword', controller.updatePassword)//alterar senha

router.post('/login', controller.login)


module.exports = router
