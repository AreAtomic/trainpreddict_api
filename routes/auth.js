/**
 * @import Modules
 */
const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const { check, validationResult } = require('express-validator')
const nodemailer = require('nodemailer')
const dayjs = require('dayjs')
const hasher = 10
/**
 * @import Models
 */
const Utilisateur = require('../models/Utilisateur')
const InfoSup = require('../models/InfoSup')
const Profil = require('../models/Profil')
const { MongoTimeoutError } = require('mongodb')

/**
 * @route post api/auth/login
 * @description Authentification et création d'un token pour l'utilisateur
 */
router.post(
    '/login',
    [
        check('email', 'Email invalide').isEmail(),
        check('mot_de_passe', 'Mot de passe requis').exists(),
    ],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const { email, mot_de_passe } = req.body

        try {
            let utilisateur = await Utilisateur.findOne({ email })
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

            return res.status(200).json({
                id: utilisateur.id,
                nom: utilisateur.nom,
                prenom: utilisateur.prenom,
            })
        } catch (err) {
            res.status(500).json({ error: 'Serveur erreur' })
        }
    }
)

/**
 * @route POST api/auth/signup
 * @description Register utilisateur
 */
router.post(
    '/signup',
    [
        check('nom', 'Le nom est requis').not().isEmpty(),
        check('prenom', 'Le prénom est requis').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check(
            'mot_de_passe',
            "Rentre un mot de passe d'au moins 1 caractère"
        ).isLength({ min: 12 }),
    ],
    async (req, res) => {
        const errors = validationResult(req)
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
                .status(200)
                .json({ error: 'Les mots de passe ne sont pas les mêmes' })
        }

        if (!errors.isEmpty()) {
            return res.status(200).json({ error: errors.array() })
        }

        try {
            let utilisateur = await Utilisateur.findOne({ email: email })
            if (utilisateur != null || utilisateur != undefined) {
                if (utilisateur.email == email) {
                    // Cas ou ce n'est pas le même utilisateur mais qu'il a mis la même adresse mail
                    return res
                        .status(200)
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

            return res.status(200).json({
                data: {
                    id: utilisateur.id,
                    nom: utilisateur.nom,
                    prenom: utilisateur.prenom,
                },
                msg: 'Utilisateur créé avec succés',
            })
        } catch (err) {
            console.log(err)
            return res.status(200).json({ error: 'Server error' })
        }
    }
)

/**
 * @route api/:userId/infosup
 * @description Permet de rajouter des infos suite à l'inscription
 */
router.post('/:userId/infosup', async (req, res) => {
    const utilisateur = await Utilisateur.findOne({ _id: req.params.userId })
    console.log(req.params.userId)
    const {
        naissance,
        adresse,
        decouverte,
        categorie,
        telephone,
        pfs,
        fcfs,
    } = req.body

    // Information supplémentaire sur l'utilisateur
    infosup = new InfoSup({
        _utilisateur: utilisateur.id,
        naissance: dayjs(naissance).toISOString(),
        adresse,
        decouverte,
        categorie,
        telephone,
    })

    await infosup.save()

    // Création du profil
    let profil = new Profil({
        _utilisateur: utilisateur.id,
        pfs,
        fcfs,
    })

    profil.save()

    // Envoie du mail de confirmation
    let inscris = await Utilisateur.find({})
    let numero = inscris.length

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
        to: utilisateur.email,
        subject: 'Bienvenue chez TrainPreddict',
        text: `
TrainPreddict, l'entrainement de haut niveau en un clic.

Bonjour!

Vous faites désormais partie de la communauté TrainPreddict.

Numéro d'adhésion ${numero}

Carte d'identité

${utilisateur.nom} - ${utilisateur.prenom}

${categorie}

Comment as-tu connu l'application ?

${decouverte}

Pour vous accompagner, un guide de mise en œuvre est disponible ci-joint.

N’hésitez pas à nous contacter pour plus d’informations sur le mail
contact@trainpreddict.fr ou à nous suivre sur les réseaux sociaux. Nous
sommes à votre écoute pour vous aider à l'utiliser. TrainPreddict est fait
pour vous et par vous, nous voulions que vous soyez acteurs de notre
application. Pour ce faire, nous sommes à votre écoute à l’adresse :
support@trainpreddict.fr

Sportivement,
</div>
`,
        html: `<div
style="
  color: #e01a4f;
  background: #000033;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  text-align: center;
  align-items: center;
  padding: 20px 0;
"
>
<div>
  <img width="190" src="https://nsa40.casimages.com/img/2021/02/26//210226081351605272.png" alt="TrainPreddict logo, rose, casque, vélo"/>
</div>
<div style="font-size: 1rem; text-align: left">
  TrainPreddict, l'entrainement de haut niveau en un clic.
</div>
</div>
<div style="padding: 40px 15vw">
Bonjour!
<br /><br />
Vous faites désormais partie de la communauté TrainPreddict.
<br /><br />
<span style="color: #e01a4f">Numéro d'adhésion ${numero}</span>
</div>
<div style="background: linear-gradient(#a64667, #000033); margin: 0 12vw; text-align: center; padding-bottom: 15px; border-radius: 10px; color: #fff;">
<h1
  style="font-size: 2rem; color:#e01a4f; filter: drop-shadow(2px 4px 6px black);"
>
  Carte d'identité
</h1>
<br />
${utilisateur.nom} - ${utilisateur.prenom}
<br />
${categorie}
<br />
<h2 style="font-size: 1.3rem; color: #e01a4f">
  Comment as-tu connu l'application ?
</h2>
${decouverte}
</div>
<div style="padding: 40px 15vw">
Pour vous accompagner, un guide de mise en œuvre est disponible http://trainpreddict.fr/static/media/Guide.d2faf577.pdf.
<br /><br />
N’hésitez pas à nous contacter pour plus d’informations sur le mail
contact@trainpreddict.fr ou à nous suivre sur les réseaux sociaux. Nous
sommes à votre écoute pour vous aider à l'utiliser. TrainPreddict est fait
pour vous et par vous, nous voulions que vous soyez acteurs de notre
application. Pour ce faire, nous sommes à votre écoute à l’adresse :
support@trainpreddict.fr
<br /><br />

Sportivement,
</div>

<div
style="
color: #e01a4f;
font-family: '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto',
  'Oxygen', 'Ubuntu', 'Cantarell', 'Open Sans', 'Helvetica Neue',
  sans-serif;
display: flex;
background-color: #000033;
width: 550px;
margin: 50px 15vw 0;
"
>
<div class="column">
<figure><img width="200" src="https://nsa40.casimages.com/img/2021/02/26/210226081352653382.png" /></figure>
</div>
<span style="border-left: 3px solid #14f5aa; margin: 0 30px 0 0"></span>
<div class="column">
<p style="font-weight: bold; font-size: 20px; margin: 10px 0 0 0">
  L'équipe TrainPreddict
</p>
<div style="margin: 10px 0">
  <a href="mailto:contact@trainpreddict.fr" style="color: #e01a4f"
    >contact@trainpreddict.fr</a
  >
  <a href="tel:0608365730" style="color: #e01a4f">06.08.36.57.30</a>
</div>

<figure style="width: 40px; margin: 10px 15px 10px 0; display: flex">
  <a href="https://www.linkedin.com/company/trainpreddict/">
    <img src="https://nsa40.casimages.com/img/2021/02/26/210226081351348391.png" width="40" style="margin: 10px 15px 10px 0"
  /></a>
  <a href="https://www.instagram.com/trainpreddict/"
    ><img
      src="https://nsa40.casimages.com/img/2021/02/26/21022608135180971.png"
      width="40"
      style="margin: 10px 15px 10px 0"
  /></a>

  <a href="https://trainpreddict.aureliensebe.com/"
    ><img
      src="https://nsa40.casimages.com/img/2021/02/26/210226081350994354.png"
      width="40"
      style="margin: 10px 15px 10px 0"
  /></a>
</figure>
</div>
</div>
`,
    }

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error)
        } else {
            console.log(info)
        }
    })

    return res.status(200).json({
        msg: 'Un mail vous a été envoyé',
        data: {
            id: utilisateur.id,
            nom: utilisateur.nom,
            prenom: utilisateur.prenom,
        },
    })
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

      Vous avez perdu votre mot de passe et vous souhaitez le changer? Vous n'avez qu'à suivre ce lien http://trainpreddict.fr/password/${user.id} 

      Si vous n'êtes pas à l'origine de cette demande repondez nous à ce mail.

      L'équipe TrainPreddict
    `,
    }

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return res.status(200).send({
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

/**
 * @route /api/utilisateur/delete/:userId
 * @description supression d'un utilisateur
 */
router.post('/delete/:userId', async (req, res) => {
    try {
        const user = await Utilisateur.findOneAndDelete({
            _id: req.params.userId,
        })

        return res.status(200).json({
            msg: `Utilisateur ${user.nom} ${user.prenom} supprimé`,
            data: user,
        })
    } catch (e) {
        console.log(e)
        return res.status(200).json({ error: 'Une erreur est survenue' })
    }
})

module.exports = router
