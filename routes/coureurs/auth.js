/**
 * @import Modules
 */
const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const dayjs = require('dayjs')
const jwt = require('jsonwebtoken')
const hasher = 10
const s3cr3tok3n = process.env.SECRET_KEY

/**
 * @import Models
 */
const Utilisateur = require('../../models/Utilisateur')
const InfoSup = require('../../models/InfoSup')
const Profil = require('../../models/Profil')
const { jwtauth } = require('../../middlewares/auth.middleware')

/**
 * @route post api/auth/login
 * @description Authentification et création d'un token pour l'utilisateur
 */
router.post('/login', async (req, res) => {
    const { email, mot_de_passe } = req.body
    try {
        let utilisateur = await Utilisateur.findOne({ email: email })
        if (!utilisateur) {
            return res.status(400).json({ error: "L'email est invalide" })
        }

        const isMatch = await bcrypt.compare(
            mot_de_passe,
            utilisateur.mot_de_passe
        )

        if (!isMatch) {
            return res.status(400).json({ error: 'Mot de passe invalide' })
        }

        utilisateur.token = jwt.sign(
            { id: utilisateur._id },
            s3cr3tok3n,
            { expiresIn: '10d' }
        )

        /* Check first log */
        const info = await InfoSup.findOne({ _utilisateur: utilisateur.id })
        const profil = await Profil.findOne({ _utilisateur: utilisateur.id })

        return res.status(200).json({
            data: {
                nom: utilisateur.nom,
                prenom: utilisateur.prenom,
                token: utilisateur.token,
                firstLogged: info == null && profil == null,
            },
            msg: `Connexion réussie, bonjour ${utilisateur.prenom}`,
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: err.message })
    }
})

/**
 * @route POST api/auth/signup
 * @description Register utilisateur
 */
router.post('/signup', async (req, res) => {
    const {
        // Info de connexion
        nom,
        prenom,
        email,
        mot_de_passe,
        mot_de_passe2,
    } = req.body

    if (mot_de_passe != mot_de_passe2) {
        return res
            .status(400)
            .json({ error: 'Les mots de passe ne sont pas les mêmes' })
    }

    try {
        let utilisateur = await Utilisateur.findOne({ email: email })
        if (utilisateur != null || utilisateur != undefined) {
            if (utilisateur.email == email) {
                // Cas ou ce n'est pas le même utilisateur mais qu'il a mis la même adresse mail
                return res
                    .status(400)
                    .json({ error: "L'adresse email est déjà utilisée" })
            }
        }

        utilisateur = new Utilisateur({
            nom,
            prenom,
            email,
            mot_de_passe,
        })

        const salt = await bcrypt.genSalt(hasher)

        utilisateur.mot_de_passe = await bcrypt.hash(mot_de_passe, salt)

        await utilisateur.save()

        utilisateur.token = jwt.sign(
            { id: utilisateur._id },
            s3cr3tok3n,
            { expiresIn: '10d' }
        )

        return res.status(200).json({
            data: {
                nom: utilisateur.nom,
                prenom: utilisateur.prenom,
                token: utilisateur.token,
                firstLogged: true,
            },
            msg: 'Utilisateur créé avec succés',
        })
    } catch (err) {
        console.log(err)
        return res.status(400).json({ error: err.message })
    }
})

/**
 * @route api/:email/resetpassword
 * @description Permet de récupérer l'id de l'utilisateur avec son email
 */
router.get('/:email/resetpassword', async (req, res) => {
    const email = req.params.email
    const user = await Utilisateur.findOne({ email: email })

    if (!user) {
        return res
            .status(200)
            .json({ error: 'Aucun utilisateur avec cet email' })
    }

    let transporter = nodemailer.createTransport({
        host: 'ssl0.ovh.net',
        port: 465,
        secure: true,
        auth: {
            user: 'support@trainpreddict.fr',
            pass: '(TrainPreddict2021!)',
        },
    })

    let mailOptions = {
        from: 'support@trainpreddict.fr',
        to: email,
        subject: 'Réinitialisation mot de passe',
        text: `Bonjour,

      Vous avez perdu votre mot de passe et vous souhaitez le changer? Vous n'avez qu'à suivre ce lien https://trainpreddict.fr/password/${user.id} 

      Si vous n'êtes pas à l'origine de cette demande repondez nous à ce mail.

      L'équipe TrainPreddict
    `,
    }

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return res.status(400).send({
                error: "Une erreur est survenue durant l'envoie du mail",
            })
        } else {
            return res.status(200).send({
                data: info,
                msg: 'Email envoyé, regardez votre boite mail.',
            })
        }
    })
})

module.exports = router
