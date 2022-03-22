//* MODULES *//

//* MODELS *//
const Profil = require('../../../../models/Profil')
const DonneesUtilisateur = require('../../../../models/DonneesUtilisateur')

/**
 * @route GET /api/v1/assistant/profil/:userId
 * @function getProfil
 * @description Récupération d'un profil avec le userId
 */
exports.getProfile = async (req, res) => {
    try {
        const utilisateur = req.params.userId
        const profil = await Profil.findOne({ _utilisateur: utilisateur })
        const donneesUtilisateur = await DonneesUtilisateur.findOne({
            _utilisateur: utilisateur,
        })

        return res.status(200).json({
            message: 'Profil récupéré avec succès',
            data: {
                fcfs: profil.fcfs,
                pfs: profil.pfs,
                age: profil.age,
                poids: profil.poids,
                sse: donneesUtilisateur?.sse,
                experience: donneesUtilisateur?.experience,
                heure_sommeil: donneesUtilisateur?.heure_sommeil,
                temps_recup_max: donneesUtilisateur?.temps_recup_max,
                nombre_heure_semaine: donneesUtilisateur?.nombre_heure_semaine,
                nombre_seance_semaine: donneesUtilisateur?.nombre_seance_semaine,
                musculation: donneesUtilisateur?.musculation,
                ppg: donneesUtilisateur?.ppg,
                etirement: donneesUtilisateur?.etirement,
                foncier: donneesUtilisateur?.foncier,
                style: donneesUtilisateur?.style,
                point_faible: donneesUtilisateur?.point_faible,
                jours_repos: donneesUtilisateur?.jours_repos,
            },
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error: error.message,
            message: 'Une erreur est servenue, veuillez réessayer plus tard.',
        })
    }
}

/**
 * @route PUT /api/v1/assistant/profil/:userId
 * @function putProfil
 * @description Modification d'un profil avec le userId
 */
exports.putProfile = async (req, res) => {
    try {
        console.log('Profile update')
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
            fcfs,
            pfs,
            poids,
            age,
        } = req.body

        const donneesUtilisateur = await DonneesUtilisateur.findOneAndUpdate(
            { _utilisateur: req.params.userId },
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

        const profil = await Profil.findOneAndUpdate(
            { _utilisateur: req.params.userId },
            { $set: { fcfs, pfs, age, poids } },
            { new: true, upsert: true }
        )

        console.log('Update')

        return res.status(200).json({
            message: 'Profil modifié avec succès',
            data: {
                fcfs: profil.fcfs,
                pfs: profil.pfs,
                age: profil.age,
                poids: profil.poids,
                sse: donneesUtilisateur.sse,
                experience: donneesUtilisateur.experience,
                heure_sommeil: donneesUtilisateur.heure_sommeil,
                temps_recup_max: donneesUtilisateur.temps_recup_max,
                nombre_heure_semaine: donneesUtilisateur.nombre_heure_semaine,
                nombre_seance_semaine: donneesUtilisateur.nombre_seance_semaine,
                musculation: donneesUtilisateur.musculation,
                ppg: donneesUtilisateur.ppg,
                etirement: donneesUtilisateur.etirement,
                foncier: donneesUtilisateur.foncier,
                style: donneesUtilisateur.style,
                point_faible: donneesUtilisateur.point_faible,
                jours_repos: donneesUtilisateur.jours_repos,
            },
        })
    } catch (error) {
        console.log(error)
        return res
            .status(500)
            .json({
                error: 'An error occcured, please try again later',
                message: error.message,
            })
    }
}
