const dayjs = require('dayjs')
const axios = require('axios')
const e = require('express')
const { header } = require('express-validator')
const dotenv = require('dotenv')
let API_URL = "http://localhost:5000/api"

dotenv.config()
if (process.env.NODE_ENV != 'development') {
    API_URL = "https://trainpreddict.fr:6001"
}
    
let seances
// Classification de toutes les séances par types
const fecthAllSeances = async () => {
    var foncier = await axios.post(
        `${API_URL}/seance/type/`,
        {
            type: ['Foncier'],
        },
        { headers: { 'Content-Type': 'application/json' } }
    )
    var seuil = await axios.post(
        `${API_URL}/seance/type/`,
        {
            type: ['Seuil'],
        },
        { headers: { 'Content-Type': 'application/json' } }
    )
    var pma = await axios.post(
        `${API_URL}/seance/type/`,
        {
            type: ['PMA'],
        },
        { headers: { 'Content-Type': 'application/json' } }
    )
    var vo2max = await axios.post(
        `${API_URL}/seance/type/`,
        {
            type: ['VO2 Max'],
        },
        { headers: { 'Content-Type': 'application/json' } }
    )
    var rythme = await axios.post(
        `${API_URL}/seance/type/`,
        {
            type: ['Rythme'],
        },
        { headers: { 'Content-Type': 'application/json' } }
    )
    var recup = await axios.post(
        `${API_URL}/seance/type/`,
        {
            type: ['Recuperation'],
        },
        { headers: { 'Content-Type': 'application/json' } }
    )

    return {
        Foncier: foncier.data.data.seances,
        Seuil: seuil.data.data.seances,
        PMA: pma.data.data.seances,
        VO2_Max: vo2max.data.data.seances,
        Rythme: rythme.data.data.seances,
        Recup: recup.data.data.seances,
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

const calculPlan = async (objectif, donneesUtilisateur, ht) => {
    const {
        date_objectif,
        date_debut,
        resultat_vise,
        distance,
        temps,
    } = objectif

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
    let seances_type = seances
    /*
    Definition semaine
  */
    const debut = dayjs(date_debut)
    const fin = dayjs(date_objectif)
    var jours = fin.diff(debut, 'day')
    var seances = []

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
        console.log(sem)
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
    console.log(debut.format('DD/MM/YYYY'), semaine_passee)
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
    var seances_possible
    if (semaine_passee < 22) {
        if (semaine_passee < 18) {
            if (semaine_passee < 16) {
                if (semaine_passee < 12) {
                    if (semaine_passee < 8) {
                        seances_possible = seances.Foncier
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
    seances_possible.concat(seances.Recuperation)

    var pre_semaine = []
    var semaine = []

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
