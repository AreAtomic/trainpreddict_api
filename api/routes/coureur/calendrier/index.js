//* MODULES *//
const express = require('express')
const router = express.Router()
const { jwtauth } = require('../../../../middlewares/auth.middleware')
//* MICROSERVICES *//
const CalendrierController = require('../../../controllers/coureur/calendrier')

//* ROUTES *//
router.post('/', [jwtauth], CalendrierController.createCalendrier)
router.get('/:year', [jwtauth], CalendrierController.getCalendrier)
router.get(
    '/day/:date',
    [jwtauth],
    CalendrierController.getDayCalendrier
)
router.put(
    '/planned/:date',
    [jwtauth],
    CalendrierController.putDayCalendrierPlanned
)
router.put(
    '/done/:date',
    [jwtauth],
    CalendrierController.putDayCalendrierDone
)
router.put(
    '/comment/:date',
    [jwtauth],
    CalendrierController.putDayCalendrierComment
)
router.put(
    '/course/:date',
    [jwtauth],
    CalendrierController.putDayCalendrierCourse
)
router.put(
    '/objectif/:date',
    [jwtauth],
    CalendrierController.putDayCalendrierObjectif
)
router.put(
    '/indicators/:date',
    [jwtauth],
    CalendrierController.putIndicators
)
router.get(
    '/planned/object/:seanceId',
    [jwtauth],
    CalendrierController.getDayPlannedObject
)


module.exports = router
