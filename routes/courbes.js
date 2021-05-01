/**
 * @import Modules
 */
const express = require('express')
const router = express.Router()
const dayjs = require('dayjs')
/**
 * @import Models
 */
const CourbePrev = require('../models/CourbesPrev')
const CourbeRea = require('../models/CourbesRea')
const Entrainement = require('../models/Entrainement')
const Plan = require('../models/Plan')

/**
 * @route GET /api/courbes/:userId/
 * @description Récupérations des courbes
 */
router.get('/:userId', async (req, res) => {
    const courbesPrev = await CourbePrev.findOne({
        _utilisateur: req.params.userId,
    })
    const courbesRea = await CourbeRea.findOne({
        _utilisateur: req.params.userId,
    })

    return res
        .status(200)
        .json({ data: { courbesPrev, courbesRea }, msg: 'Courbes récupérées' })
})

/**
 * @route POST /api/courbes/:userId/create
 * @description Création des courbes
 */
router.post('/:userId/create', async (req, res) => {
    try {
        const utilisateur = req.params.userId
        const plans = await Plan.find({ _utilisateur: utilisateur })
        let forme = []
        let fatigue = []
        let tss = []
        let labels = []

        for (let i = 0; i < plans.length; i++) {
            let seances_definies = plans[i].SeancesDefinies

            for (let j = 0; j < seances_definies.length; j++) {
                const seance = seances_definies[j]
                labels.push(dayjs(seance[1]).format('MM/DD/YYYY'))

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
                forme.push(
                    moyenneArray(
                        tss_forme.slice(tss_forme.length - 42, tss_forme.length)
                    )
                )
                tss_fatigue = tss.concat(tss_fatigue)
                fatigue.push(
                    moyenneArray(
                        tss_fatigue.slice(
                            tss_fatigue.length - 7,
                            tss_fatigue.length
                        )
                    )
                )
            }
        }

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

        let rea = new Array(labels.length).fill(0)

        let courbesRea = await CourbeRea.findOne({ _utilisateur: utilisateur })

        if (!courbesRea) {
            courbesRea = new CourbeRea({
                _utilisateur: utilisateur,
                forme: rea,
                fatigue: rea,
                labels: labels,
            })
        }

        courbesPrev.save()
        courbesRea.save()

        return res
            .status(200)
            .json({ data: { courbesPrev, courbesRea }, msg: 'Courbes créées' })
    } catch (e) {
        console.log(e)
        return res.status(200).json({ error: 'Erreur serveur' })
    }
})

/**
 * @route POST /api/courbes/:userId/realise
 * @description Modification des courbes réalisés
 */
router.post('/:userId/realise', async (req, res) => {
    try {
        const utilisateur = req.params.userId

        // courbes stocké
        let courbesRea = await CourbeRea.findOne({
            _utilisateur: utilisateur,
        })
        let forme = courbesRea.forme
        let fatigue = courbesRea.fatigue
        let labels = courbesRea.labels

        // entrainements
        let entrainements = await Entrainement.find({
            _utilisateur: utilisateur,
        })
        let date_entrainements = []
        let date_min = dayjs()

        for (let i = 0; i < entrainements.length; i++) {
            date_entrainements.push(
                dayjs(entrainements[i].date).format('MM/DD/YYYY')
            )
            if (dayjs(entrainements[i].date).isBefore(date_min)) {
                date_min = dayjs(entrainements[i].date).format('MM/DD/YYYY')
            }
        }

        // Entrainement avant les entrainements déjà enregistré
        if (dayjs(date_min).isBefore(dayjs(labels[0]))) {
            let diff = dayjs(labels[0]).diff(dayjs(date_min), 'day')
            let newLabels = []
            let newRea = new Array(diff).fill(0)

            for (let i = 0; i < diff; i++) {
                let date = dayjs(date_min).add(i, 'day')
                newLabels.push(date.format('MM/DD/YYYY'))
            }

            labels = newLabels.concat(labels)
            forme = newRea.concat(forme)
            fatigue = newRea.concat(fatigue)
        }

        let tss = []
        for (let i = 0; i < labels.length; i++) {
            let date = dayjs(labels[i]).format('MM/DD/YYYY')
            labels[i] = dayjs(labels[i]).format('MM/DD/YYYY')

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
            forme[i] = moyenneArray(
                tss_forme.slice(tss_forme.length - 42, tss_forme.length)
            )

            // Fatigue
            tss_fatigue = tss.concat(tss_fatigue)
            fatigue[i] = moyenneArray(
                tss_fatigue.slice(tss_fatigue.length - 7, tss_fatigue.length)
            )
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
 * @route POST /api/courbes/:userId/previsionnelle
 * @description Modifications des courbes prévisionnelles
 */
router.post('/:userId/previsionnelle', async (req, res) => {
    try {
        const utilisateur = req.params.userId
        const plans = await Plan.find({ _utilisateur: utilisateur })
        let forme = []
        let fatigue = []
        let tss = []
        let labels = []

        for (let i = 0; i < plans.length; i++) {
            let seances_definies = plans[i].SeancesDefinies

            for (let j = 0; j < seances_definies.length; j++) {
                const seance = seances_definies[j]
                labels.push(dayjs(seance[1]).format('MM/DD/YYYY'))

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
                forme.push(
                    moyenneArray(
                        tss_forme.slice(tss_forme.length - 42, tss_forme.length)
                    )
                )
                tss_fatigue = tss.concat(tss_fatigue)
                fatigue.push(
                    moyenneArray(
                        tss_fatigue.slice(
                            tss_fatigue.length - 7,
                            tss_fatigue.length
                        )
                    )
                )
            }
        }

        let courbesPrev = await CourbePrev.findOneAndUpdate(
            {
                _utilisateur: utilisateur,
            },
            { $set: { forme: forme, fatigue: fatigue, labels: labels } },
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
