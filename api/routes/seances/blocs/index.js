//* MODULES *//
const express = require('express')
const router = express.Router()
const { jwtauth } = require('../../../../middlewares/auth.middleware')
//* MICROSERVICES *//
const BlocsControllers = require('../../../controllers/seances/blocs')


router.post('/', [jwtauth], BlocsControllers.createBloc)
router.put('/:id', [jwtauth], BlocsControllers.putBloc)
router.delete('/:id', [jwtauth], Blocs)
router.get('/', [jwtauth], BlocsControllers.getAllBlocs)
router.get('/own', [jwtauth], BlocsControllers.getUserBlocs)

module.exports = router
