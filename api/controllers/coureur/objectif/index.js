//* MODULES *//

//* MODELS *//
const Objectif = require('../../../../models/Objectif')

/**
 * @route GET /api/v1/coureur/objectif/:userId
 * @function getObjectif
 * @description Récupération d'un objectif
 */
exports.getAllObjectifs = async (req, res) => {
    try {
        const id = req.utilisateur._id
        const objectifs = await Objectif.find({ _utilisateur: id })

        return res
            .status(200)
            .json({ message: 'Objectifs récupérés', data: objectifs })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error: error.message,
            message: 'Une erreur est servenue, veuillez réessayer plus tard.',
        })
    }
}