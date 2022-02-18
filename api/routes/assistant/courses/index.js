//* MODULES *//
const express = require('express')
const router = express.Router()
const { jwtauth } = require('../../../../middlewares/auth.middleware')
//* MICROSERVICES *//
const CourseController = require('../../../controllers/assistant/courses')

router.get('/:userId', [jwtauth], CourseController.getCourses)

module.exports = router
