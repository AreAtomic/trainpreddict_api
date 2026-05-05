//* MODULES *//

//* MODELS *//
const ProfilModel = require('../../../../models/Profil')
const DonneesUtilisateurModel = require('../../../../models/DonneesUtilisateur')
const UtilisateurModel = require('../../../../models/Utilisateur')

/**
 * @route GET /api/v1/coureur/profil
 * @function getProfil
 * @description Récupération d'un profil avec le userId
 */
exports.getProfile = async (req, res) => {
    try {
        const utilisateur = req.utilisateur._id
        const profil = await ProfilModel.findOne({ _utilisateur: utilisateur })
        const donneesUtilisateur = await DonneesUtilisateurModel.findOne({
            _utilisateur: utilisateur,
        })

        return res.status(200).json({
            message: 'Profil récupéré avec succès',
            data: {
                profil: {
                    fcfs: profil.fcfs,
                    pfs: profil.pfs,
                    age: profil.age,
                    poids: profil.poids,
                    sse: donneesUtilisateur.sse,
                    experience: donneesUtilisateur.experience,
                    heure_sommeil: donneesUtilisateur.heure_sommeil,
                    temps_recup_max: donneesUtilisateur.temps_recup_max,
                    nombre_heure_semaine:
                        donneesUtilisateur.nombre_heure_semaine,
                    nombre_seance_semaine:
                        donneesUtilisateur.nombre_seance_semaine,
                    musculation: donneesUtilisateur.musculation,
                    ppg: donneesUtilisateur.ppg,
                    etirement: donneesUtilisateur.etirement,
                    foncier: donneesUtilisateur.foncier,
                    style: donneesUtilisateur.style,
                    point_faible: donneesUtilisateur.point_faible,
                    jours_repos: donneesUtilisateur.jours_repos,
                },
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
 * @route PUT /api/v1/coureur/profil
 * @function putProfil
 * @description Modification d'un profil avec le userId
 */
exports.putProfile = async (req, res) => {
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
            fcfs,
            pfs,
            poids,
            age,
        } = req.body

        const donneesUtilisateur =
            await DonneesUtilisateurModel.findOneAndUpdate(
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

        const profil = await ProfilModel.findOneAndUpdate(
            { _utilisateur: req.utilisateur._id },
            { $set: { fcfs, pfs, age, poids } },
            { new: true, upsert: true }
        )

        return res.status(200).json({
            message: 'Profil modifié avec succès',
            data: {
                profil: {
                    fcfs: profil.fcfs,
                    pfs: profil.pfs,
                    age: profil.age,
                    poids: profil.poids,
                    sse: donneesUtilisateur.sse,
                    experience: donneesUtilisateur.experience,
                    heure_sommeil: donneesUtilisateur.heure_sommeil,
                    temps_recup_max: donneesUtilisateur.temps_recup_max,
                    nombre_heure_semaine:
                        donneesUtilisateur.nombre_heure_semaine,
                    nombre_seance_semaine:
                        donneesUtilisateur.nombre_seance_semaine,
                    musculation: donneesUtilisateur.musculation,
                    ppg: donneesUtilisateur.ppg,
                    etirement: donneesUtilisateur.etirement,
                    foncier: donneesUtilisateur.foncier,
                    style: donneesUtilisateur.style,
                    point_faible: donneesUtilisateur.point_faible,
                    jours_repos: donneesUtilisateur.jours_repos,
                },
            },
        })
    } catch (error) {}
}

/**
 * @route GET /api/v1/coureur/profil/onboarding
 * @function getOnBoarding
 * @description Récupère l'état d'onboarding d'un profil avec le userId
 */
exports.getOnBoarding = async (req, res) => {
    const utilisateurId = req.utilisateur._id
    const utilisateur = await UtilisateurModel.findOne({ _id: utilisateurId })

    console.log(utilisateur, utilisateurId)
    if (!utilisateur) {
        return res.status(404).json({ message: 'Utilisateur introuvable' })
    }

    return res.status(200).json({
        onboarding: utilisateur.onboarding,
        message: 'Utilisateur récupéré',
    })
}

exports.putOnBoarding = async (req, res) => {
    const utilisateurId = req.utilisateur._id
    const utilisateur = await UtilisateurModel.findOneAndUpdate(
        { _id: utilisateurId },
        { $set: { onboarding: req.body.onboarding } }
    )

    if (!utilisateur) {
        return res.status(404).json({ message: 'Utilisateur introuvable' })
    }

    return res.status(200).json({
        onboarding: req.body.onboarding,
        message: 'Utilisateur récupéré',
    })
}
