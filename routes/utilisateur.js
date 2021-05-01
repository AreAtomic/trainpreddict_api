/**
 * @import Modules
 */
const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
/**
 * @import Models
 */
const Utilisateur = require('../models/Utilisateur')

/**
 * @route get api/utilisateur/:id
 * @description Récupération du token en cours
 * */
router.get('/:userId', async (req, res) => {
    try {
        const utilisateur = await Utilisateur.findById(
            req.params.userId
        ).select('-mot_de_passe')
        return res.status(200).send(utilisateur)
    } catch (err) {
        console.error(err.message)
        return res.status(500).send('Server erreur')
    }
})

/**
 *  @route POST api/utilisateur/:userId/password
 *  @description Changement de mot de passe quand l'utilisateur est connecté
 * */
router.post('/:userId/password', async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10)
        const last = req.body.last

        if (req.body.password != req.body.password2) {
            return res
                .status(200)
                .json({ error: 'Les deux mot de passe ne sont pas identiques' })
        }

        let user = await Utilisateur.findOne({ _id: req.params.userId })

        const password = await bcrypt.hash(req.body.password, salt)
        const isMatch = await bcrypt.compare(last, user.mot_de_passe)

        if (!isMatch) {
            return res
                .status(200)
                .send({ error: "L'ancien mot de passe de correspond pas" })
        }

        const utilisateur = await Utilisateur.findOneAndUpdate(
            { _id: req.params.userId },
            { $set: { mot_de_passe: password } },
            { new: true, upsert: true }
        )

        return res
            .status(200)
            .send({ data: utilisateur, msg: 'Mot de passe mis à jour' })
    } catch (e) {
        console.log(e)
        return res.status(200).json({ error: 'Serveur erreur', log: e })
    }
})

/**
 * @route POST api/utilisateur/:userId/password/lost
 * @description Envoie d'un mail pour récupération du mot de passe
 *  */ 
router.post('/:userId/password/lost', async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10)

        if (req.body.password != req.body.password2) {
            return res
                .status(200)
                .json({ error: 'Les deux mot de passe ne sont pas identiques' })
        }

        const password = await bcrypt.hash(req.body.password, salt)

        const utilisateur = await Utilisateur.findOneAndUpdate(
            { _id: req.params.userId },
            { $set: { mot_de_passe: password } },
            { new: true, upsert: true }
        )

        return res
            .status(200)
            .send({ data: utilisateur, msg: 'Mot de passe mis à jour' })
    } catch (e) {
        console.log(e)
        return res.status(200).json({ error: 'Serveur erreur', log: e })
    }
})

module.exports = router
