//* MODULES *//
const mongo = require('mongodb')
//* MODELS *//
const Seance = require('../../../../models/Seance')
const ParametreStructure = require('../../../../models/ParametreStructure')

conversion_minute = (time) => {
    duree_heure = parseInt(time.charAt(0) + time.charAt(1))
    duree_minute = parseInt(time.charAt(3) + time.charAt(4))
    duree_seconde = parseInt(time.charAt(6) + time.charAt(7))

    int_duree = duree_heure * 60 + duree_minute + duree_seconde / 60
    return int_duree
}

/**
 * @route POST api/seance
 * @description Permet de créer une seance d'entrainement
 */
exports.createSeance = async (req, res) => {
    let {
        titre,
        type,
        duree,
        estimation_distance,
        estimation_deniv,
        specifique,
        description,
        Z1,
        Z2,
        Z3,
        Z4,
        Z5,
        Z6,
        Z7,
        puissance_moyenne,
        charge_entrainement_estime,
        intensite_travail,
        score_stress_entrainement,
    } = req.body

    try {
        let seance = await Seance.findOne({
            titre: titre,
            _utilisateur: req.utilisateur._id,
        })
        const parametres = await ParametreStructure.findOne({
            _structure: req.utilisateur._id,
        })
        console.log(parametres)
        if (seance) {
            return res.status(400).json({
                error: `La séance ${titre} existe déjà`,
            })
        }
        let utilisateur = req.utilisateur._id

        seance = new Seance({
            titre,
            type,
            duree,
            estimation_distance,
            estimation_deniv,
            specifique,
            description,
            Z1,
            Z2,
            Z3,
            Z4,
            Z5,
            Z6,
            Z7,
            puissance_moyenne,
            charge_entrainement_estime,
            intensite_travail,
            score_stress_entrainement,
            _utilisateur: utilisateur,
            public: parametres ? parametres.seance.partage : true,
        })

        seance.save()

        return res
            .status(200)
            .json({ data: seance, msg: 'Séance créée avec succès.' })
    } catch (e) {
        res.status(500).json({ error: 'Une erreur est survenue', e })
    }
}

/**
 * @route GET api/seance
 * @description Permet de récupérer une séances avec son id
 */
exports.getSeanceById = async (req, res) => {
    const seance_id = new mongo.ObjectID(req.params.id)
    const seance = await Seance.findOne({ _id: seance_id })

    return res.status(200).json({ data: seance })
}

/**
 * @route GET api/seance
 * @description Permet de récupérer des séances avec leur type
 */
exports.getSeanceByType = async (req, res) => {
    const type = req.body.type
    let seances = await Seance.find({ type: { $in: type } })

    return res
        .status(200)
        .json({ data: { seances }, msg: 'Séances de même type récupérées' })
}

/**
 * @route GET api/seance
 * @description Permet de récupérer toutes les séances
 */
exports.getAllSeance = async (req, res) => {
    try {
        if (req.utilisateur.type !== 'Admin') {
            const seances = await Seance.find({ public: { $ne: false } })
            return res.status(200).json({
                data: seances,
                msg: 'Toutes les séances sont récupérées',
            })
        } else {
            const seances = await Seance.find({})
            return res.status(200).json({
                data: seances,
                msg: 'Toutes les séances sont récupérées',
            })
        }
    } catch (e) {
        return res.status(200).json({ error: 'Network error' })
    }
}

/**
 * @route PUT api/seance
 * @description Permet de modifier une seance d'entrainement
 */
exports.putSeance = async (req, res) => {
    let {
        titre,
        type,
        duree,
        estimation_distance,
        estimation_deniv,
        specifique,
        description,
        Z1,
        Z2,
        Z3,
        Z4,
        Z5,
        Z6,
        Z7,
        puissance_moyenne,
        charge_entrainement_estime,
        intensite_travail,
        score_stress_entrainement,
    } = req.body

    try {
        const utilisateur = req.utilisateur._id
        let seance = await Seance.findOneAndUpdate(
            {
                _id: req.params.id,
                _utilisateur: utilisateur,
            },
            {
                $set: {
                    titre,
                    type,
                    duree,
                    estimation_distance,
                    estimation_deniv,
                    specifique,
                    description,
                    Z1,
                    Z2,
                    Z3,
                    Z4,
                    Z5,
                    Z6,
                    Z7,
                    puissance_moyenne,
                    charge_entrainement_estime,
                    intensite_travail,
                    score_stress_entrainement,
                },
            }
        )
        if (!seance) {
            return res.status(400).json({
                error: `La séance n'existe pas.`,
            })
        }

        return res
            .status(200)
            .json({ data: seance, msg: 'Séance créée avec succès.' })
    } catch (e) {
        res.status(500).json({ error: 'Une erreur est survenue', e })
    }
}
