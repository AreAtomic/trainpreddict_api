//* MODULES *//
const express = require('express')
const router = express.Router()
const { jwtauth } = require('../../../../middlewares/auth.middleware')
//* MICROSERVICES *//
const EntrainementController = require('../../../controllers/assistant/entrainement')

//* ROUTES *//
router.get('/:userId', [jwtauth], EntrainementController.getAllEntrainements)
router.get('/:entrainementId/analyse', [jwtauth], EntrainementController.getEntrainement)

module.exports = router