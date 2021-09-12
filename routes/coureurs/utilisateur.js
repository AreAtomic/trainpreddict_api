/**
 * @import Modules
 */
const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const { jwtauth } = require('../../middlewares/auth.middleware')
/**
 * @import Models
 */
const Utilisateur = require('../../models/Utilisateur')

/**
 * @route get api/utilisateur
 * @description Récupération du token en cours
 * */
router.get('/', [jwtauth], async (req, res) => {
    try {
        const utilisateur = await Utilisateur.findById(req.utilisateur._id)
        return res.status(200).json({
            id: utilisateur.id,
            nom: utilisateur.nom,
            prenom: utilisateur.prenom,
            token: req.utilisateur.token,
        })
    } catch (err) {
        console.error(err.message)
        return res.status(500).send('Server erreur')
    }
})

/**
 * @route delete api/utilisateur
 * @description Supression du compte
 * */
router.delete('/', [jwtauth], async (req, res) => {
    try {
        const utilisateur = await Utilisateur.findOneAndDelete({
            _id: req.utilisateur._id,
        })

        return res.status(200).json({
            msg: `Compte de : ${utilisateur.nom} ${utilisateur.prenom} supprimé`,
        })
    } catch (err) {
        console.error(err.message)
        return res.status(500).send('Server erreur')
    }
})

/**
 *  @route PUT api/utilisateur/
 *  @description Changement de mot de passe quand l'utilisateur est connecté
 * */
router.put('/', [jwtauth], async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10)
        const last = req.body.last

        if (req.body.password != req.body.password2) {
            return res
                .status(400)
                .json({ error: 'Les deux mot de passe ne sont pas identiques' })
        }

        const user = await Utilisateur.findById(req.utilisateur._id)

        const password = await bcrypt.hash(req.body.password, salt)
        const isMatch = await bcrypt.compare(last, user.mot_de_passe)

        if (!isMatch) {
            return res
                .status(400)
                .send({ error: "L'ancien mot de passe de correspond pas" })
        }

        const utilisateur = await Utilisateur.findOneAndUpdate(
            { _id: req.utilisateur._id },
            { $set: { mot_de_passe: password } },
            { new: true, upsert: true }
        )

        return res.status(200).send({
            data: {
                _id: utilisateur._id,
                nom: utilisateur.nom,
                prenom: utilisateur.prenom,
                email: utilisateur.email,
            },
            msg: 'Mot de passe mis à jour',
        })
    } catch (err) {
        if (err.indexOf('Illegal arguments')) {
            return res
                .status(400)
                .json({ error: "L'ancien mot de passe est requis" })
        }
        return res.status(400).json({ error: err.message })
    }
})

/**
 * @route POST api/utilisateur/link
 * @description Envoie d'un mail pour récupération du mot de passe
 *  */
router.post('/:userId/link', async (req, res) => {
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
        return res.status(400).json({ error: 'Serveur erreur' })
    }
})

module.exports = router
