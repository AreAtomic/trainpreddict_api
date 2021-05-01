/**
 * @import Modules
 */
const express = require('express')
const router = express.Router()
/**
 * @import Models
 */
const ExerciceMusculation = require('../models/ExerciceMusculation')
const SeanceMusculation = require('../models/SeanceMusculation')

/**
 * @route post api/auth/login
 * @description Authentification et création d'un token pour l'utilisateur
 */
router.post('/exercice', async (req, res) => {
    const { nom, repetitions, series, recup, description, url } = req.body

    try {
        let exercice = await ExerciceMusculation.find({ nom: nom })
        console.log(exercice.length)
        if (exercice.length != 0) {
            return res.status(200).json({ error: "L'exercice existe déjà" })
        }

        exercice = new ExerciceMusculation({
            nom,
            repetitions,
            series,
            recup,
            description,
            url,
        })

        exercice.save()

        return res.status(200).json({
            data: exercice,
            msg: 'Exercice créé',
        })
    } catch (err) {
        res.status(500).json({ error: 'Serveur erreur' })
    }
})

/**
 * @route POST api/auth/signup
 * @desccription Register utilisateur
 */
router.post('/seance', async (req, res) => {
    const { nom, exercices, description, score_stress_entrainement } = req.body

    try {
        let seance = SeanceMusculation.find({ nom: nom })

        if (seance != []) {
            return res.status(200).json({ error: 'La séance existe déjà' })
        }

        seance = new SeanceMusculation({
            nom,
            exercices,
            description,
            score_stress_entrainement,
        })

        return res
            .status(200)
            .json({ data: seance, msg: 'Utilisateur créé avec succés' })
    } catch (err) {
        return res.status(200).json({ error: 'Server error' })
    }
})

module.exports = router
