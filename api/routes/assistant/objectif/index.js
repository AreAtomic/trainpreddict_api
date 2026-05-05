//* MODULES *//
const express = require('express')
const router = express.Router()
const { jwtauth } = require('../../../../middlewares/auth.middleware')
//* MICROSERVICES *//
const ObjectifController = require('../../../controllers/assistant/objectif')

//* ROUTES *//
router.get('/:userId', [jwtauth], ObjectifController.getAllObjectifs)
router.put('/:objectifId', [jwtauth], ObjectifController.editObjectif)
router.get('/informations/:objectifId', [jwtauth], ObjectifController.getObjectif)

module.exports = router