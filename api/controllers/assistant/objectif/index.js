//* MODULES *//

//* MODELS *//
const Objectif = require('../../../../models/Objectif')

/**
 * @route GET /api/v1/assistant/objectif/:userId
 * @function getObjectif
 * @description //TODO: Récupération d'un objectif
 */
exports.getALlObjectifs = async (req, res) => {
    try {
        const id = req.params.userId
        const objectifs = Objectif.find({ _utilisateur: id })

        return res
            .status(200)
            .json({ message: 'Séances récupérées', data: objectifs })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error: error.message,
            message: 'Une erreur est servenue, veuillez réessayer plus tard.',
        })
    }
}

/**
 * @route POST /api/v1/assistant/objectif
 * @function createObjectif
 * @description //TODO: Création d'un objectif
 */

/**
 * @route PUT /api/v1/assistant/objectif/:objectifId
 * @function putObjectif
 * @description //TODO: Modification d'un objectif
 */
