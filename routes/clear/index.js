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
const Profil = require('../../models/Profil')
const Utilisateur = require('../../models/Utilisateur')
const InfoSup = require('../../models/InfoSup')
const { jwtauth } = require('../../middlewares/auth.middleware')

/**
 * @route POST /api/clear/profil
 * @description Supprime les profils sans utilisateurs
 * */
router.post('/', async (req, res) => {
    try {
        let profil = await Profil.find({})
        profil.forEach(element => {
            let utilisateur = await Utilisateur.findOne({profil._utilisateur})
            console.log(utilisateur, utilisateur? true:false)
        });
        return res.status(200).json({data: profil, msg:"Profils nettoyé"})
    } catch (err) {
        return res.status(400).json({ error: err.message })
    }
})