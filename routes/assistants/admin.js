/**
 * @import Modules
 */
const express = require('express')
const router = express.Router()
const dayjs = require('dayjs')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const hasher = 10
/**
 * @import Models
 */
const Utilisateur = require('../../models/Utilisateur')
const Admin = require('../../models/Admin')
const StructureUtilisateur = require('../../models/StructureUtilisateur')
const Statistiques = require('../../models/Statistiques')
const InfoSup = require('../../models/InfoSup')
const Profil = require('../../models/Profil')

/**
 * @route POST /api/admin/
 * @description création d'un compte structure avec envoie d'un mail
 */
router.post('/', async (req, res) => {
    try {
        const { nom, type, email } = req.body

        let admin = await Admin.findOne({ nom: nom })
        if (admin) {
            return res
                .status(200)
                .json({ error: 'Une structure existe déjà à ce nom' })
        }

        const salt = await bcrypt.genSalt(hasher)
        const mdp_decrypt = genMdp()
        let mot_de_passe = await bcrypt.hash(mdp_decrypt, salt)

        admin = new Admin({
            nom,
            type,
            email,
            mot_de_passe,
        })

        admin.save()

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
    
    Bonjour ${nom}!

    Vous avez désormais un compte ${type} chez TrainPreddict.

    Vous pouvez vous connecté au lien suivant http://trainpreddict.fr/admin avec ce 
    mot de passe ${mdp_decrypt} à changer des votre première connexion. 

    N’hésitez pas à nous contacter pour plus d’informations sur le mail
    contact@trainpreddict.fr ou à nous suivre sur les réseaux sociaux. Nous
    sommes à votre écoute pour vous aider à l'utiliser. TrainPreddict est fait
    pour vous et par vous, nous voulions que vous soyez acteurs de notre
    application. Pour ce faire, nous sommes à votre écoute à l’adresse :
    support@trainpreddict.fr

    Merci pour votre confiance,
    Sportivement,
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
  Bonjour ${nom}!
  <br /><br />
  Vous avez désormais un compte ${type} chez TrainPreddict.
  <br /><br />
  Vous pouvez vous connecté au lien suivant http://trainpreddict.fr/admin avec ce 
  mot de passe ${mdp_decrypt} à changer des votre première connexion.
  <br/> <br/>
  </div>
  <div style="padding: 40px 15vw">
    N’hésitez pas à nous contacter pour plus d’informations sur le mail
    contact@trainpreddict.fr ou à nous suivre sur les réseaux sociaux. Nous
    sommes à votre écoute pour vous aider à l'utiliser. TrainPreddict est fait
    pour vous et par vous, nous voulions que vous soyez acteurs de notre
    application. Pour ce faire, nous sommes à votre écoute à l’adresse :
    support@trainpreddict.fr
    <br /><br />

    Merci pour votre confiance,
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

        return res
            .status(200)
            .json({ msg: 'Structure créée avec succés', data: admin })
    } catch (e) {
        console.log(e)
        return res.status(200).json({
            error: 'Une erreur est survenue lors de la création',
            data: e,
        })
    }
})

/**
 * @route POST /api/admin/login
 * @description méthode de connexion d'une structure
 */
router.post('/login', async (req, res) => {
    try {
        const { email, mot_de_passe } = req.body
        let admin = await Admin.findOne({ email })

        if (!admin) {
            return res.status(200).json({ error: "La structure n'existe pas" })
        }

        const isMatch = await bcrypt.compare(mot_de_passe, admin.mot_de_passe)
        if (!isMatch) {
            return res.status(200).json({ error: 'Mot de passe invalide' })
        }

        return res.status(200).json({
            data: {
                id: admin.id,
                nom: admin.nom,
            },
            msg: 'Connecté avec succés',
        })
    } catch (e) {
        console.log(e)
        return res.status(200).json({
            error: 'Une erreur est survenue lors de la connexion',
        })
    }
})

/**
 * @route POST /api/admin/affiliation/:adminId
 * @description Affiliation d'un ou plusieurs comptes à une structure grâce à l'id
 * */
router.post('/affiliation/:adminId', async (req, res) => {
    try {
        // Infos affiliations
        const admin_id = req.params.adminId
        const ids = req.body.ids
        let affiliations = []

        ids.forEach(async (id) => {
            let structureUtilisateur = await StructureUtilisateur.findOne({
                _utilisateur: id,
            })

            // Vérification de la non existance
            if (structureUtilisateur) {
                if (structureUtilisateur._admin == admin_id) {
                    return res
                        .status(200)
                        .json({ error: `Utilisateur ${id} déjà affilié` })
                }
            }

            // Création affiliation
            structureUtilisateur = new StructureUtilisateur({
                _utilisateur: id,
                _admin: admin_id,
            })

            structureUtilisateur.save()
            affiliations.push(structureUtilisateur)
        })

        // MAJ compte structure
        let admin = await Admin.find({ _id: admin_id })
        affiliations.push(admin.comptes)
        admin = await Admin.findOneAndUpdate(
            { _id: admin_id },
            { $set: { comptes: affiliations } },
            { new: true, upsert: true }
        )

        return res.status(200).json({
            data: affiliations,
            msg: 'Compte(s) affilié(s) avec succés',
        })
    } catch (e) {
        return res
            .status(200)
            .json({ error: 'Une erreur serveur est survenue' })
    }
})

/**
 * @route GET /api/admin/affiliation/:adminId
 * @description Récupération de tous les comptes affiliés à la structure
 */
router.get('/affiliation/:adminId', async (req, res) => {
    try {
        // Infos sur la structure
        const admin = req.params.adminId

        const lien_structure = await StructureUtilisateur.find({
            _admin: admin,
        })

        // Récupération des utilisateurs
        let utilisateurs_structure = []

        for (let i = 0; i < lien_structure.length; i++) {
            let utilisateur = await Utilisateur.findOne({
                _id: lien_structure[i]._utilisateur,
            })
            if (utilisateur != null) {
                utilisateurs_structure.push(utilisateur)
            } else {
                let lien = await StructureUtilisateur.findOneAndDelete({
                    _utilisateur: lien_structure[i]._utilisateur,
                })
            }
        }

        return res.status(200).json({
            data: utilisateurs_structure,
            msg: 'Comptes affiliés récupérés',
        })
    } catch (error) {
        return res
            .status(200)
            .json({ error: 'Une erreur serveur est survenue' })
    }
})

router.get('/all', async (req, res) => {
    try {
        const utilisateurs = await Utilisateur.find({})

        let ids = []

        utilisateurs.forEach((utilisateur) => ids.push(utilisateur.id))

        return res
            .status(200)
            .json({ data: ids, msg: 'Tous les comptes ont été récupérés' })
    } catch (e) {
        return res
            .status(200)
            .json({ error: 'Une erreur serveur est survenue' })
    }
})

/**
 * @route post /admin/user/create
 * @description permet de créer un nouvel utilisateur et de l'affilié à la structure
 */
router.post('/:adminId/user/create', async (req, res) => {
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
        const adminId = await Admin.findOne({ _id: req.params.adminId })

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
            mot_de_passe: 'azdfvbnaz786839hjféç_"ç&éà)ùekz',
        })
        const salt = await bcrypt.genSalt(hasher)
        utilisateur.mot_de_passe = await bcrypt.hash(mdp_decrypt, salt)
        await utilisateur.save()

        infosup = new InfoSup({
            _utilisateur: utilisateur.id,
            naissance: dayjs(naissance).toISOString(),
            adresse,
            decouverte: `Depuis la structure ${adminId.nom}`,
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

${adminId.nom}

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
${adminId}
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

        structureUtilisateur = new StructureUtilisateur({
            _utilisateur: utilisateur._id,
            _admin: adminId._id,
        })

        structureUtilisateur.save()

        let affiliations = [structureUtilisateur]
        let admin = await Admin.find({ _id: adminId._id })

        affiliations.push(admin.comptes)
        admin = await Admin.findOneAndUpdate(
            { _id: adminId },
            { $set: { comptes: affiliations } },
            { new: true, upsert: true }
        )

        res.status(200).json({
            data: { admin },
            msg: 'Compte créé avec succès',
        })
    } catch (e) {
        console.log(e)
        res.status(200).json({ error: 'Erreur serveur' })
    }
})

/**
 * @route /api/admin/:adminId/user/delete/userId
 * @description Permet de supprimer un compte
 */
router.post('/:adminId/user/delete/:userId', async (req, res) => {
    try {
        const adminId = req.params.adminId
        const userId = req.params.userId

        let lien = await StructureUtilisateur.findOne({
            _admin: adminId,
            _utilisateur: userId,
        })

        if (!lien) {
            return res
                .status(200)
                .json({ error: "L'utilisateur n'est pas lié à la structure" })
        }

        lien = StructureUtilisateur.findOneAndDelete({
            _admin: adminId,
            _utilisateur: userId,
        })

        let admin = await Admin.findOne({ _id: adminId })

        if (admin.type == 'TrainPreddict') {
            const utilisateur = await Utilisateur.findOneAndDelete({
                _id: userId,
            })

            const infosup = await InfoSup.findOneAndDelete({
                _utilisateur: userId,
            })

            const statistiques = await Statistiques.findOneAndDelete({
                _utilisateur: userId,
            })

            const entrainement = await Entrainement.findOneAndDelete({
                _utilisateur: userId,
            })
        }

        return res
                .status(200)
                .json({ msg: "L'utilisateur a bien été supprimé" })
    } catch (e) {
        console.log(e)
        return res
            .status(200)
            .json({ error: "Erreur serveur" })
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
