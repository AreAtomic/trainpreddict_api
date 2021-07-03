/**
 * @import Modules
 */
const express = require('express')
const router = express.Router()
/**
 * @import Models
 */
const Utilisateur = require('../models/Utilisateur')

router.post('/createuser', async function (req, res) {
    const mdp = [
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
        'è',
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
    let motDePasseProvisoire = ''
    let caractere
    for (let i = 0; i < 12; i++) {
        caractere = mdp[Math.floor(Math.random() * (mdp.length + 1))]
        motDePasseProvisoire += caractere
    }
    const {
        nom_user,
        prenom_user,
        adresse_user,
        naissance_user,
        email_user,
        licence_user,
    } = req.body
    try {
        const user = await Utilisateur.create({
            nom: nom_user,
            prenom: prenom_user,
            email: email_user,
            mot_de_passe: motDePasseProvisoire,
        })

        return res.status(200).json({ data: user, msg: 'Utilisateur crée' })
    } catch (err) {
        return res.status(200).json({ error: "Le formulaire n'est pas valide" })
    }
})
