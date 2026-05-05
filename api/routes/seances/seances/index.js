//* MODULES *//
const express = require('express')
const router = express.Router()
const { jwtauth } = require('../../../../middlewares/auth.middleware')
//* MICROSERVICES *//
const SeancesControllers = require('../../../controllers/seances/seances')

router.post('/', [jwtauth], SeancesControllers.createSeance)
router.put('/:id', [jwtauth], SeancesControllers.putSeance)
router.get('/:id', [jwtauth], SeancesControllers.getSeanceById)
router.get('/type/find', [jwtauth], SeancesControllers.getSeanceByType)
router.get('/', [jwtauth], SeancesControllers.getAllSeance)

module.exports = router
