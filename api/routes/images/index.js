//* MODULES *//
const express = require('express')
const router = express.Router()
//* MICROSERVICES *//
const ImageControllers = require('../../controllers/images')

//* ROUTES *//
router.post('/', ImageControllers.uploadImage)

module.exports = router
