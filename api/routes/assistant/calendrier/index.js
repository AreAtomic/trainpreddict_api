//* MODULES *//
const express = require('express')
const router = express.Router()
const { jwtauth } = require('../../../../middlewares/auth.middleware')
//* MICROSERVICES *//
const CalendrierController = require('../../../controllers/assistant/calendrier')

//* ROUTES *//
router.post('/:userId', [jwtauth], CalendrierController.createCalendrier)
router.get('/:userId/:year', [jwtauth], CalendrierController.getCalendrier)
router.get(
    '/:userId/day/:date',
    [jwtauth],
    CalendrierController.getDayCalendrier
)
router.put(
    '/:userId/planned/:date',
    [jwtauth],
    CalendrierController.putDayCalendrierPlanned
)
router.put(
    '/:userId/done/:date',
    [jwtauth],
    CalendrierController.putDayCalendrierDone
)
router.put(
    '/:userId/comment/:date',
    [jwtauth],
    CalendrierController.putDayCalendrierComment
)
router.put(
    '/:userId/course/:date',
    [jwtauth],
    CalendrierController.putDayCalendrierCourse
)
router.put(
    '/:userId/objectif/:date',
    [jwtauth],
    CalendrierController.putDayCalendrierObjectif
)
router.put(
    '/:userId/indicators/:date',
    [jwtauth],
    CalendrierController.putIndicators
)

module.exports = router
