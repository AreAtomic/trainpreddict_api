//* MODULES *//
const express = require('express')
const router = express.Router()
//* CONTROLLERS *//
const AuthControllers = require('../../controllers/auth')

//* ROUTES *//
router.post('/login', AuthControllers.login)
router.post('/signup', AuthControllers.signup)
router.post('/changePassword', AuthControllers.changePassword)
router.get('/:email/reset/password', AuthControllers.resetPassword)

module.exports = router
