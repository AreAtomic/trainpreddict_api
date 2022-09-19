//* MODULES *//
const ParametreStructure = require('../../../../models/ParametreStructure')
const Utilisateur = require('../../../../models/Utilisateur')

//* MODELS *//

/**
 * @route GET /api/v1/assistant/config
 * @function getConfig
 * @description Récupération de la config du compte
 */
exports.getConfig = async (req, res) => {
    try {
        const userId = req.utilisateur._id
        const utilisateur = await Utilisateur.findOne({ _id: userId })

        let parametres = await ParametreStructure.findOne({
            _structure: utilisateur._structure,
        })

        if (!parametres) {
            parametres = await ParametreStructure.create({ _structure: userId })
        }

        return res.status(200).json({
            message: 'Configuration récupérée avec succès',
            parametres: {
                coureur: parametres.coureur,
                seance: parametres.seance,
            },
        })
    } catch (error) {
        console.error('getConfig - catch error :', error)
        return res.status(500).json({
            error: error,
            message: 'An error occured, please try again later.',
        })
    }
}
