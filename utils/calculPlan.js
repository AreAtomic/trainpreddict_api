const dayjs = require('dayjs')
const Seances = require('../models/Seance')
let seances

// Classification de toutes les séances par types
const fecthAllSeances = async () => {
    let seance_foncier = await Seances.find({ type: { $in: 'Foncier' } })
    let seance_seuil = await Seances.find({ type: { $in: 'Seuil' } })
    let seance_pma = await Seances.find({ type: { $in: 'PMA' } })
    let seance_vo2max = await Seances.find({ type: { $in: 'VO2 Max' } })
    let seance_rythme = await Seances.find({ type: { $in: 'Rythme' } })
    let seance_recup = await Seances.find({ type: { $in: 'Recuperation' } })

<<<<<<< HEAD
    console.log(
        seance_foncier,
        seance_seuil,
        seance_pma,
        seance_vo2max,
        seance_rythme,
        seance_recup
    )

=======
>>>>>>> production
    return {
        Foncier: seance_foncier,
        Seuil: seance_seuil,
        PMA: seance_pma,
        VO2_Max: seance_vo2max,
        Rythme: seance_rythme,
        Recup: seance_recup,
    }
}

// Définitions des coefficents de sse pour chaque jour de la semaine
const jourEntrainement = (nombre_seance_semaine) => {
    if (nombre_seance_semaine > 1) {
        if (nombre_seance_semaine > 2) {
            if (nombre_seance_semaine > 3) {
                if (nombre_seance_semaine > 4) {
                    if (nombre_seance_semaine > 5) {
                        if (nombre_seance_semaine > 6) {
                            return [0.5, 0.25, 0.5, 1, 0.75, 0.5, 1]
                        }
                        return [0.25, 0, 0.5, 1, 0.75, 0.5, 1]
                    }
                    return [0.25, 0, 0.5, 1, 0.75, 0, 1]
                }
                return [0, 0.5, 1, 0.25, 0, 1, 0]
            }
            return [0, 0, 1, 0.5, 0, 1, 0]
        }
        return [0, 0, 1, 0, 0, 1, 0]
    }
    return [0, 0, 0, 0, 0, 1, 0]
}

const fetching = async () => {
    return await fecthAllSeances()
}

<<<<<<< HEAD
const calculPlan = async (objectif, donneesUtilisateur, ht) => {
    const {
        date_objectif,
        date_debut,
        resultat_vise,
        distance,
        temps,
    } = objectif

=======
const calculPlan = async (date_objectif, date_debut, donneesUtilisateur, ht) => {
>>>>>>> production
    const type = [
        'Foncier',
        'Seuil',
        'PMA',
        'Rythme',
        'Force',
        'VO2 Max',
        'Recuperation',
    ]

    seances = await fetching()
    if (seances !== null) {
        let seances_type = seances
        /* Definition semaine */
        const debut = dayjs(date_debut)
        const fin = dayjs(date_objectif)
        var jours = fin.diff(debut, 'day')
        var seances = []
<<<<<<< HEAD

=======
>>>>>>> production
        for (let i = 0; i < jours; i += 7) {
            let debut_semaine = debut.add(i / 7, 'week')
            let sem = await defSemaine(
                i / 7,
                debut_semaine,
                date_objectif,
                donneesUtilisateur,
                seances_type,
                ht
            )
            seances.push(sem)
        }
    } else {
        seances = res
            .status(200)
            .json({ msg: "il n'y a aucune seance a retourner" })
    }
    return seances
}

/*
  Méthodes complémentaires
*/
const defSemaine = async (
    semaine_passee,
    debut,
    fin,
    donneesUtilisateur,
    seances,
    ht
) => {
    // Récupération de toutes les dates
    var debut = dayjs(debut)
    var fin = dayjs(fin)

    // Si la date de l'objectif est passé
    if (debut.isAfter(fin)) {
        return 'Plan créé'
    }
    // Si l'objectif n'est PAS encore passé
    else {
        const semaine = await choixSeances(
            debut,
            semaine_passee,
            donneesUtilisateur,
            seances,
            ht
        )
        return semaine
    }
}

const choixSeances = async (
    debut,
    semaine_passee,
    donneesUtilisateur,
    seances,
    ht
) => {
    var sse = donneesUtilisateur.sse
    var jours_entrainements = jourEntrainement(
        donneesUtilisateur.nombre_seance_semaine
    )
<<<<<<< HEAD
    console.log(debut.format('DD/MM/YYYY'), semaine_passee)
=======

>>>>>>> production
    // Calcul SSE et choix des jours d'entrainements
    if (semaine_passee >= 0) {
        if (semaine_passee > 1) {
            if (semaine_passee > 4) {
                if (semaine_passee % 4 == 0) {
                    sse = donneesUtilisateur.sse / 2
                    jours_entrainements = jourEntrainement(
                        parseInt(donneesUtilisateur.nombre_seance_semaine - 1)
                    )
                }
            } else {
                sse = donneesUtilisateur.sse / 1.5
                jours_entrainements = jourEntrainement(
                    parseInt(donneesUtilisateur.nombre_seance_semaine / 1.5)
                )
            }
        } else {
            sse = donneesUtilisateur.sse / 2
            jours_entrainements = jourEntrainement(
                parseInt(donneesUtilisateur.nombre_seance_semaine - 1)
            )
        }
    }

    // Def type
    let seances_possible = seances.Foncier
<<<<<<< HEAD
    console.log(seances)
=======
>>>>>>> production
    if (semaine_passee < 22) {
        if (semaine_passee < 18) {
            if (semaine_passee < 16) {
                if (semaine_passee < 12) {
                    if (semaine_passee < 8) {
                        seances_possible.push(seances.Foncier)
                    } else {
                        seances_possible = seances.Seuil.concat(seances.Foncier)
                    }
                } else {
                    seances_possible = seances.PMA.concat(seances.Foncier)
                }
            } else {
                seances_possible = seances.VO2_Max.concat(seances.Foncier)
            }
        } else {
            seances_possible = seances.Rythme.concat(seances.Seuil).concat(
                seances.PMA
            )
        }
    } else {
        seances_possible = seances.Rythme.concat(seances.Seuil)
            .concat(seances.PMA)
            .concat(seances.Foncier)
    }

    let pre_semaine = []
    let semaine = []

    let sse_seance =
        sse /
        (donneesUtilisateur.nombre_seance_semaine > 2
            ? donneesUtilisateur.nombre_seance_semaine - 2
            : donneesUtilisateur.nombre_seance_semaine)
    if (ht) {
        sse_seance = sse_seance / 2
        for (let i = 0; i < seances_possible.length; i++) {
            let seance = seances_possible[i]
            if (seance.score_stress_entrainement < sse_seance) {
                if (
                    seance.duree[1] <
                    donneesUtilisateur.nombre_heure_semaine /
                        donneesUtilisateur.nombre_seance_semaine
                ) {
                    pre_semaine.push(seance)
                }
            }
        }
    } else {
        for (let i = 0; i < seances_possible.length; i++) {
            let seance = seances_possible[i]
            if (seance.score_stress_entrainement < sse_seance) {
                pre_semaine.push(seance)
            }
        }
    }

    // Insertion des séances dans la semaine
    for (let i = 0; i < 7; i++) {
        if (jours_entrainements[i] != 0) {
            const index = Math.floor(
                Math.random() * Math.floor(pre_semaine.length - 1)
            )
            if (jours_entrainements[i] < 0.5) {
                semaine.push([
                    'musculation',
                    dayjs(debut).add(i, 'day').toISOString(),
                ])
            } else {
                semaine.push([
                    pre_semaine[index],
                    dayjs(debut).add(i, 'day').toISOString(),
                ])
            }
        } else {
            semaine.push(['repos', dayjs(debut).add(i, 'day').toISOString()])
        }
    }
    return semaine
}

module.exports = calculPlan
