/**
 * @import Modules
 */
const express = require('express')
const router = express.Router()
const { validationResult } = require('express-validator')
const dayjs = require('dayjs')
/**
 * @import Models
 */
const Profil = require('../models/Profil')
const Utilisateur = require('../models/Utilisateur')
const InfoSup = require('../models/InfoSup')
const { jwtauth } = require('../middlewares/auth.middleware')

/**
 * @route POST /api/profil
 * @description création du profil
 * */
router.post('/', [jwtauth], async (req, res) => {
    try {
        const { fcfs, pfs, poids } = req.body

        let age = 14
        if (req.body.age) {
            age = req.body.age
        } else {
            const infoSup = await InfoSup.findOne({
                _utilisateur: req.utilisateur._id,
            })
            age = Math.abs(dayjs(infoSup.naissance).diff(dayjs(), 'year'))
        }

        const profilInfo = {
            fcfs,
            pfs,
            age,
            poids,
        }

        let profil = await Profil.findOneAndUpdate(
            { _utilisateur: req.utilisateur._id },
            { $set: profilInfo },
            { new: true, upsert: true }
        )
        return res.status(200).json({ data: profil, msg: 'Profil modifié' })
    } catch (err) {
        return res.status(400).json({ error: err.message })
    }
})

/**
 * @route GET /api/profil/:id
 * @description Permet la récupération du profil de l'utilisateur
 */
router.get('/', [jwtauth], async (req, res) => {
    try {
        const infoSup = await InfoSup.findOne({
            _utilisateur: req.utilisateur._id,
        })
        const age = Math.abs(dayjs(infoSup.naissance).diff(dayjs(), 'year'))
        console.log(infoSup.naissance)
        const profil = await Profil.findOneAndUpdate(
            { _utilisateur: req.utilisateur._id },
            { $set: { age: age } },
            { new: true, upsert: true }
        )
        return res.status(200).json({ data: profil, msg: 'Profil récupéré' })
    } catch (err) {
        return res.status(400).json({ error: err.message })
    }
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
        }

        return res.status(200).json({ msg: 'Profils utilisateurs corrigés' })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
})

module.exports = router
