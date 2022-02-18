//* MODULES *//
const express = require('express')
const router = express.Router()
const { jwtauth } = require('../../../../middlewares/auth.middleware')
//* MICROSERVICES *//
const ObjectifController = require('../../../controllers/assistant/objectif')

//* ROUTES *//
router.get('/:userId', [jwtauth], ObjectifController.getALlObjectifs)

module.exports = router