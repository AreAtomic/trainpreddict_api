//* MODULES *//
const express = require('express')
const router = express.Router()
const { jwtauth } = require('../../../../middlewares/auth.middleware')
//* MICROSERVICES *//
const EntrainementController = require('../../../controllers/coureur/entrainement')

//* ROUTES *//
router.get('/', [jwtauth], EntrainementController.getAllEntrainements)
router.post('/', [jwtauth], EntrainementController.createEntrainementFromFile)
router.get('/:entrainementId/analyse', [jwtauth], EntrainementController.getEntrainement)

module.exports = router