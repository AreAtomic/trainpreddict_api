//* MODULES *//
const express = require('express')
const router = express.Router()
const { jwtauth } = require('../../../middlewares/auth.middleware')
//* MICROSERVICES *//
const ImageControllers = require('../../controllers/images')

//* ROUTES *//
router.post('/', [jwtauth], ImageControllers.uploadImage)

module.exports = router
