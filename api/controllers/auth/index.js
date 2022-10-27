//* MODULES *//
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')
const hasher = 10
const emailServices = require('../../../services/email.service')

//* MODELS *//
const Utilisateur = require('../../../models/Utilisateur')
const InfoSup = require('../../../models/InfoSup')
const Profil = require('../../../models/Profil')

/**
 * @route post api/v1/auth
 * @description Authentification et création d'un token pour l'utilisateur
 */
exports.getHashedPassword = async (req, res) => {
    const { email } = req.body
    try {
        let utilisateur = await Utilisateur.findOne(
            { email: email },
            { mot_de_passe: 1 }
        )
        if (!utilisateur) {
            return res.status(400).json({ error: "L'email est invalide" })
        }

        return res.status(200).json({
            utilisateur,
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: err.message })
    }
}

/**
 * @route post api/v1/auth/login
 * @description Authentification et création d'un token pour l'utilisateur
 */
exports.login = async (req, res) => {
    const { id } = req.body
    try {
        let utilisateur = await Utilisateur.findOne(
            { _id: id },
            { mot_de_passe: 0 }
        )

        if (!utilisateur) {
            return res.status(400).json({ error: "L'email est invalide" })
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
                nom: `${utilisateur.nom}${
                    utilisateur.prenom ? ` ${utilisateur.prenom}` : ''
                }`,
                id: utilisateur._id,
                token: utilisateur.token,
                profil: info,
                firstLogged: info == null && profil == null,
                structure: utilisateur._structure,
            },
            message: `Connexion réussie, bonjour ${
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
    } = req.body

    try {
        let utilisateur = await Utilisateur.findOne({ email: email })
        if (utilisateur != null || utilisateur != undefined) {
            if (utilisateur.email == email) {
                return res
                    .status(400)
                    .json({ error: "L'adresse email est déjà utilisée" })
            }
        }

        utilisateur = await Utilisateur.create({
            nom,
            prenom,
            email,
            mot_de_passe,
        })

        console.log(utilisateur)
        emailServices.validationEmail(email, prenom, nom, utilisateur._id)

        return res.status(200).json({
            data: {
                nom: utilisateur.nom,
                prenom: utilisateur.prenom,
            },
            msg: 'Utilisateur créé avec succés',
        })
    } catch (err) {
        console.log(err)
        return res.status(400).json({ error: err.message })
    }
}

/**
 * @route POST api/v1/auth/:userId
 * @description Register utilisateur
 */
exports.getUserById = async (req, res) => {
    const { userId } = req.params

    const utilisateur = await Utilisateur.findOne(
        { _id: userId },
        { mot_de_passe: 0 }
    )

    if (!utilisateur) {
        res.status(404).json({
            error: 'Utilisateur non trouvé',
        })
    }

    return res.status(200).json({
        utilisateur: utilisateur,
        message: 'Utilisateur récupéré avec succès',
    })
}

/**
 * @route POST api/v1/auth/confirm/:userId
 * @description Register utilisateur
 */
exports.confirmRegistration = async (req, res) => {
    const { userId } = req.params
    const utilisateur = await Utilisateur.findOne({ _id: userId })

    await Utilisateur.findOneAndUpdate({ _id: userId }, { isConfirmed: true })

    emailServices.welcomeEmail(
        utilisateur.email,
        utilisateur.prenom,
        utilisateur.nom
    )

    return res.status(200).json({
        message:
            'Compte validé, une surpprise vous attends dans votre boite mail. Vous pouvez désormais vous connecter.',
    })
}

/**
 * @route POST api/v1/auth/cancel/:userId
 * @description Register utilisateur
 */
exports.cancelRegistration = async (req, res) => {
    const { userId } = req.params
    await Utilisateur.findOneAndDelete({ _id: userId })

    return res.status(200).json({
        message: 'Compte supprimé.',
    })
}

/**
 * @route api/v1/:email/resetpassword
 * @description Permet de récupérer l'id de l'utilisateur avec son email
 */
exports.getCode = async (req, res) => {
    const email = req.params.email
    const user = await Utilisateur.findOne(
        { email: email },
        { email: 1, nom: 1, prenom: 1 }
    )

    if (!user) {
        return res
            .status(200)
            .json({ error: 'Aucun utilisateur avec cet email' })
    }

    const random =
        Math.floor(Math.random() * 1000).toString() +
        Math.floor(Math.random() * 1000).toString()

    const code = `${
        random.length < 6 ? `${(5 - random.length) * 10}${random}` : random
    }`

    const salt = await bcrypt.genSalt(hasher)
    const codeHashed = await bcrypt.hash(code, salt)

    await Utilisateur.findOneAndUpdate(
        { email: email },
        { $set: { code: code } }
    )

    emailServices.passwordReinitialisation(email, user.prenom, user.nom, code)

    return res.status(200).json({ user: { ...user._doc, code: codeHashed } })
}

/**
 * @route api/v1/:email/resetpassword
 * @description Permet de récupérer l'id de l'utilisateur avec son email
 */
exports.resetPassword = async (req, res) => {
    const email = req.params.email
    const password = req.body.password

    const user = await Utilisateur.findOneAndUpdate(
        { email: email },
        { $set: { mot_de_passe: password } }
    )

    return res.status(200).json({ user })
}

exports.changePassword = async (req, res) => {
    try {
        const { email, previousPassword, newPassword, newPasswordConfirm } =
            req.body
        const user = await Utilisateur.findOne({ email: email })

        if (!user) {
            return res
                .status(404)
                .json({ error: 'Aucun utilisateur avec cet email.' })
        }

        const isMatch = await bcrypt.compare(
            previousPassword,
            user.mot_de_passe
        )

        if (!isMatch) {
            return res
                .status(400)
                .json({ error: "L'ancien mot de passe est incorrect." })
        }
        if (newPassword !== newPasswordConfirm) {
            return res
                .status(400)
                .json({ error: 'Les mots de passe ne sont pas les mêmes.' })
        }
        const salt = await bcrypt.genSalt(hasher)

        user.mot_de_passe = await bcrypt.hash(newPassword, salt)
        user.save()
        return res.status(200).json({
            message: `Identifiant changé avec succès`,
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: error.message,
            message: 'Une erreur est survenue, veuillez réessayer plus tard',
        })
    }
}

exports.getUserWithToken = async (req, res) => {
    const user = req.utilisateur
    return res.status(200).json({ user })
}
