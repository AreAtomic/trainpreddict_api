/**
 * @import Modules
 */
const express = require('express')
const router = express.Router()
const dayjs = require('dayjs')
const dayOfYear = require('dayjs/plugin/dayOfYear')
dayjs.extend(dayOfYear)
const { jwtauth } = require('../middlewares/auth.middleware')

/**
 * @import Models
 */
const CourbePrev = require('../models/CourbesPrev')
const CourbeRea = require('../models/CourbesRea')
const Entrainement = require('../models/Entrainement')
const Plan = require('../models/Plan')

/**
 * @route GET /api/courbes/
 * @description Récupérations des courbes
 */
router.get('/', [jwtauth], async (req, res) => {
    const courbesPrev = await CourbePrev.findOne({
        _utilisateur: req.utilisateur._id,
    })
    const courbesRea = await CourbeRea.findOne({
        _utilisateur: req.utilisateur._id,
    })

    return res
        .status(200)
        .json({ data: { courbesPrev, courbesRea }, msg: 'Courbes récupérées' })
})

/**
 * @route POST /api/courbes/previsionnelle
 * @description Création des courbes
 */
router.post('/previsionnelle', [jwtauth], async (req, res) => {
    try {
        const utilisateur = req.utilisateur._id
        const plans = await Plan.find({ _utilisateur: utilisateur })
        let forme = []
        let fatigue = []
        let tss = []
        let labels = []

        // Création des labels et des courbes de 2000 à 2100
        for (let i = 2000; i < 2101; i++) {
            let days = []
            let array_year = []
            let lastday = dayjs(`${i}-12-31`).dayOfYear()

            for (let j = 1; j < lastday; j++) {
                days.push(dayjs(`${i}-01-01`).dayOfYear(j).format('MM/DD/YYYY'))
                array_year.push(0)
            }
            forme.push(array_year)
            fatigue.push(array_year)
            labels.push(days)
        }

        // Rajout des données des plans dans les courbes
        for (let i = 0; i < plans.length; i++) {
            let seances_definies = plans[i].SeancesDefinies

            for (let j = 0; j < seances_definies.length; j++) {
                const seance = seances_definies[j]
                let year = dayjs(seance[1]).year() - 2000
                let day = dayjs(seance[1]).dayOfYear()

                if (typeof seance[0] != 'string') {
                    tss.push(seance[0].score_stress_entrainement)
                } else if (seance[0] == 'repos') {
                    tss.push(0)
                } else if (seance[0] == 'musculation') {
                    tss.push(50)
                } else if (seance[0] == 'course à pied') {
                    tss.push(75)
                }

                let tss_forme = []
                let tss_fatigue = []
                if (tss.length < 42) {
                    tss_forme = new Array(42 - tss.length).fill(0)
                    if (tss.length < 7) {
                        tss_fatigue = new Array(7 - tss.length).fill(0)
                    }
                }
                tss_forme = tss.concat(tss_forme)
                forme[year][day] = moyenneArray(
                    tss_forme.slice(tss_forme.length - 42, tss_forme.length)
                )
                tss_fatigue = tss.concat(tss_fatigue)
                fatigue[year][day] = moyenneArray(
                    tss_fatigue.slice(
                        tss_fatigue.length - 7,
                        tss_fatigue.length
                    )
                )
            }
        }

        // Update de la bdd
        let courbesPrev = await CourbePrev.findOneAndUpdate(
            { _utilisateur: utilisateur },
            { $set: { forme: forme, fatigue: fatigue, labels: labels } },
            { new: true, upsert: true }
        )

        if (!courbesPrev) {
            courbesPrev = new CourbePrev({
                _utilisateur: utilisateur,
                forme: forme,
                fatigue: fatigue,
                labels: labels,
            })
        }

        courbesPrev.save()

        return res
            .status(200)
            .json({ data: { courbesPrev }, msg: 'Courbes créées' })
    } catch (e) {
        console.log(e)
        return res.status(200).json({ error: 'Erreur serveur' })
    }
})

/**
 * @route POST /api/courbes/realise
 * @description Création des courbes
 */
router.post('/realise', [jwtauth], async (req, res) => {
    try {
        const utilisateur = req.utilisateur._id
        let forme = []
        let fatigue = []
        let labels = []

        // Création des labels et des courbes de 2000 à 2100
        for (let i = 2000; i < 2101; i++) {
            let days = []
            let array_year = []
            let lastday = dayjs(`${i}-12-31`).dayOfYear()

            for (let j = 1; j < lastday; j++) {
                days.push(dayjs(`${i}-01-01`).dayOfYear(j).format('MM/DD/YYYY'))
                array_year.push(0)
            }
            forme.push(array_year)
            fatigue.push(array_year)
            labels.push(days)
        }

        let courbesRea = await CourbeRea.findOne({ _utilisateur: utilisateur })

        if (!courbesRea) {
            courbesRea = new CourbeRea({
                _utilisateur: utilisateur,
                forme: forme,
                fatigue: fatigue,
                labels: labels,
            })
        }

        courbesRea.save()

        return res
            .status(200)
            .json({ data: { courbesRea }, msg: 'Courbes créées' })
    } catch (e) {
        console.log(e)
        return res.status(200).json({ error: 'Erreur serveur' })
    }
})

/**
 * @route PUT /api/courbes/realise
 * @description Modification des courbes réalisés
 */
router.put('/realise', [jwtauth], async (req, res) => {
    try {
        const utilisateur = req.utilisateur._id

        // Récup des courbes stocké
        let courbesRea = await CourbeRea.findOne({
            _utilisateur: utilisateur,
        })
        let forme = courbesRea.forme
        let fatigue = courbesRea.fatigue
        let labels = courbesRea.labels
        let today = dayjs()

        // Récup des entrainements
        let entrainements = await Entrainement.find({
            _utilisateur: utilisateur,
        })

        // Récu pdes dates pour comparaison avec label
        let date_entrainements = []
        for (let e = 0; e < entrainements.length; e++) {
            date_entrainements.push(entrainements[e].date.split('T')[0])
        }

        let tss = []
        for (let j = 0; j < today.year() - 1999; j++) {
            for (let i = 0; i < labels[j].length; i++) {
                let date = dayjs(labels[j][i])
                    .set('hour', 22)
                    .toISOString()
                    .split('T')[0]
                console.log(date)

                if (date_entrainements.indexOf(date) != -1) {
                    tss.push(
                        entrainements[date_entrainements.indexOf(date)]
                            .score_stress_entrainement
                    )
                } else {
                    tss.push(0)
                }

                let tss_forme = []
                let tss_fatigue = []
                if (tss.length < 42) {
                    tss_forme = new Array(42 - tss.length).fill(0)
                    if (tss.length < 7) {
                        tss_fatigue = new Array(7 - tss.length).fill(0)
                    }
                }

                // Forme
                tss_forme = tss.concat(tss_forme)
                forme[j][i] = moyenneArray(
                    tss_forme.slice(tss_forme.length - 42, tss_forme.length)
                )

                // Fatigue
                tss_fatigue = tss.concat(tss_fatigue)
                fatigue[j][i] = moyenneArray(
                    tss_fatigue.slice(
                        tss_fatigue.length - 7,
                        tss_fatigue.length
                    )
                )
            }
        }
        courbesRea = await CourbeRea.findOneAndUpdate(
            { _utilisateur: utilisateur },
            { $set: { forme: forme, fatigue: fatigue, labels: labels } },
            { new: true, upsert: true }
        )

        const courbesPrev = await CourbePrev.findOne({
            _utilisateur: utilisateur,
        })
        return res.status(200).json({
            data: { courbesPrev, courbesRea },
            msg: 'Courbes mise à jour',
        })
    } catch (e) {
        console.log(e)
        return res.status(200).json({ error: 'Erreur serveur' })
    }
})

/**
 * @route PUT /api/courbes/previsionnelle
 * @description Modifications des courbes prévisionnelles
 */
router.put('/previsionnelle', [jwtauth], async (req, res) => {
    try {
        const utilisateur = req.utilisateur._id
        const plans = await Plan.find({ _utilisateur: utilisateur })
        let courbePrev = await CourbePrev.findOne({ _utilisateur: utilisateur })
        let forme = courbePrev.forme
        let fatigue = courbePrev.fatigue
        let tss = []

        for (let i = 0; i < plans.length; i++) {
            let seances_definies = plans[i].SeancesDefinies

            for (let j = 0; j < seances_definies.length; j++) {
                const seance = seances_definies[j]
                let year = dayjs(seance[1]).year() - 2000
                let day = dayjs(seance[1]).dayOfYear()

                if (typeof seance[0] != 'string') {
                    tss.push(seance[0].score_stress_entrainement)
                } else if (seance[0] == 'repos') {
                    tss.push(0)
                } else if (seance[0] == 'musculation') {
                    tss.push(50)
                } else if (seance[0] == 'course à pied') {
                    tss.push(75)
                }

                let tss_forme = []
                let tss_fatigue = []
                if (tss.length < 42) {
                    tss_forme = new Array(42 - tss.length).fill(0)
                    if (tss.length < 7) {
                        tss_fatigue = new Array(7 - tss.length).fill(0)
                    }
                }
                tss_forme = tss.concat(tss_forme)
                forme[year][day] = moyenneArray(
                    tss_forme.slice(tss_forme.length - 42, tss_forme.length)
                )
                tss_fatigue = tss.concat(tss_fatigue)
                fatigue[year][day] = moyenneArray(
                    tss_fatigue.slice(
                        tss_fatigue.length - 7,
                        tss_fatigue.length
                    )
                )
            }
        }

        let courbesPrev = await CourbePrev.findOneAndUpdate(
            {
                _utilisateur: utilisateur,
            },
            { $set: { forme: forme, fatigue: fatigue } },
            { new: true, upsert: true }
        )

        let courbesRea = await CourbeRea.findOne({ _utilisateur: utilisateur })

        return res.status(200).json({
            data: { courbesPrev, courbesRea },
            msg: 'Courbe mise à jour',
        })
    } catch (e) {
        console.log(e)
        return res.status(200).json({ error: 'Erreur serveur' })
    }
})

module.exports = router

moyenneArray = (arr) => {
    var nombres = arr.length,
        valeurs = 0,
        i
    for (i = 0; i < nombres; i++) {
        valeurs += Number(arr[i])
    }
    return parseInt(valeurs / nombres)
}
