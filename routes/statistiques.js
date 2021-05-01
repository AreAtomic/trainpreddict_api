/**
 * @import Modules
 */
const express = require('express')
const router = express.Router()
const dayjs = require('dayjs')
var weekOfYear = require('dayjs/plugin/weekOfYear')
dayjs.extend(weekOfYear)
/**
 * @import Models
 */
const Entrainement = require('../models/Entrainement.js')
const Statistiques = require('../models/Statistiques.js')

const toHoursInt = (duree) => {
    var hours = parseInt(duree.substr(0, 2))
    const minutes = parseFloat(parseInt(duree.substr(3, 5)) / 60).toPrecision(1)
    hours = Math.round(parseFloat(hours) + parseFloat(minutes))
    return hours
}

/**
 * @route api/donneesUtilisateur
 * @description Permet de créer un plan d'entrainement pour l'utilisateur 
 */
router.post('/:userId', async (req, res) => {
    try {
        const entrainements = await Entrainement.find({
            _utilisateur: req.params.userId,
        })
        const date = dayjs()
        var kilometres_total = 0
        var kilometres_ans = 0
        var kilometres_mois = 0
        var kilometres_semaine = 0
        var heures_total = 0
        var heures_ans = 0
        var heures_mois = 0
        var heures_semaine = 0
        var sorties_total = entrainements.length
        var sorties_ans = 0
        var sorties_mois = 0
        var sorties_semaine = 0

        for (let i = 0; i < entrainements.length; i++) {
            let date_entrainement = dayjs(entrainements[i].date)
            kilometres_total += parseInt(entrainements[i].distance)
            heures = toHoursInt(entrainements[i].duree)
            heures_total += heures

            if (date_entrainement.year() == date.year()) {
                kilometres_ans += parseInt(entrainements[i].distance)
                heures_ans += heures
                sorties_ans += 1

                if (date_entrainement.month() == date.month()) {
                    kilometres_mois += parseInt(entrainements[i].distance)
                    heures_mois += heures
                    sorties_mois += 1

                    if (dayjs(date_entrainement).week() == dayjs(date).week()) {
                        kilometres_semaine += parseInt(
                            entrainements[i].distance
                        )
                        heures_semaine += heures
                        sorties_semaine += 1
                    }
                }
            }
        }

        const statistiques = await Statistiques.findOneAndUpdate(
            { _utilisateur: req.params.userId },
            {
                $set: {
                    // Total depuis utilisation appli
                    total_kilometres: kilometres_total,
                    total_heures: heures_total,
                    total_sorties: sorties_total,
                    // Total sur l'année
                    an_kilometres: kilometres_ans,
                    an_heures: heures_ans,
                    an_sorties: sorties_ans,
                    // Total sur le mois
                    mois_kilometres: kilometres_mois,
                    mois_heures: heures_mois,
                    mois_sorties: sorties_mois,
                    // Semaine
                    semaine_kilometres: kilometres_semaine,
                    semaine_heures: heures_semaine,
                    semaine_sorties: sorties_semaine,
                },
            },
            { new: true, upsert: true }
        )

        return res
            .status(200)
            .json({ data: statistiques, msg: `Donnée mises à jour` })
    } catch (error) {
        console.log(error)
        return res.status(200).json({ error: 'Server error' })
    }
})

module.exports = router
