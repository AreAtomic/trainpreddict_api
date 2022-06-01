//* MODULES *//
const express = require('express')
const router = express.Router()
const { jwtauth } = require('../../../../middlewares/auth.middleware')
//* MICROSERVICES *//
const ConfigController = require('../../../controllers/assistant/config')

//* ROUTES *//
router.get('/', [jwtauth], ConfigController.getConfig)
router.put('/', [jwtauth], ConfigController.putConfig)

module.exports = router
