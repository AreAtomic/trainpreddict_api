//* MODULES *//
const express = require('express')
const router = express.Router()
const { jwtauth } = require('../../../../middlewares/auth.middleware')
//* MICROSERVICES *//
const PlanController = require('../../../controllers/coureur/plan')

//* ROUTES *//
router.post('/', PlanController.createPlan)
router.put('/:userId', PlanController.migratePlanOldModel)

module.exports = router
