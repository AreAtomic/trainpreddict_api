//* MODULES *//
const express = require('express')
const router = express.Router()
const { jwtauth } = require('../../../../middlewares/auth.middleware')
//* MICROSERVICES *//
const ConfigController = require('../../../controllers/coureur/config')

//* ROUTES *//
router.get('/', [jwtauth], ConfigController.getConfig)

module.exports = router