/**
 * @import Modules
 */
const express = require('express')
const router = express.Router()
const dayjs = require('dayjs')
let weekOfYear = require('dayjs/plugin/weekOfYear')
var isoWeeksInYear = require('dayjs/plugin/isoWeeksInYear')
var isLeapYear = require('dayjs/plugin/isLeapYear')
dayjs.extend(weekOfYear)
dayjs.extend(isoWeeksInYear)
dayjs.extend(isLeapYear)
/**
 * @import Models
 */
const Entrainement = require('../models/Entrainement')
const Statistiques = require('../models/Statistiques')
const Utilisateur = require('../models/Utilisateur')

const toHoursInt = (duree) => {
    let hours = parseInt(duree.substr(0, 2))
    const minutes = parseFloat(parseInt(duree.substr(3, 5)) / 60).toPrecision(1)
    hours = Math.round(parseFloat(hours) + parseFloat(minutes))
    return hours
}

/**
 * @route /api/statistiques/:userId
 * @description Initialise les statisques pour tous les utilisateurs
 */
router.post('/:userId', async (req, res) => {
    try {
        const utilisateur = await Utilisateur.findOne({
            _id: req.params.userId,
        })

        console.log(utilisateur)

        const month = {
            janvier: {
                kilometres: 0,
                heures: 0,
                sse: 0,
                gain_forme: +0,
            },
            février: {
                kilometres: 0,
                heures: 0,
                sse: 0,
                gain_forme: +0,
            },
            mars: {
                kilometres: 0,
                heures: 0,
                sse: 0,
                gain_forme: +0,
            },
            avril: {
                kilometres: 0,
                heures: 0,
                sse: 0,
                gain_forme: +0,
            },
            mai: {
                kilometres: 0,
                heures: 0,
                sse: 0,
                gain_forme: +0,
            },
            juin: {
                kilometres: 0,
                heures: 0,
                sse: 0,
                gain_forme: +0,
            },
            juillet: {
                kilometres: 0,
                heures: 0,
                sse: 0,
                gain_forme: +0,
            },
            aout: {
                kilometres: 0,
                heures: 0,
                sse: 0,
                gain_forme: +0,
            },
            septembre: {
                kilometres: 0,
                heures: 0,
                sse: 0,
                gain_forme: +0,
            },
            octobre: {
                kilometres: 0,
                heures: 0,
                sse: 0,
                gain_forme: +0,
            },
            novembre: {
                kilometres: 0,
                heures: 0,
                sse: 0,
                gain_forme: +0,
            },
            decembre: {
                kilometres: 0,
                heures: 0,
                sse: 0,
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

module.exports = router
