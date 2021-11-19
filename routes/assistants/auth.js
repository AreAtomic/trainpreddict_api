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
const Statistiques = require('../../models/Statistiques')
const InfoSup = require('../../models/InfoSup')
const Profil = require('../../models/Profil')

/**
 * @route POST /api/assistant/
 * @description création d'un compte structure avec envoie d'un mail
 */
router.post('/register', async (req, res) => {
    try {
        const { nom, email, type } = req.body

        let user = await Utilisateur.findOne({ email: email })
        if (user) {
            return res
                .status(200)
                .json({ error: 'Une structure existe déjà avec cet email' })
        }

        const salt = await bcrypt.genSalt(hasher)
        const mdp_decrypt = genMdp()
        let mot_de_passe = await bcrypt.hash(mdp_decrypt, salt)

        const trainpreddict = await Utilisateur.findOne({
            _id: '61967473a2c542ef97ca6fbd',
        })

        user = new Utilisateur({
            nom,
            email,
            mot_de_passe,
            structure: [trainpreddict._id],
            type,
        })

        user.save()

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
            to: 'contact@trainpreddict.fr',
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
