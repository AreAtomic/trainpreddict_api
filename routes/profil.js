/**
 * @import Modules
 */
const express = require('express')
const router = express.Router()
const { validationResult } = require('express-validator')
/**
 * @import Models
 */
const Profil = require('../models/Profil')
const Utilisateur = require('../models/Utilisateur')
const InfoSup = require('../models/InfoSup')

/**
 * @route post /api/profil
 * @description création du profil
 * */
router.post('/:userId', async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(200).json({ error: "Le formulaire n'est pas valide" })
    }

    const { fcfs, pfs, poids } = req.body
    let age = 14
    if (req.body.age) {
        age = req.body.age
    } else {
        const infoSup = await InfoSup.findOne({ _utilisateur: req.params.userId })
        age = Math.abs(dayjs(infoSup.naissance).diff(dayjs()))
    }

    const profilInfo = {
        fcfs,
        pfs,
        age,
        poids,
    }
    try {
        // Using upsert option (creates new doc if no match is found):
        let profil = await Profil.findOneAndUpdate(
            { _utilisateur: req.params.userId },
            { $set: profilInfo },
            { new: true, upsert: true }
        )
        return res.status(200).json({ data: profil, msg: 'Profil modifié' })
    } catch (err) {
        return res.status(200).json({ error: "Le formulaire n'est pas valide" })
    }
})

/**
 * @route post /api/profil/:id
 * @description Permet la récupération du profil de l'utilisateur
 */
router.get('/:userId', async (req, res) => {
    const profil = await Profil.findOne({ _utilisateur: req.params.userId })
    return res.status(200).json({ data: profil, msg: 'Profil récupéré' })
})

/**
 * @route get /api/profil/modification/utilisateur
 * @description permet de corriger le profil de l'utilisateur
 */
router.get('/modfication/utilisateur', async (req, res) => {
    try {
        const utilisateurs = await Utilisateur.find({})
        for (let i = 0; i < utilisateurs.length; i++) {
            let profil = await Profil.findOne({
                _utilisateur: utilisateurs[i]._id,
            })

            if (!profil) {
                profil = new Profil({
                    _utilisateur: utilisateurs[i].id,
                })

                profil.save()
            }

            console.log(profil)
        }

        return res.status(200).json({ msg: 'Profils utilisateurs corrigés' })
    } catch (e) {
        return res
            .status(200)
            .json({ error: 'Une erreur serveur est survenue' })
    }
})

module.exports = router
