/**
 * @import Modules
 */
const express = require('express')
const router = express.Router()
/**
 * @import Models
 */
const DonneesUtilisateur = require('../models/DonneesUtilisateur.js')

/**
 * @route api/donneesUtilisateur
 * @description Permet de créer un plan d'entrainement pour l'utilisateur
 */
router.post('/:userId', async (req, res) => {
    try {
        console.log(req.body)
        const {
            sse,
            experience,
            heure_sommeil,
            temps_recup_max,
            nombre_heure_semaine,
            nombre_seance_semaine,
            musculation,
            ppg,
            etirement,
            foncier,
            style,
            point_faible,
            jours_repos,
        } = req.body

        if (
            experience == '' ||
            sse == '' ||
            heure_sommeil == '' ||
            experience == '' ||
            temps_recup_max == '' ||
            jours_repos == [] ||
            jours_repos == ''
        ) {
            return res
                .status(200)
                .json({ error: 'Tous les champs doivent être remplis' })
        }

        if (style.includes('Style')) {
            return res
                .status(200)
                .json({ error: "La liste déroulante Style n'est pas valide" })
        }

        if (point_faible.includes('Point faible')) {
            return res.status(200).json({
                error: "La liste déroulante Point faible n'est pas valide",
            })
        }

        if (foncier.includes('Foncier')) {
            return res
                .status(200)
                .json({ error: "La liste déroulante Foncier n'est pas valide" })
        }

        const donnees = {
            sse: sse,
            experience: experience,
            heure_sommeil: heure_sommeil,
            temps_recup_max: temps_recup_max,
            nombre_heure_semaine: nombre_heure_semaine,
            nombre_seance_semaine: nombre_seance_semaine,
            musculation: musculation,
            ppg: ppg,
            etirement: etirement,
            foncier: foncier,
            style: style,
            point_faible: point_faible,
            jours_repos: jours_repos,
        }

        const donneesUtilisateur = await DonneesUtilisateur.findOneAndUpdate(
            { _utilisateur: req.params.userId },
            { $set: donnees },
            { new: true, upsert: true }
        )

        console.log(donneesUtilisateur)
        return res
            .status(200)
            .json({ data: donneesUtilisateur, msg: `Donnée mises à jour` })
    } catch (e) {
        return res.status(200).json({ error: e })
    }
})

/**
 * @route get api/donneesUtilisateurs/:userId
 * @description permet de récupérer les données utilisateur
 */
router.get('/:userId', async (req, res) => {
    var donneesUtilisateurs = await DonneesUtilisateur.findOne({
        _utilisateur: req.params.userId,
    })
    if (donneesUtilisateurs == null) {
        const donnees = {
            sse: '',
            experience: '',
            heure_sommeil: '',
            temps_recup_max: '',
            nombre_heure_semaine: '',
            nombre_seance_semaine: '',
            musculation: false,
            ppg: false,
            etirement: false,
            foncier: '',
            style: '',
            point_faible: '',
            jours_repos: [''],
        }

        donneesUtilisateur = await DonneesUtilisateur.findOneAndUpdate(
            { _utilisateur: req.params.userId },
            { $set: donnees },
            { new: true, upsert: true }
        )
    }
    return res.status(200).json({ data: donneesUtilisateurs })
})

module.exports = router
