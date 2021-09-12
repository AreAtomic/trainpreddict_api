/**
 * @import Modules
 */
const express = require('express')
const router = express.Router()
const nodemailer = require('nodemailer')
const dayjs = require('dayjs')
/**
 * @import Models
 */
const Utilisateur = require('../../models/Utilisateur')
const InfoSup = require('../../models/InfoSup')
const Profil = require('../../models/Profil')
const { jwtauth } = require('../../middlewares/auth.middleware')

/**
 * @route POST api/infosup
 * @description Permet de rajouter des infos suite à l'inscription
 */
router.post('/', [jwtauth], async (req, res) => {
    const utilisateur = await Utilisateur.findOne({ _id: req.utilisateur._id })

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
 * @route PUT api/auth/infosup
 * @description Permet de rajouter des infos suite à l'inscription
 */
router.put('/', [jwtauth], async (req, res) => {
    try {
        const utilisateur = await Utilisateur.findOne({
            _id: req.utilisateur._id,
        })

        const {
            naissance,
            adresse,
            decouverte,
            categorie,
            telephone,
        } = req.body

        // Information supplémentaire sur l'utilisateur
        const infosup = await InfoSup.findOneAndUpdate(
            {
                _utilisateur: utilisateur.id,
            },
            {
                $set: {
                    naissance: dayjs(naissance).toISOString(),
                    adresse,
                    decouverte,
                    categorie,
                    telephone,
                },
            },
            { new: true, upsert: true }
        )

        return res.status(200).json({
            msg: 'Données du profil misent à jour',
            data: {
                id: utilisateur.id,
                nom: utilisateur.nom,
                prenom: utilisateur.prenom,
                infosup,
            },
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: err.message })
    }
})

/**
 * @route GET api/auth/infosup
 * @description Permet de rajouter des infos suite à l'inscription
 */
router.get('/', [jwtauth], async (req, res) => {
    try {
        // Information supplémentaire sur l'utilisateur
        const infosup = await InfoSup.findOneAndUpdate({
            _utilisateur: req.utilisateur._id,
        })

        return res.status(200).json({
            msg: 'Données récupérées',
            data: {
                infosup,
            },
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: err.message })
    }
})

/**
 * @route DELETE api/auth/infosup
 * @description Permet de rajouter des infos suite à l'inscription
 */
router.delete('/', [jwtauth], async (req, res) => {
    try {
        const utilisateur = await Utilisateur.findOne({
            _id: req.utilisateur._id,
        })

        // Information supplémentaire sur l'utilisateur
        const infosup = await InfoSup.findOneAndDelete({
            _utilisateur: utilisateur.id,
        })

        return res.status(200).json({
            msg: 'Données du profil supprimées',
            data: {
                id: utilisateur.id,
                nom: utilisateur.nom,
                prenom: utilisateur.prenom,
                infosup,
            },
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: err.message })
    }
})

module.exports = router
