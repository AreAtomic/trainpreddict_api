//* MODULES *//
const express = require('express')
const router = express.Router()
const { jwtauth } = require('../../../../middlewares/auth.middleware')
//* MICROSERVICES *//
const CourseController = require('../../../controllers/coureur/courses')

router.get('/', [jwtauth], CourseController.getCoursesUser)
router.put('/', [jwtauth], CourseController.putCourses)

module.exports = router
