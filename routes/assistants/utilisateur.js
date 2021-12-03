/**
 * @import Modules
 */
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const { jwtauth } = require('../../middlewares/auth.middleware')
const s3cr3tok3n = process.env.SECRET_KEY

const onlyUnique = (value, index, self) => {
    return self.indexOf(value) === index
}

/**
 * @import Models
 */
const Utilisateur = require('../../models/Utilisateur')
const Objectif = require('../../models/Objectif')

/**
 * @route GET /api/assistant/utilisateur/:userId/nextObjectif
 * @description Récupération de l'objectif en cours du coureur avec l'id
 * */
router.get('/:userId/nextObjectif', [jwtauth], async (req, res) => {
    try {
        // Infos affiliations
        const objectif = await Objectif.find({
            _utilisateur: req.params.userId,
        })

        if (objectif.length === 0) {
            return res.status(400).json({ error: 'Aucun objectif trouvé' })
        }

        return res.status(200).json({
            data: objectif[0],
            msg: 'Objectif(s) récupéré(s) avec succés',
        })
    } catch (e) {
        console.log(e)
        return res
            .status(200)
            .json({ error: 'Une erreur serveur est survenue' })
    }
})

/**
 * @route GET /api/assistant/utilisateur/:userId/connect
 * @description Récupération du token de l'utilisateur et redirection
 * */
router.get('/:userId/connect', [jwtauth], async (req, res) => {
    try {
        // Infos affiliations
        let utilisateur = await Utilisateur.findOne({
            _id: req.params.userId,
        })

        if (!Utilisateur) {
            return res.status(400).json({ error: 'Aucun utilisateur trouvé' })
        }

        utilisateur.token = jwt.sign({ _id: utilisateur._id }, s3cr3tok3n, {
            expiresIn: '10d',
        })
        utilisateur.mot_de_passe = ''

        return res.status(200).json({
            data: { utilisateur, token: utilisateur.token },
            msg: 'Token généré avec succès',
        })
    } catch (e) {
        console.log(e)
        return res
            .status(200)
            .json({ error: 'Une erreur serveur est survenue' })
    }
})

module.exports = router
