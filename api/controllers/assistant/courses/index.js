//* MODULES *//

const Course = require('../../../../models/Course')

//* MODELS *//

/**
 * @route GET /api/v1/assistant/course/:courseId
 * @function getCourses
 * @description //TODO: Récupération d'une course
 */
exports.getCourses = async (req, res) => {
    try {
        const id = req.params.userId
        const courses = Course.find({ _utilisateur: id })
        return res
            .status(200)
            .json({ message: 'Courses récupérées', data: courses })
    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Une erreur est survenue, veuillez réessayer plus tard.',
        })
    }
}

/**
 * @route PUT /api/v1/assistant/course/:courseId
 * @function putCourse
 * @description //TODO: Modification d'une course
 */
