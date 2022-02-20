//* MODULES *//

//* MODELS *//
const Seance = require('../../../../models/Seance')
const Entrainement = require('../../../../models/Entrainement')

/**
 * @route GET /api/v1/assistant/entrainement/
 * @function getAllEntrainements
 * @description Récupération de tous les entrainements créé par l'utilisateur
 */
exports.getAllEntrainements = async (req, res) => {
    try {
        const id = req.params.userId
        const seances = await Seance.find({ _utilisateur: id })

        return res
            .status(200)
            .json({ message: 'Séances récupérées', data: seances })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error: error.message,
            message: 'Une erreur est servenue, veuillez réessayer plus tard.',
        })
    }
}

/**
 * @route GET /api/v1/assistant/entrainement/:entrainementId
 * @function getEntrainement
 * @description Récupération d'une seance
 */
 exports.getEntrainement = async (req, res) => {
    try {
        const id = req.params.entrainementId
        const seance = await Seance.findOne({ _id: id })

        return res
            .status(200)
            .json({ message: 'Séances récupérées', data: seance })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error: error.message,
            message: 'Une erreur est servenue, veuillez réessayer plus tard.',
        })
    }
}

/**
 * @route GET /api/v1/assistant/entrainement/:entrainementId
 * @function getEntrainementUser
 * @description Récupération d'un entrainement
 */
 exports.getEntrainementUser = async (req, res) => {
    try {
        const id = req.params.entrainementId
        const seance = await Entrainement.findOne({ _id: id })

        return res
            .status(200)
            .json({ message: 'Séances récupérées', data: seance })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error: error.message,
            message: 'Une erreur est servenue, veuillez réessayer plus tard.',
        })
    }
}


/**
 * @route POST /api/v1/assistant/entrainement
 * @function createEntrainement
 * @description //TODO: Création d'un entrainement
 */

/**
 * @route PUT /api/v1/assistant/entrainement/:entrainementId
 * @function putEntrainement
 * @description //TODO: Modification d'un entrainement
 */
