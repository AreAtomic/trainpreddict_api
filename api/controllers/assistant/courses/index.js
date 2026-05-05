//* MODULES *//
const DateServices = require('../../../../services/calendar/date.service')

//* MODELS *//
const Course = require('../../../../models/Course')

/**
 * @route GET /api/v1/assistant/course/:courseId
 * @function getCoursesUser
 * @description Récupération des courses d'un utilisateur course
 */
exports.getCoursesUser = async (req, res) => {
    try {
        const id = req.params.userId
        const courses = await Course.find({ _utilisateur: id })
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
 * @route GET /api/v1/assistant/course/:courseId
 * @function getCoursesOrganisme
 * @description Récupération des courses d'un utilisateur course
 */
exports.getCoursesOrganisme = async (req, res) => {
    try {
        const id = req.utilisateur._id
        const courses = await Course.find({ _organisme: id })

        return res
            .status(200)
            .json({ message: 'Courses récupérées', data: courses })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error: error.message,
            message: 'Une erreur est survenue, veuillez réessayer plus tard.',
        })
    }
}

/**
 * @route PUT /api/v1/assistant/course/:courseId
 * @function putCourse
 * @description Modification d'une course
 */
exports.putCourses = async (req, res) => {
    try {
        const { type, titre, description, denivele, distance, temps, sse } =
            req.body
        const date = req.params.date

        const course = await Course.findOneAndUpdate(
            {
                _organisme: req.utilisateur._id,
                titre: titre,
                date: DateServices.dateToISOStringZero(date),
            },
            {
                $set: {
                    type,
                    description,
                    denivele,
                    distance,
                    temps,
                    sse,
                },
            },
            {
                new: true,
                upsert: true,
            }
        )

        return res
            .status(200)
            .json({ message: 'Course créée avec succès', data: course })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error: error.message,
            message: 'Une erreur est survenue, veuillez réessayer plus tard.',
        })
    }
}
