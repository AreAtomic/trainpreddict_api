//* MODULES *//
const express = require('express')
const router = express.Router()
const { jwtauth } = require('../../../../middlewares/auth.middleware')
//* MICROSERVICES *//
const ProfilController = require('../../../controllers/assistant/profil')

//* ROUTES *//
router.get('/:userId', [jwtauth], ProfilController.getProfile)
router.put('/:userId', [jwtauth], ProfilController.putProfile)

module.exports = router