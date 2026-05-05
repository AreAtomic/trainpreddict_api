//* MODULES *//

const ParametreStructure = require('../../../../models/ParametreStructure')
const Seance = require('../../../../models/Seance')

//* MODELS *//

/**
 * @route GET /api/v1/assistant/config
 * @function getConfig
 * @description Récupération de la config du compte
 */
exports.getConfig = async (req, res) => {
    try {
        const userId = req.utilisateur._id
        let parametres = await ParametreStructure.findOne({
            _structure: userId,
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

/**
 * @route PUT /api/v1/assistant/config
 * @function putConfig
 * @description Modification de la config du compte
 */
exports.putConfig = async (req, res) => {
    try {
        const userId = req.utilisateur._id
        const { courbes, partage, own } = req.body

        await ParametreStructure.findOneAndUpdate(
            {
                _structure: userId,
            },
            {
                $set: {
                    coureur: {
                        courbes: courbes,
                    },
                    seance: {
                        partage: partage,
                        own: own,
                    },
                },
            },
            { upsert: true, new: true }
        )

        const parametres = await ParametreStructure.findOne({
            _structure: userId,
        })

        updateSeanceVisibility(userId, partage)

        return res.status(200).json({
            message: 'Configuration modifiés avec succès',
            parametres: {
                coureur: parametres.coureur,
                seance: parametres.seance,
            },
        })
    } catch (error) {
        console.error('putConfig - catch error :', error)
        return res.status(500).json({
            error: error,
            message: 'An error occured, please try again later.',
        })
    }
}

const updateSeanceVisibility = async (userId, public) => {
    const seances = await Seance.find({ _utilisateur: userId })
    Promise.all(
        seances.map(async (seance) => {
            await Seance.findOneAndUpdate(
                { _id: seance._id },
                { $set: { public: public } }
            )
        })
    )
}
