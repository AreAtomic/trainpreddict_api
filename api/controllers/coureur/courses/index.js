//* MODULES *//

const Course = require('../../../../models/Course')

//* MODELS *//

/**
 * @route GET /api/v1/coureur/course/:courseId
 * @function getCoursesUser
 * @description Récupération des courses d'un utilisateur course
 */
exports.getCoursesUser = async (req, res) => {
    try {
        const id = req.utilisateur._id
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
 * @route PUT /api/v1/coureur/course/:courseId
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
                _utilisateur: req.utilisateur._id,
                titre: titre,
            },
            {
                $set: {
                    date,
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
