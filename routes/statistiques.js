/**
 * @import Modules
 */
const express = require('express')
const router = express.Router()
const dayjs = require('dayjs')
const axios = require('axios')
let weekOfYear = require('dayjs/plugin/weekOfYear')
var isoWeeksInYear = require('dayjs/plugin/isoWeeksInYear')
var isLeapYear = require('dayjs/plugin/isLeapYear')
dayjs.extend(weekOfYear)
dayjs.extend(isoWeeksInYear)
dayjs.extend(isLeapYear)
const { jwtauth } = require('../middlewares/auth.middleware')

/**
 * @import Models
 */
const Entrainement = require('../models/Entrainement')
const Statistiques = require('../models/Statistiques')
const Utilisateur = require('../models/Utilisateur')
const { statSync } = require('fs')

const toHoursInt = (duree) => {
    let hours = parseInt(duree.substr(0, 2))
    const minutes = parseFloat(parseInt(duree.substr(3, 5)) / 60).toPrecision(1)
    hours = parseFloat(hours) + parseFloat(minutes)
    return hours
}

// Tri bulle
const sort = (tab) => {
    let changed = false
    do {
        for (let i = 0; i < tab.length - 1; i++) {
            if (dayjs(tab[i].date).isBefore(dayjs(tab[i + 1].date))) {
                let tmp = tab[i]
                tab[i] = tab[i + 1]
                tab[i + 1] = tmp
                changed = true
            }
        }
    } while (changed)
    return tab
}

/**
 * @route GET /api/statistiques/:userId
 * @description Récupère les statisques pour un utilisateur
 */
router.get('/', [jwtauth], async (req, res) => {
    try {
        const statistiques = await Statistiques.findOne({
            _utilisateur: req.utilisateur._id,
        })
        return res.status(200).json({
            data: statistiques,
            msg: 'Statstiques récupérées avec succès',
        })
    } catch (e) {
        console.log(e)
        return res.status(200).json({ error: 'Network error' })
    }
})

/**
 * @route POST /api/statistiques/:userId/initialisation
 * @description Initialise les statisques pour un utilisateur
 */
router.post('/:userId/initialisation', async (req, res) => {
    try {
        const utilisateur = await Utilisateur.findOne({
            _id: req.params.userId,
        })

        const month = {
            janvier: {
                kilometres: 0,
                heures: 0,
                sse: 0,
                nombre_entrainement: 0,
                gain_forme: +0,
            },
            fevrier: {
                kilometres: 0,
                heures: 0,
                sse: 0,
                nombre_entrainement: 0,
                gain_forme: +0,
            },
            mars: {
                kilometres: 0,
                heures: 0,
                sse: 0,
                nombre_entrainement: 0,
                gain_forme: +0,
            },
            avril: {
                kilometres: 0,
                heures: 0,
                sse: 0,
                nombre_entrainement: 0,
                gain_forme: +0,
            },
            mai: {
                kilometres: 0,
                heures: 0,
                sse: 0,
                nombre_entrainement: 0,
                gain_forme: +0,
            },
            juin: {
                kilometres: 0,
                heures: 0,
                sse: 0,
                nombre_entrainement: 0,
                gain_forme: +0,
            },
            juillet: {
                kilometres: 0,
                heures: 0,
                sse: 0,
                nombre_entrainement: 0,
                gain_forme: +0,
            },
            aout: {
                kilometres: 0,
                heures: 0,
                sse: 0,
                nombre_entrainement: 0,
                gain_forme: +0,
            },
            septembre: {
                kilometres: 0,
                heures: 0,
                sse: 0,
                nombre_entrainement: 0,
                gain_forme: +0,
            },
            octobre: {
                kilometres: 0,
                heures: 0,
                sse: 0,
                nombre_entrainement: 0,
                gain_forme: +0,
            },
            novembre: {
                kilometres: 0,
                heures: 0,
                sse: 0,
                nombre_entrainement: 0,
                gain_forme: +0,
            },
            decembre: {
                kilometres: 0,
                heures: 0,
                sse: 0,
                nombre_entrainement: 0,
                gain_forme: +0,
            },
        }

        const entrainement = []
        for (let i = 2000; i < 2100; i++) {
            let year = { [i]: { mois: month, semaines: {} } }
            let weeks = {}
            const weekofyear = dayjs(`${i}-01-01`).isoWeeksInYear()
            for (let j = 1; j <= weekofyear; j++) {
                weeks[`S${j}`] = {
                    kilometres: 0,
                    heures: 0,
                    sse: 0,
                    nombre_entrainement: 0,
                    gain_forme: +0,
                }
            }
            year[i].semaines = weeks
            entrainement.push(year)
        }

        const statistiques = new Statistiques({
            _utilisateur: utilisateur.id,
            entrainement: entrainement,
            reccord_20_minutes: 0,
            reccord_5_minutes: 0,
            reccord_1_minutes: 0,
            recourd_5_seconds: 0,
        })

        statistiques.save()

        return res
            .status(200)
            .json({ data: statistiques, msg: 'Statiques créée avec succès' })
    } catch (e) {
        return res.status(200).json({ error: 'Network error' })
    }
})

/**
 * @route POST /api/statistiques/:userId/updateOne
 * @description Met à jour les statisques pour un utilisateur
 */
router.post('/:userId/updateOne', async (req, res) => {
    try {
        const months = [
            'janvier',
            'fevrier',
            'mars',
            'avril',
            'mai',
            'juin',
            'juillet',
            'aout',
            'septembre',
            'octobre',
            'novembre',
            'decembre',
        ]
        let statistiques = await Statistiques.findOne({
            _utilisateur: req.params.userId,
        })

        // Récupération des données de l'entrainement
        const entrainement = await Entrainement.findOne({
            _id: req.body.entrainement,
        })

        const year = dayjs(entrainement.date).year()
        const month = months[dayjs(entrainement.date).month()]
        const week = dayjs(entrainement.date).week()

        // Entrainement du mois
        statistiques.entrainement[year - 2000][year].mois[
            month
        ].kilometres += parseInt(entrainement.distance)
        statistiques.entrainement[year - 2000][year].mois[
            month
        ].heures += toHoursInt(entrainement.duree)
        statistiques.entrainement[year - 2000][year].mois[
            month
        ].sse += parseInt(entrainement.score_stress_entrainement)
        statistiques.entrainement[year - 2000][year].mois[
            month
        ].nombre_entrainement += 1

        // Entrainement de la semaine
        statistiques.entrainement[year - 2000][year].semaines[
            `S${week}`
        ].kilometres += parseInt(entrainement.distance)
        statistiques.entrainement[year - 2000][year].semaines[
            `S${week}`
        ].heures += toHoursInt(entrainement.duree)
        statistiques.entrainement[year - 2000][year].semaines[
            `S${week}`
        ].sse += parseInt(entrainement.score_stress_entrainement)
        statistiques.entrainement[year - 2000][year].semaines[
            `S${week}`
        ].nombre_entrainement += 1

        statistiques.reccord_20_minutes =
            statistiques.reccord_20_minutes >= entrainement.max_20_mins
                ? statistiques.reccord_20_minutes
                : entrainement.max_20_mins

        statistiques.reccord_5_minutes =
            statistiques.reccord_5_minutes >= entrainement.max_5_mins
                ? statistiques.reccord_5_minutes
                : entrainement.max_5_mins

        statistiques.reccord_1_minutes =
            statistiques.reccord_1_minutes >= entrainement.max_1_min
                ? statistiques.reccord_1_minutes
                : entrainement.max_1_min

        statistiques.recourd_5_seconds =
            statistiques.recourd_5_seconds >= entrainement.max_5_secs
                ? statistiques.recourd_5_seconds
                : entrainement.max_5_secs

        // Mise à jour
        statistiques = await Statistiques.findOneAndUpdate(
            { _utilisateur: req.params.userId },
            { $set: { entrainement: statistiques.entrainement } },
            { upsert: true }
        )

        return res.status(200).json({
            data: statistiques,
            msg: 'Statstiques récupérées avec succès',
        })
    } catch (e) {
        console.log(e.toString())
        return res.status(200).json({ error: 'Network error' })
    }
})

/**
 * @route POST /api/statistiques/:userId
 * @description Mise à jour sur tous les entrainements
 */
router.post('/:userId', async (req, res) => {
    try {
        let entrainements = await Entrainement.find({
            _utilisateur: req.params.userId,
        })

        let statistiques = await Statistiques.findOne({
            _utilisateur: req.params.userId,
        })

        let max_20_mins = statistiques.reccord_20_minutes
        let max_5_mins = statistiques.reccord_5_minutes
        let max_1_min = statistiques.reccord_1_minutes
        let max_5_secs = statistiques.recourd_5_seconds

        for (let i = 0; i < entrainements.length; i++) {
            if (
                entrainements[i].statistiques == undefined ||
                entrainements[i].statistiques
            ) {
                const months = [
                    'janvier',
                    'fevrier',
                    'mars',
                    'avril',
                    'mai',
                    'juin',
                    'juillet',
                    'aout',
                    'septembre',
                    'octobre',
                    'novembre',
                    'decembre',
                ]
                statistiques = await Statistiques.findOne({
                    _utilisateur: req.params.userId,
                })

                // Récupération des données de l'entrainement
                const entrainement = entrainements[i]

                const year = dayjs(entrainement.date).year()
                const month = months[dayjs(entrainement.date).month()]
                const week = dayjs(entrainement.date).week()

                // Entrainement du mois
                statistiques.entrainement[year - 2000][year].mois[
                    month
                ].kilometres += parseInt(entrainement.distance)
                statistiques.entrainement[year - 2000][year].mois[
                    month
                ].heures += toHoursInt(entrainement.duree)
                statistiques.entrainement[year - 2000][year].mois[
                    month
                ].sse += parseInt(entrainement.score_stress_entrainement)
                statistiques.entrainement[year - 2000][year].mois[
                    month
                ].nombre_entrainement += 1

                // Entrainement de la semaine
                statistiques.entrainement[year - 2000][year].semaines[
                    `S${week}`
                ].kilometres += parseInt(entrainement.distance)
                statistiques.entrainement[year - 2000][year].semaines[
                    `S${week}`
                ].heures += toHoursInt(entrainement.duree)
                statistiques.entrainement[year - 2000][year].semaines[
                    `S${week}`
                ].sse += parseInt(entrainement.score_stress_entrainement)
                statistiques.entrainement[year - 2000][year].semaines[
                    `S${week}`
                ].nombre_entrainement += 1

                // Récup des stats des reccord d'entrainements
                if (entrainement.tableau_statistiques.max_20_mins[0] != null) {
                    max_20_mins =
                        statistiques.reccord_20_minutes >=
                        entrainement.tableau_statistiques.max_20_mins[0]
                            ? statistiques.reccord_20_minutes
                            : entrainement.tableau_statistiques.max_20_mins[0]

                    max_5_mins =
                        statistiques.reccord_5_minutes >=
                        entrainement.tableau_statistiques.max_5_mins[0]
                            ? statistiques.reccord_5_minutes
                            : entrainement.tableau_statistiques.max_5_mins[0]

                    max_1_min =
                        statistiques.reccord_1_minutes >=
                        entrainement.tableau_statistiques.max_1_min[0]
                            ? statistiques.reccord_1_minutes
                            : entrainement.tableau_statistiques.max_1_min[0]

                    max_5_secs =
                        statistiques.recourd_5_seconds >=
                        entrainement.tableau_statistiques.max_5_secs[0]
                            ? statistiques.recourd_5_seconds
                            : entrainement.tableau_statistiques.max_5_secs[0]
                }

                // Mise à jour
                statistiques = await Statistiques.findOneAndUpdate(
                    { _utilisateur: req.params.userId },
                    {
                        $set: {
                            entrainement: statistiques.entrainement,
                            reccord_20_minutes: max_20_mins,
                            reccord_5_minutes: max_5_mins,
                            reccord_1_minutes: max_1_min,
                            recourd_5_seconds: max_5_secs,
                        },
                    },
                    { upsert: true }
                )

                let entrainement_uptated = await Entrainement.findOneAndUpdate(
                    { _id: entrainement.id },
                    { $set: { statistiques: true } },
                    { upsert: true }
                )
            }
        }

        return res.status(200).json({
            data: statistiques,
            msg: 'Statstiques récupérées avec succès',
        })
    } catch (e) {
        console.log(e)
        return res.status(200).json({ error: e.toString() })
    }
})

module.exports = router
