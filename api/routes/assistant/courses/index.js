//* MODULES *//
const express = require('express')
const router = express.Router()
const { jwtauth } = require('../../../../middlewares/auth.middleware')
//* MICROSERVICES *//
const CourseController = require('../../../controllers/assistant/courses')

router.get('/:userId', [jwtauth], CourseController.getCoursesUser)
router.put('/', [jwtauth], CourseController.putCourses)
router.get('/', [jwtauth], CourseController.getCoursesOrganisme)

module.exports = router
