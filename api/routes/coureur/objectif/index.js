//* MODULES *//
const express = require('express')
const router = express.Router()
const { jwtauth } = require('../../../../middlewares/auth.middleware')
//* MICROSERVICES *//
const ObjectifController = require('../../../controllers/coureur/objectif')

//* ROUTES *//
router.get('/', [jwtauth], ObjectifController.getAllObjectifs)

module.exports = router