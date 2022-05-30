//* MODULES *//

//* MODELS *//
const Objectif = require('../../../../models/Objectif')

/**
 * @route GET /api/v1/assistant/objectif/:userId
 * @function getObjectif
 * @description Récupération d'un objectif
 */
exports.getAllObjectifs = async (req, res) => {
    try {
        const id = req.params.userId
        const objectifs = await Objectif.find({ _utilisateur: id }).sort({
            date: 1,
        })
        console.log(objectifs)

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

exports.editObjectif = async (req, res) => {
    try {
        const id = req.params.objectifId
        const {
            type,
            resultat_vise,
            titre,
            description,
            denivele,
            distance,
            temps,
            sse,
            date,
        } = req.body
        const objectif = await Objectif.findOne({ _id: id })

        objectif.type = type
        objectif.resultat_vise = resultat_vise
        objectif.titre = titre
        objectif.description = description
        objectif.denivele = denivele
        objectif.distance = distance
        objectif.temps = temps
        objectif.sse = sse
        objectif.date = date
        objectif.save()

        return res.status(200).json({ message: 'Objectif mis à jour.' })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error: error.message,
            message: 'Une erreur est servenue, veuillez réessayer plus tard.',
        })
    }
}

/**
 * @route GET /api/v1/assistant/objectif/informations/:objectifId
 * @function getObjectif
 * @description Récupération d'un objectif
 */
exports.getObjectif = async (req, res) => {
    try {
        const id = req.params.objectifId
        const objectif = await Objectif.find({ _id: id })

        return res.status(200).json({ message: 'Séances récupérées', objectif })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error: error.message,
            message: 'Une erreur est servenue, veuillez réessayer plus tard.',
        })
    }
}
