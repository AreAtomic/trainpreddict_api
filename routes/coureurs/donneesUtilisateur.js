/**
 * @import Modules
 */
const express = require('express')
const router = express.Router()
const { jwtauth } = require('../../middlewares/auth.middleware')
/**
 * @import Models
 */
const DonneesUtilisateur = require('../../models/DonneesUtilisateur.js')

/**
 * @route POST api/donneesUtilisateur
 * @description Permet de créer un plan d'entrainement pour l'utilisateur
 */
router.post('/', [jwtauth], async (req, res) => {
    try {
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
                .status(400)
                .json({ error: 'Tous les champs doivent être remplis' })
        }

        if (style.includes('Style')) {
            return res
                .status(400)
                .json({ error: "La liste déroulante Style n'est pas valide" })
        }

        if (point_faible.includes('Point faible')) {
            return res.status(400).json({
                error: "La liste déroulante Point faible n'est pas valide",
            })
        }

        if (foncier.includes('Foncier')) {
            return res
                .status(400)
                .json({ error: "La liste déroulante Foncier n'est pas valide" })
        }

        const donneesUtilisateur = new DonneesUtilisateur({
            _utilisateur: req.utilisateur._id,
            sse: sse,
            experience: experience,
            heure_sommeil: heure_sommeil,
            temps_recup_max: temps_recup_max,
            nombre_heure_semaine: nombre_heure_semaine,
            nombre_seance_semaine: nombre_seance_semaine,
            foncier: foncier,
            jours_repos: jours_repos,
            musculation: musculation,
            ppg: ppg,
            etirement: etirement,
            style: style,
            point_faible: point_faible,
        })

        donneesUtilisateur.save()

        return res
            .status(200)
            .json({ data: donneesUtilisateur, msg: `Données créées` })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
})

/**
 * @route PUT api/donneesUtilisateur
 * @description Permet de créer un plan d'entrainement pour l'utilisateur
 */
router.put('/', [jwtauth], async (req, res) => {
    try {
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
                .status(400)
                .json({ error: 'Tous les champs doivent être remplis' })
        }

        if (style.includes('Style')) {
            return res
                .status(400)
                .json({ error: "La liste déroulante Style n'est pas valide" })
        }

        if (point_faible.includes('Point faible')) {
            return res.status(400).json({
                error: "La liste déroulante Point faible n'est pas valide",
            })
        }

        if (foncier.includes('Foncier')) {
            return res
                .status(400)
                .json({ error: "La liste déroulante Foncier n'est pas valide" })
        }

        const donneesUtilisateur = await DonneesUtilisateur.findOneAndUpdate(
            { _utilisateur: req.utilisateur._id },
            {
                $set: {
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
                },
            },
            { new: true, upsert: true }
        )

        return res
            .status(200)
            .json({ data: donneesUtilisateur, msg: `Donnée mises à jour` })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
})

/**
 * @route get api/donneesUtilisateurs/
 * @description permet de récupérer les données utilisateur
 */
router.get('/', [jwtauth], async (req, res) => {
    try {
        var donneesUtilisateurs = await DonneesUtilisateur.findOne({
            _utilisateur: req.utilisateur._id,
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
                { _utilisateur: req.utilisateur._id },
                { $set: donnees },
                { new: true, upsert: true }
            )
        }
        return res.status(200).json({ data: donneesUtilisateurs })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
})

/**
 * @route delete api/donneesUtilisateurs/
 * @description permet de supprimer les données utilisateur
 */
router.delete('/', [jwtauth], async (req, res) => {
    try {
        const donneesUtilisateurs = await DonneesUtilisateur.findOneAndDelete({
            _utilisateur: req.utilisateur._id,
        })

        return res.status(200).json({ data: `Données ${donneesUtilisateurs._id} bien supprimées`})
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
})

module.exports = router
