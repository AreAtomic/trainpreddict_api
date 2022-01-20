//* MODULES *//
const express = require('express')
const router = express.Router()
//* MICROSERVICES *//
const OrganismeController = require('../../../controllers/assistant/organisme')

//* ROUTES *//
router.post('/register', OrganismeController.createOrganisme)

module.exports = router
