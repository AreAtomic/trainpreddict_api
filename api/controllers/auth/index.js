//* MODULES *//
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')
const hasher = 10

//* MODELS *//
const Utilisateur = require('../../../models/Utilisateur')
const InfoSup = require('../../../models/InfoSup')
const Profil = require('../../../models/Profil')

/**
 * @route post api/v1/auth/login
 * @description Authentification et création d'un token pour l'utilisateur
 */
exports.login = async (req, res) => {
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
            process.env.SECRET_KEY,
            {
                expiresIn: '10d',
            }
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
            msg: `Connexion réussie, bonjour ${
                utilisateur.prenom !== undefined
                    ? utilisateur.prenom
                    : utilisateur.nom
            }`,
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: err.message })
    }
}

/**
 * @route POST api/v1/auth/signup
 * @description Register utilisateur
 */
exports.signup = async (req, res) => {
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
            process.env.SECRET_KEY,
            {
                expiresIn: '10d',
            }
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
}

/**
 * @route api/v1/:email/resetpassword
 * @description Permet de récupérer l'id de l'utilisateur avec son email
 */
exports.resetPassword = async (req, res) => {
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
}
