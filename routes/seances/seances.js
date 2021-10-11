/**
 * @import Modules
 */
const express = require('express')
const router = express.Router()
const { check } = require('express-validator')
const { jwtauth } = require('../../middlewares/auth.middleware')
/**
 * @import Models
 */
const Seance = require('../../models/Seance')
const Plan = require('../../models/Plan')

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
router.post('/', [jwtauth], async (req, res) => {
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
        })

        seance.save()

        return res
            .status(200)
            .json({ data: seance, msg: 'Séance créée avec succès.' })
    } catch (e) {
        res.status(400).json({ error: 'Une erreur est survenue', e })
    }
})

/**
 * @route POST api/seance/ancien
 * @description Permet de créer une seance d'entrainement
 */
router.post(
    '/ancien',
    [
        check('type', 'Le type est une chaine de caractère').isString(),
        check('duree', 'La duree est au format "hh:mm:ss"').isString(),
        check('estimation_distance', 'La distance est en chiffre').isNumeric(),
        check('estimation_deniv', 'Le deniv est en chiffre').isNumeric(),
        check('specifique', 'Le spécifique est un array').isArray(),
        check('description', 'La description est un string').isString(),
        check('Z1', 'Temps en zone est en minutes').isString(),
        check('Z2', 'Temps en zone est en minutes').isString(),
        check('Z3', 'Temps en zone est en minutes').isString(),
        check('Z4', 'Temps en zone est en minutes').isString(),
        check('Z5', 'Temps en zone est en minutes').isString(),
        check('Z6', 'Temps en zone est en minutes').isString(),
        check('Z7', 'Temps en zone est en minutes').isString(),
        check('puissance_moyenne', 'en poucentage').isFloat(),
        jwtauth,
    ],
    async (req, res) => {
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
        } = req.body

        if (duree.length == 5) {
            duree += ':00'
        }

        puissance_moyenne = puissance_moyenne / 100
        const charge_entrainement_estime = Math.round(
            ((conversion_minute(duree) * 60 * puissance_moyenne) / 3600) * 100
        )

        const intensite_travail = Math.round(
            conversion_minute(duree) * puissance_moyenne +
                (conversion_minute(Z1) / conversion_minute(duree) +
                    conversion_minute(Z2) / conversion_minute(duree) +
                    conversion_minute(Z3) / conversion_minute(duree) +
                    conversion_minute(Z4) / conversion_minute(duree) +
                    conversion_minute(Z5) / conversion_minute(duree) +
                    conversion_minute(Z6) / conversion_minute(duree) +
                    conversion_minute(Z7) / conversion_minute(duree)) *
                    100
        )

        const score_stress_entrainement =
            (charge_entrainement_estime + intensite_travail) / 2

        try {
            let seance = await Seance.findOne({ titre: titre })
            if (seance) {
                return res.status(400).json({
                    erros: [{ msg: `La séance ${titre} existe déjà` }],
                })
            }

            let precedent = []
            let reps = []
            for (let i = 0; i < specifique.length; i++) {
                let rep = 1
                if (precedent.length > 1) {
                    if (specifique[i] == precedent[precedent.length - 2]) {
                        rep = reps[precedent.length - 2] + rep
                        reps[precedent.length - 2] = rep
                    } else if (
                        specifique[i] == precedent[precedent.length - 1]
                    ) {
                        rep = reps[precedent.length - 1] + rep
                        reps[precedent.length - 1] = rep
                    } else {
                        precedent.push(specifique[i])
                        reps.push(rep)
                    }
                } else {
                    precedent.push(specifique[i])
                    reps.push(rep)
                }
            }

            let specifique_description = precedent.map((serie, i) => {
                if (i != precedent.length - 1) {
                    if (reps[i] == reps[i + 1] && reps[i] != 1) {
                        return `<li key={${i}}>
                ${reps[i]} x ${serie}
              </li>`
                    }
                }
                if (i != 0) {
                    if (reps[i] == reps[i - 1] && reps[i] != 1) {
                        return `<li key={${i}} className='ml-6'>
                ${serie}
              </li>`
                    }
                }
                return `<li key={${i}}>${serie}</li>`
            })

            let utilisateur = req.utilisateur._id

            seance = new Seance({
                titre,
                type,
                duree,
                estimation_distance,
                estimation_deniv,
                specifique,
                description,
                specifique_description,
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
            })

            seance.save()

            return res.status(200).json({ data: seance })
        } catch (e) {
            res.status(400).send(e)
        }
    }
)

/**
 * @route GET api/seance
 * @description Permet de récupérer une séances avec son id
 */
router.get('/id/:id', [jwtauth], async (req, res) => {
    var mongo = require('mongodb')
    var seance_id = new mongo.ObjectID(req.params.id)
    const seance = await Seance.findOne({ _id: seance_id })

    return res.status(200).json({ data: seance })
})

/**
 * @route GET api/seance
 * @description Permet de récupérer une séances avec sa date
 */
router.get('/date/:date', [jwtauth], async (req, res) => {
    const date = req.params.date
    const plan = await Plan.find({ _utilisateur: req.utilisateur._id })
    let seance

    for (let i = 0; i < plan[0].SeancesDefinies.length; i++) {
        if (plan[0].SeancesDefinies[i][1] == date) {
            seance = plan[0].SeancesDefinies[i]
        }
    }

    return res.status(200).json({ data: seance, msg: 'seance by date' })
})

/**
 * @route GET api/seance
 * @description Permet de récupérer des séances avec leur type
 */
router.get('/type', [jwtauth], async (req, res) => {
    const type = req.body.type
    let seances = await Seance.find({ type: { $in: type } })

    return res
        .status(200)
        .json({ data: { seances }, msg: 'Séances de même type récupérées' })
})

/**
 * @route GET api/seance
 * @description Permet de récupérer toutes les séances
 */
router.get('/', [jwtauth], async (req, res) => {
    try {
        const seances = await Seance.find({})
        return res.status(200).json({
            data: { seances },
            msg: 'Toutes les séances sont récupérées',
        })
    } catch (e) {
        return res.status(200).json({ error: 'Network error' })
    }
})

module.exports = router
