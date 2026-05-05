//* MODULES *//
const express = require('express')
const router = express.Router()
//* MICROSERVICES *//
const DebugController = require('../../controllers/debug')

//* ROUTES *//
router.get('/:userId/:year', DebugController.fixYearGeneration)

module.exports = router