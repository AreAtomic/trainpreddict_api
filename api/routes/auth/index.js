//* MODULES *//
const express = require('express')
const router = express.Router()
//* CONTROLLERS *//
const AuthControllers = require('../../controllers/auth')

//* ROUTES *//
router.post('/', AuthControllers.getHashedPassword)
router.post('/login', AuthControllers.login)
router.post('/signup', AuthControllers.signup)
router.get('/:userId', AuthControllers.getUserById)
router.get('/confirm/:userId', AuthControllers.confirmRegistration)
router.get('/cancel/:userId', AuthControllers.cancelRegistration)
router.post('/changePassword', AuthControllers.changePassword)
router.get('/:email/reset/password', AuthControllers.getCode)
router.put('/:email/reset/password', AuthControllers.resetPassword)

module.exports = router
