//* MODULES *//
const express = require('express')
const router = express.Router()
const { jwtauth } = require('../../../../middlewares/auth.middleware')
//* MICROSERVICES *//
const ProfilController = require('../../../controllers/coureur/profil')

//* ROUTES *//
router.get('/', [jwtauth], ProfilController.getProfile)
router.put('/', [jwtauth], ProfilController.putProfile)
router.get('/onboarding', [jwtauth], ProfilController.getOnBoarding)
router.put('/onboarding', [jwtauth], ProfilController.putOnBoarding)

module.exports = router
