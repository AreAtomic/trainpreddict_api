/**
 * @import Modules
 */
const express = require('express')
const router = express.Router()
const dayjs = require('dayjs')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const hasher = 10
const { jwtauth } = require('../../middlewares/auth.middleware')
const onlyUnique = (value, index, self) => {
    return self.indexOf(value) === index
}

/**
 * @import Models
 */
const Utilisateur = require('../../models/Utilisateur')
const InfoSup = require('../../models/InfoSup')
const Profil = require('../../models/Profil')

/**
 * @route POST /api/assistant/affiliation/:userId
 * @description Affiliation d'un compte à une structure grâce à l'id
 * */
router.post('/:userId', [jwtauth], async (req, res) => {
    try {
        // Infos affiliations
        const user = await Utilisateur.findOne({ _id: req.params.userId })

        if (!user) {
            return res.status(400).json({ error: 'Utilisateur introuvable' })
        }

        user._structure = req.utilisateur._id
        user.save()

        return res.status(200).json({
            data: user,
            msg: 'Compte(s) affilié(s) avec succés',
        })
    } catch (e) {
        console.log(e)
        return res
            .status(200)
            .json({ error: 'Une erreur serveur est survenue' })
    }
})

/**
 * @route GET /api/assitant/affiliation
 * @description Récupération de tous les comptes affiliés à la structure
 */
router.get('/', [jwtauth], async (req, res) => {
    try {
        // Infos sur la structure
        const structureId = req.utilisateur._id

        if (req.utilisateur.type === 'Coureur') {
            return res.status(300).json({ error: 'Opération non autorisée' })
        }

        let utilisateurs = await Utilisateur.find({
            _structure: structureId,
        })
        if (req.utilisateur.type === 'Admin') {
            utilisateurs = await Utilisateur.find({ type: 'Coureur' })
        }

        return res.status(200).json({
            data: { utilisateurs },
            msg: 'Comptes affiliés récupérés',
        })
    } catch (error) {
        return res
            .status(200)
            .json({ error: 'Une erreur serveur est survenue' })
    }
})

/**
 * @route post /api/assistant
 * @description permet de créer un nouvel utilisateur et de l'affilié à la structure
 */
router.post('/', [jwtauth], async (req, res) => {
    try {
        const {
            email,
            prenom,
            nom,
            naissance,
            adresse,
            categorie,
            telephone,
        } = req.body
        const mdp_decrypt = genMdp()
        const structure = await Utilisateur.findOne({
            _id: req.utilisateur._id,
        })

        let utilisateur = await Utilisateur.find({
            nom: nom,
            prenom: prenom,
        })

        // Vérification que l'utilisateur ne soit pas un doublon de compte
        if (utilisateur) {
            let existe = false
            for (let i = 0; i < utilisateur.length; i++) {
                let infosup = await InfoSup.findOne({
                    _utilisateur: utilisateur[i].id,
                })

                // si un paramètre diffère alors c'est pas le même
                if (infosup) {
                    if (
                        dayjs(naissance).toISOString() ==
                            dayjs(infosup.naissance).toISOString() &&
                        adresse == infosup.adresse &&
                        decouverte == infosup.decouverte &&
                        categorie == infosup.categorie &&
                        telephone == infosup.telephone
                    ) {
                        return res
                            .status(200)
                            .json({ error: "L'utilisateur existe déjà" })
                    }
                }
                if (utilisateur[i].email == email) {
                    existe = true
                }
            }
            if (existe) {
                return res
                    .status(200)
                    .json({ error: "L'utilisateur existe déjà" })
            }
        }

        utilisateur = await Utilisateur.findOne({ email: email })
        if (utilisateur) {
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
            mot_de_passe: 'azdfvbnaz786839hjféç_"ç&éà)ùekz',
            _structure: structure._id,
            type: 'Coureur',
        })
        const salt = await bcrypt.genSalt(hasher)
        utilisateur.mot_de_passe = await bcrypt.hash(mdp_decrypt, salt)
        await utilisateur.save()

        infosup = new InfoSup({
            _utilisateur: utilisateur.id,
            naissance: dayjs(naissance).toISOString(),
            adresse,
            decouverte: `Depuis la structure ${structure.nom}`,
            categorie,
            telephone,
        })
        await infosup.save()

        let profil = new Profil({
            _utilisateur: utilisateur.id,
        })
        profil.save()

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
            to: email,
            subject: 'Bienvenue chez TrainPreddict',
            text: `
 TrainPreddict, l'entrainement de haut niveau en un clic.
 
 Bonjour!
 
 Vous faites désormais partie de la communauté TrainPreddict.
 
 Numéro d'adhésion ${numero}
 
 Carte d'identité
 
 ${nom} - ${prenom}
 
 ${categorie}
 
 Comment as-tu connu l'application ?
 
 ${structure.nom}
 
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
 ${nom} - ${prenom}
 <br />
 ${categorie}
 <br />
 <h2 style="font-size: 1.3rem; color: #e01a4f">
   Comment as-tu connu l'application ?
 </h2>
 ${structure.nom}
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

        res.status(200).json({
            data: { utilisateur },
            msg: 'Compte créé avec succès',
        })
    } catch (e) {
        console.log(e)
        res.status(200).json({ error: 'Erreur serveur' })
    }
})

module.exports = router

const genMdp = () => {
    const mdp = [
        '(',
        ')',
        '+',
        'a',
        'b',
        'c',
        'd',
        'e',
        'f',
        'g',
        'h',
        'i',
        'j',
        'k',
        'l',
        'm',
        'n',
        'o',
        'p',
        'q',
        'r',
        's',
        't',
        'u',
        'v',
        'w',
        'x',
        'y',
        'z',
        '?',
        '#',
        '!',
        '=',
        '§',
        '*',
        '$',
        '£',
        '_',
        '/',
        'è',
        'ç',
        'à',
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
    ]

    let mdp_decrypt = ''
    let caractere
    for (let i = 0; i < 12; i++) {
        caractere = mdp[Math.floor(Math.random() * (mdp.length + 1))]
        mdp_decrypt += caractere
    }

    return mdp_decrypt
}
