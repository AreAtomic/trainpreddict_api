//* MODULES *//
const express = require('express')
const router = express.Router()
const { jwtauth } = require('../../../../middlewares/auth.middleware')
//* MICROSERVICES *//
const AffiliationController = require('../../../controllers/assistant/affiliation')

//* ROUTES *//
router.post('/coureur/new', [jwtauth], AffiliationController.createCoureur)
router.post('/coureur', [jwtauth], AffiliationController.linkCoureur)
router.get('/coureur/:userId', [jwtauth], AffiliationController.getCoureur)
router.get('/coureurs/club', [jwtauth], AffiliationController.getCoureurs)
router.get('/coureurs/search', [jwtauth], AffiliationController.searchCoureurs)

module.exports = router

