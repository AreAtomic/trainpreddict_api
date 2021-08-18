/**
 * @import Modules
 */
const express = require('express')
const router = express.Router()
const dayjs = require('dayjs')
const FitParser = require('fit-file-parser').default
const axios = require('axios')
const { jwtauth } = require('../middlewares/auth.middleware')

/**
 * @import Models
 */
const Entrainement = require('../models/Entrainement')
const Profil = require('../models/Profil')

// Create a FitParser instance (options argument is optional)
let fitParser = new FitParser({
    force: true,
    speedUnit: 'km/h',
    lengthUnit: 'km',
    temperatureUnit: 'celsius',
    elapsedRecordField: true,
    mode: 'both',
})

/**
 * @route PUT api/entrainement/:id/resentis
 * Permet d'insérer un resentis dans un entrainement
 */
router.put('/:entrainementId/ressentis', [jwtauth], async (req, res) => {
    const entrainementId = req.params.entrainementId
    let seance = await Entrainement.findOneAndUpdate(
        { _id: entrainementId },
        { $set: { ressentis: req.body.ressentis } },
        { new: true, upsert: true }
    )

    if (dayjs(seance.date).toISOString() !== seance.date) {
        seance.date = dayjs(seance.date).toISOString()
        seance.save()
    }

    return res.status(200).json({ data: seance })
})

/**
 * @route POST api/entrainement/:id/typeEntrainement
 * Permet d'insérer un type de séance dans un entrainement
 */
router.put('/:entrainementId/typeEntrainement', [jwtauth], async (req, res) => {
    const entrainementId = req.params.entrainementId
    let seance = await Entrainement.findOneAndUpdate(
        { _id: entrainementId },
        { $set: { type_entrainement: req.body.type_entrainement } },
        { new: true, upsert: true }
    )

    if (dayjs(seance.date).toISOString() !== seance.date) {
        seance.date = dayjs(seance.date).toISOString()
        seance.save()
    }

    return res.status(200).json({ data: seance })
})

/**
 * @route POST api/entrainement/file
 * Permet de créer un entrainement depuis un fichie
 */
router.post('/file', [jwtauth], async (req, res) => {
    // Récupération du profil
    const user = req.utilisateur._id
    const profil = await Profil.findOne({ _utilisateur: user })
    console.log('ENTRAINEMENT')
    // Vérification
    if (!req.files || Object.keys(req.files).length === 0) {
        return res
            .status(400)
            .json({ error: 'Le fichier doit être de type .fit' })
    }
    let sampleFile = req.files.file

    // Enregistrement du fichier
    const content = sampleFile.data
    const titre = sampleFile.name
    let type_entrainement = ['Inconnu']

    try {
        fitParser.parse(content, async function (error, data) {
            if (error) {
                return res.status(202).json({ error: error })
            }
            const data_activity = data.activity.sessions[0]
            // Récupère toutes les infos du fichier
            const type = titre
            const duree = toHHMMSS(data_activity.total_timer_time)
            const distance = toKM(data_activity.total_distance)
            const deniv = toDM(
                typeof data_activity.total_ascent != NaN
                    ? data_activity.total_ascent
                    : 0
            )
            const fc_max = data_activity.max_heart_rate
            const fc_moy = data_activity.avg_heart_rate
            const cadence_moy = data_activity.avg_cadence
            const cadence_max = data_activity.max_cadence
            const power_moy = data_activity.avg_power
            const power_max = data_activity.max_power
            const normalized_power = data_activity.normalized_power
            const calories = data_activity.total_calories

            // Controle que l'entrainement n'a pas déjà été upload
            const day = dayjs(data_activity.timestamp)
            const date = day.toISOString()
            let entrainement = await Entrainement.find({
                _utilisateur: user,
                type: type,
            })

            if (entrainement.length != 0) {
                return res.status(202).json({
                    error: `Duplication de l'entrainement ${entrainement[0]._id}`,
                })
            }

            // Vérification qu'il y est fc ou puissance
            if (
                (power_moy == 0 || power_moy == undefined) &&
                (fc_moy == 0 || fc_moy == undefined)
            ) {
                return res.status(202).json({
                    error:
                        "Impossible d'analyser cette séance pas de watt ni de fréquence cardiaque, un des deux est requis",
                })
            }

            // Cas juste puissance
            if (fc_moy == 0 || fc_moy == undefined) {
                // Calcul
                let specifique = []
                let description = ''
                let Z1 = 0
                let Z2 = 0
                let Z3 = 0
                let Z4 = 0
                let Z5 = 0
                let Z6 = 0
                let Z7 = 0
                let Z1_W = 0
                let Z2_W = 0
                let Z3_W = 0
                let Z4_W = 0
                let Z5_W = 0
                let Z6_W = 0
                let Z7_W = 0

                let score_stress_entrainement =
                    (((data_activity.total_timer_time *
                        power_moy *
                        (power_moy / profil.pfs)) /
                        (3600 * profil.pfs)) *
                        100) /
                    2

                // Lecture de chaque points
                let detailed_seconds = []
                let power_seconds = []
                let cad_seconds = []
                let point_carte = []

                for (let i = 0; i < data.records.length; i++) {
                    let point = data.records[i]
                    // Calcul zone
                    const power = point.power == undefined ? 0 : point.power

                    // Définition zone
                    let pourcentage_power = power / profil.pfs
                    let zone_power = power_zone(pourcentage_power)
                    let zone = zone_power

                    // Incrémentation temps zones
                    if (zone_power > 1) {
                        if (zone_power > 2) {
                            if (zone_power > 3) {
                                if (zone_power > 4) {
                                    if (zone_power > 5) {
                                    } else {
                                        Z5_W += 1
                                    }
                                } else {
                                    Z4_W += 1
                                }
                            } else {
                                Z3_W += 1
                            }
                        } else {
                            Z2_W += 1
                        }
                    } else {
                        Z1_W += 1
                    }

                    if (zone > 1) {
                        if (zone > 2) {
                            if (zone > 3) {
                                if (zone > 4) {
                                    if (zone_power > 5) {
                                        if (zone_power > 6) {
                                            Z7 += 1
                                            Z7_W++
                                        } else {
                                            Z6 += 1
                                            Z6_W++
                                        }
                                    } else {
                                        Z5 += 1
                                    }
                                } else {
                                    Z4 += 1
                                }
                            } else {
                                Z3 += 1
                            }
                        } else {
                            Z2 += 1
                        }
                    } else {
                        Z1 += 1
                    }

                    let add = {
                        duree: toHHMMSS(point.timer_time),
                        lat: point.position_lat,
                        long: point.position_long,
                        vitesse: toKM(point.speed),
                        altitude: toDM(point.altitude),
                        cadence: point.cadence == undefined ? 0 : point.cadence,
                        power: power,
                        zones: {
                            power: zone_power,
                            gen: zone,
                        },
                    }
                    detailed_seconds.push(add)
                    power_seconds.push(
                        detailed_seconds[detailed_seconds.length - 1].power
                    )
                    cad_seconds.push(
                        detailed_seconds[detailed_seconds.length - 1].cadence
                    )
                    point_carte.push([
                        detailed_seconds[detailed_seconds.length - 1].lat,
                        detailed_seconds[detailed_seconds.length - 1].long,
                    ])
                }

                // Normalisation à 10s
                let n10_zone = []
                let n10_power = []
                for (let i = 0; i < detailed_seconds.length; i += 10) {
                    let sum_power = 0
                    let true_power = 0
                    for (
                        let j = i;
                        j < i + 9 && j < detailed_seconds.length - 1;
                        j++
                    ) {
                        sum_power += detailed_seconds[j].zones.power
                        true_power += power_seconds[j]
                    }
                    n10_power.push(true_power / 10)
                    sum_power = sum_power / 10
                    sum = sum_power

                    let zones = {
                        power: sum_power,
                        gen: sum,
                    }

                    n10_zone.push(zones)
                }

                // Normalisation à 30s
                let n30_zone = []
                n30_power = []
                for (let i = 0; i < detailed_seconds.length; i += 30) {
                    let sum_power = 0
                    let true_power = 0
                    for (
                        let j = i;
                        j < i + 29 && j < detailed_seconds.length - 1;
                        j++
                    ) {
                        sum_power += detailed_seconds[j].zones.power
                        true_power += power_seconds[j]
                    }
                    sum_power = sum_power / 30
                    sum = sum_power

                    let zones = {
                        power: sum_power,
                        gen: Math.round(sum),
                    }

                    n30_zone.push(zones)
                    n30_power.push(sum_power)
                }

                // Spécifique
                let sto = 0
                let temps = 0
                for (let i = 0; i < n30_zone.length; i++) {
                    if (i == 0) {
                        temps = 30
                        sto = Math.round(n30_zone[i].gen)
                    }
                    if (Math.round(n30_zone[i].gen) == sto) {
                        temps += 30
                    } else {
                        if (temps < 60) {
                            specifique.push(`Z${sto}: ${toHHMMSS(temps)}`)
                        } else {
                            specifique.push(`Z${sto}: ${toHHMMSS(temps)}`)
                        }
                        sto = n30_zone[i].gen
                        temps = 30
                    }
                }

                // Calcul intensité travail
                let intensite_travail = Math.round(
                    (data_activity.total_timer_time / 60) *
                        (power_moy / profil.pfs +
                            Z1 / 60 / (data_activity.total_timer_time / 60) +
                            Z2 / 60 / (data_activity.total_timer_time / 60) +
                            Z3 / 60 / (data_activity.total_timer_time / 60) +
                            Z4 / 60 / (data_activity.total_timer_time / 60) +
                            Z5 / 60 / (data_activity.total_timer_time / 60) +
                            Z6 / 60 / (data_activity.total_timer_time / 60) +
                            Z7 / 60 / (data_activity.total_timer_time / 60))
                )
                //Calcul sse
                score_stress_entrainement = Math.round(
                    (score_stress_entrainement + intensite_travail) / 4
                )

                if (Z1 > data_activity.total_timer_time / 3) {
                    description +=
                        "Tu as passé beaucoup de temps en zone 1, c'est une très bonne sortie de récupération ou que tu es très fatigué."
                }
                if (Z2 > data_activity.total_timer_time / 2) {
                    description +=
                        "Tu as réalisé un bonne sortie d'endurance fondamentale."
                }
                if (Z4 / data_activity.total_timer_time > 0.2) {
                    description +=
                        'Tu tiens très bien le seuil, tu commences à être en forme ou tu es déjà en forme.'
                }
                if (Z5 / data_activity.total_timer_time > 0.05) {
                    description +=
                        'Tu as une très bonne PMA, tu es soit très très adepte des accouts soit très en forme si tu resistes également bien au seuil.\n'
                }

                Z1 = toHHMMSS(Z1)
                Z2 = toHHMMSS(Z2)
                Z3 = toHHMMSS(Z3)
                Z4 = toHHMMSS(Z4)
                Z5 = toHHMMSS(Z5)
                Z6 = toHHMMSS(Z6)
                Z7 = toHHMMSS(Z7)

                // Poste la séances sur Mongo
                entrainement = new Entrainement({
                    _utilisateur: user,
                    date: dayjs(date).format('MM/DD/YYYY'),
                    duree,
                    distance,
                    deniv,
                    intensite_travail,
                    score_stress_entrainement,
                    power_seconds: power_seconds,
                    cad_seconds: cad_seconds,
                    n10_power: n10_power,
                    n30_power: n30_power,
                    type,
                    type_entrainement,
                    duree,
                    distance,
                    cadence_moy,
                    cadence_max,
                    power_moy,
                    power_max,
                    normalized_power,
                    calories,
                    specifique,
                    description,
                    Z1,
                    Z2,
                    Z3,
                    Z4,
                    Z5,
                    Z6,
                    Z7,
                    power_zone: [Z1_W, Z2_W, Z3_W, Z4_W, Z5_W, Z6_W, Z7_W],
                    point_carte: point_carte,
                })

                entrainement.save()
                return res.status(200).json({
                    data: entrainement,
                    msg: 'Entrainement créé avec succès',
                })
            }

            // FC Seulement
            if (power_moy == undefined) {
                let specifique = []
                let description = ''
                let Z1 = 0
                let Z2 = 0
                let Z3 = 0
                let Z4 = 0
                let Z5 = 0
                let Z1_FC = 0
                let Z2_FC = 0
                let Z3_FC = 0
                let Z4_FC = 0
                let Z5_FC = 0

                let score_stress_entrainement =
                    ((data_activity.total_timer_time *
                        fc_moy *
                        (fc_moy / profil.fcfs)) /
                        (3600 * profil.fcfs)) *
                    100 *
                    2

                let detailed_seconds = []
                let fc_seconds = []
                let point_carte = []
                let cad_seconds = []

                for (let i = 0; i < data.records.length; i++) {
                    let point = data.records[i]
                    // Calcul zone
                    const fc =
                        point.heart_rate == undefined ? 0 : point.heart_rate

                    // Définition zone
                    let pourcentage_fc = fc / profil.fcfs
                    let zone_fc = fc_zone(pourcentage_fc)
                    let zone = zone_fc

                    if (zone_fc > 1) {
                        if (zone_fc > 2) {
                            if (zone_fc > 3) {
                                if (zone_fc > 4) {
                                    if (zone_fc > 5) {
                                    } else {
                                        Z5_FC += 1
                                    }
                                } else {
                                    Z4_FC += 1
                                }
                            } else {
                                Z3_FC += 1
                            }
                        } else {
                            Z2_FC += 1
                        }
                    } else {
                        Z1_FC += 1
                    }

                    if (zone > 1) {
                        if (zone > 2) {
                            if (zone > 3) {
                                if (zone > 4) {
                                    Z5 += 1
                                } else {
                                    Z4 += 1
                                }
                            } else {
                                Z3 += 1
                            }
                        } else {
                            Z2 += 1
                        }
                    } else {
                        Z1 += 1
                    }

                    let add = {
                        duree: toHHMMSS(point.timer_time),
                        lat: point.position_lat,
                        long: point.position_long,
                        vitesse: toKM(point.speed),
                        altitude: toDM(point.altitude),
                        cadence: point.cadence == undefined ? 0 : point.cadence,
                        fc: fc,
                        zones: {
                            fc: zone_fc,
                            gen: zone,
                        },
                    }
                    detailed_seconds.push(add)
                    fc_seconds.push(
                        detailed_seconds[detailed_seconds.length - 1].fc
                    )
                    cad_seconds.push(
                        detailed_seconds[detailed_seconds.length - 1].cadence
                    )
                    point_carte.push([
                        detailed_seconds[detailed_seconds.length - 1].lat,
                        detailed_seconds[detailed_seconds.length - 1].long,
                    ])
                }

                // Normalisation à 10s
                let n10_zone = []
                let n10_fc = []
                for (let i = 0; i < detailed_seconds.length; i += 10) {
                    let sum_fc = 0
                    let true_fc = 0
                    for (
                        let j = i;
                        j < i + 9 && j < detailed_seconds.length - 1;
                        j++
                    ) {
                        sum_fc += detailed_seconds[j].zones.fc
                        true_fc += fc_seconds[j]
                    }
                    n10_fc.push(true_fc / 10)
                    sum_fc = sum_fc / 10
                    sum = sum_fc

                    let zones = {
                        fc: sum_fc,
                        gen: sum,
                    }

                    n10_zone.push(zones)
                }

                // Normalisation à 30s
                let n30_zone = []
                let n30_fc = []

                for (let i = 0; i < detailed_seconds.length; i += 30) {
                    let sum_fc = 0
                    for (
                        let j = i;
                        j < i + 29 && j < detailed_seconds.length - 1;
                        j++
                    ) {
                        sum_fc += detailed_seconds[j].zones.fc
                        true_fc += fc_seconds[j]
                    }
                    sum_fc = sum_fc / 30
                    sum = sum_fc

                    let zones = {
                        fc: sum_fc,
                        gen: Math.round(sum),
                    }

                    n30_zone.push(zones)
                    n30_fc.push(sum_fc)
                }

                // Spécifique
                let sto = 0
                let temps = 0
                for (let i = 0; i < n30_zone.length; i++) {
                    if (i == 0) {
                        temps = 30
                        sto = Math.round(n30_zone[i].gen)
                    }
                    if (Math.round(n30_zone[i].gen) == sto) {
                        temps += 30
                    } else {
                        if (temps < 60) {
                            specifique.push(`Z${sto}: ${toHHMMSS(temps)}`)
                        } else {
                            specifique.push(`Z${sto}: ${toHHMMSS(temps)}`)
                        }
                        sto = n30_zone[i].gen
                        temps = 30
                    }
                }

                // Calcul intensité travail
                let intensite_travail = Math.round(
                    (data_activity.total_timer_time / 60) *
                        (fc_moy / profil.fcfs +
                            Z1 / 60 / (data_activity.total_timer_time / 60) +
                            Z2 / 60 / (data_activity.total_timer_time / 60) +
                            Z3 / 60 / (data_activity.total_timer_time / 60) +
                            Z4 / 60 / (data_activity.total_timer_time / 60) +
                            Z5 / 60 / (data_activity.total_timer_time / 60))
                )
                //Calcul sse
                score_stress_entrainement = Math.round(
                    (score_stress_entrainement + intensite_travail) / 4
                )

                if (Z1 / data_activity.total_timer > 0.3) {
                    description +=
                        'Ton coeur est très bas, cela veut dire que tu as fait une très bonne sortie de récupération ou que tu es très en forme et que ton coeur ne monte que quand cela est nécessaire ou que tu es très fatigué.'
                }
                if (
                    Z4 / data_activity.total_timer_time > 0.2 &&
                    Z5 / data_activity.total_timer_time > 0.1
                ) {
                    description +=
                        'Ton coeur monte vite, cela veut dire que tu es dans une phase de surcompensation et que ton corps commence à assimiler ton entraînement ou que tu es sur une phase descendante de ta courbe de forme.'
                }
                if (Z2 / data_activity.total_timer_time > 0.5) {
                    description +=
                        "Tu as réalisé un bonne sortie d'endurance fondamentale."
                }
                if (
                    Z4 / data_activity.total_timer_time > 0.2 &&
                    Z1 / data_activity.total_timer_time > 0.2
                ) {
                    description +=
                        'Ton coeur est très en forme il monte vite mais descend également vite.'
                }
                if (Z4 / data_activity.total_timer_time > 0.2) {
                    description +=
                        'Tu tiens très bien le seuil, tu commences à être en forme ou tu es déjà en forme.'
                }
                if (Z5 / data_activity.total_timer_time > 0.05) {
                    description +=
                        'Tu as une très bonne PMA, tu es soit très très adepte des accouts soit très en forme si tu resistes également bien au seuil.\n'
                }

                // Poste la séances sur Mongo
                entrainement = new Entrainement({
                    _utilisateur: user,
                    date: dayjs(date).format('MM/DD/YYYY'),
                    duree,
                    distance,
                    deniv,
                    intensite_travail,
                    score_stress_entrainement,
                    fc_seconds: fc_seconds,
                    cad_seconds: cad_seconds,
                    n10_fc: n10_fc,
                    n30_fc: n30_fc,
                    type,
                    type_entrainement,
                    fc_max,
                    fc_moy,
                    cadence_moy,
                    cadence_max,
                    calories,
                    specifique,
                    description,
                    Z1,
                    Z2,
                    Z3,
                    Z4,
                    Z5,
                    zone_fc: [Z1_FC, Z2_FC, Z3_FC, Z4_FC, Z5_FC],
                    point_carte: point_carte,
                })

                entrainement.save()
                return res.status(200).json({
                    data: entrainement,
                    msg: 'Entrainement créé avec succès',
                })
            }

            // Calcul
            let specifique = []
            let description = ''
            let Z1 = 0
            let Z2 = 0
            let Z3 = 0
            let Z4 = 0
            let Z5 = 0
            let Z6 = 0
            let Z7 = 0
            let Z1_FC = 0
            let Z2_FC = 0
            let Z3_FC = 0
            let Z4_FC = 0
            let Z5_FC = 0
            let Z1_W = 0
            let Z2_W = 0
            let Z3_W = 0
            let Z4_W = 0
            let Z5_W = 0
            let Z6_W = 0
            let Z7_W = 0

            let score_stress_entrainement =
                (((data_activity.total_timer_time *
                    fc_moy *
                    (fc_moy / profil.fcfs)) /
                    (3600 * profil.fcfs)) *
                    100 *
                    2 +
                    ((data_activity.total_timer_time *
                        power_moy *
                        (power_moy / profil.pfs)) /
                        (3600 * profil.pfs)) *
                        100) /
                2

            let coeur_haut = 0
            let coeur_bas = 0

            // Lecture de chaque points
            let detailed_seconds = []
            let fc_seconds = []
            let power_seconds = []
            let cad_seconds = []
            let point_carte = []

            for (let i = 0; i < data.records.length; i++) {
                let point = data.records[i]
                // Calcul zone
                const power = point.power == undefined ? 0 : point.power
                const fc = point.heart_rate == undefined ? 0 : point.heart_rate

                // Définition zone
                let pourcentage_fc = fc / profil.fcfs
                let zone_fc = fc_zone(pourcentage_fc)
                let pourcentage_power = power / profil.pfs
                let zone_power = power_zone(pourcentage_power)
                let zone = Math.round((zone_fc + zone_power) / 2)

                if (zone_fc > 1) {
                    if (zone_fc > 2) {
                        if (zone_fc > 3) {
                            if (zone_fc > 4) {
                                if (zone_fc > 5) {
                                } else {
                                    Z5_FC += 1
                                }
                            } else {
                                Z4_FC += 1
                            }
                        } else {
                            Z3_FC += 1
                        }
                    } else {
                        Z2_FC += 1
                    }
                } else {
                    Z1_FC += 1
                }

                if (zone_fc > zone_power + 0.5) {
                    coeur_haut += 1
                }
                if (zone_power > zone_fc + 0.5) {
                    coeur_bas += 1
                }

                if (zone_power > 1) {
                    if (zone_power > 2) {
                        if (zone_power > 3) {
                            if (zone_power > 4) {
                                if (zone_power > 5) {
                                } else {
                                    Z5_W += 1
                                }
                            } else {
                                Z4_W += 1
                            }
                        } else {
                            Z3_W += 1
                        }
                    } else {
                        Z2_W += 1
                    }
                } else {
                    Z1_W += 1
                }

                if (zone > 1) {
                    if (zone > 2) {
                        if (zone > 3) {
                            if (zone > 4) {
                                if (zone_power > 5) {
                                    if (zone_power > 6) {
                                        Z7 += 1
                                        Z7_W++
                                    } else {
                                        Z6 += 1
                                        Z6_W++
                                    }
                                } else {
                                    Z5 += 1
                                }
                            } else {
                                Z4 += 1
                            }
                        } else {
                            Z3 += 1
                        }
                    } else {
                        Z2 += 1
                    }
                } else {
                    Z1 += 1
                }

                let add = {
                    duree: toHHMMSS(point.timer_time),
                    lat: point.position_lat,
                    long: point.position_long,
                    vitesse: toKM(point.speed),
                    altitude: toDM(point.altitude),
                    cadence: point.cadence == undefined ? 0 : point.cadence,
                    fc:
                        fc == 0 && detailed_seconds.length > 0
                            ? detailed_seconds[detailed_seconds.length - 1].fc
                            : fc,
                    power: power,
                    zones: {
                        fc: zone_fc,
                        power: zone_power,
                        gen: zone,
                    },
                }
                detailed_seconds.push(add)
                fc_seconds.push(
                    detailed_seconds[detailed_seconds.length - 1].fc
                )
                power_seconds.push(
                    detailed_seconds[detailed_seconds.length - 1].power
                )
                cad_seconds.push(
                    detailed_seconds[detailed_seconds.length - 1].cadence
                )
                point_carte.push([
                    detailed_seconds[detailed_seconds.length - 1].lat,
                    detailed_seconds[detailed_seconds.length - 1].long,
                ])
            }

            // Normalisation à 10s
            let n10_zone = []
            n10_fc = []
            n10_power = []
            for (let i = 0; i < detailed_seconds.length; i += 10) {
                let sum_fc = 0
                let sum_power = 0
                let true_fc = 0
                let true_power = 0
                for (
                    let j = i;
                    j < i + 9 && j < detailed_seconds.length - 1;
                    j++
                ) {
                    sum_fc += detailed_seconds[j].zones.fc
                    true_fc += fc_seconds[j]
                    sum_power += detailed_seconds[j].zones.power
                    true_power += power_seconds[j]
                }
                n10_fc.push(true_fc / 10)
                n10_power.push(true_power / 10)
                sum_fc = sum_fc / 10
                sum_power = sum_power / 10
                sum = Math.round((sum_fc + sum_power) / 2)

                let zones = {
                    fc: sum_fc,
                    power: sum_power,
                    gen: sum,
                }

                n10_zone.push(zones)
            }

            // Normalisation à 30s
            let n30_zone = []
            n30_fc = []
            n30_power = []
            for (let i = 0; i < detailed_seconds.length; i += 30) {
                let sum_fc = 0
                let sum_power = 0
                let true_fc = 0
                let true_power = 0
                for (
                    let j = i;
                    j < i + 29 && j < detailed_seconds.length - 1;
                    j++
                ) {
                    sum_fc += detailed_seconds[j].zones.fc
                    true_fc += fc_seconds[j]
                    sum_power += detailed_seconds[j].zones.power
                    true_power += power_seconds[j]
                }
                sum_fc = sum_fc / 30
                sum_power = sum_power / 30
                sum = Math.round((sum_fc + sum_power) / 2)

                let zones = {
                    fc: sum_fc,
                    power: sum_power,
                    gen: sum,
                }

                n30_zone.push(zones)
                n30_fc.push(sum_fc)
                n30_power.push(sum_power)
            }

            // Spécifique
            let sto = 0
            let temps = 0
            for (let i = 0; i < n30_zone.length; i++) {
                if (i == 0) {
                    temps = 30
                    sto = n30_zone[i].gen
                }
                if (n30_zone[i].gen == sto) {
                    temps += 30
                } else {
                    if (temps < 60) {
                        specifique.push(`Z${sto}: ${toHHMMSS(temps)}`)
                    } else {
                        specifique.push(`Z${sto}: ${toHHMMSS(temps)}`)
                    }
                    sto = n30_zone[i].gen
                    temps = 30
                }
            }

            // Calcul intensité travail
            let intensite_travail = Math.round(
                (data_activity.total_timer_time / 60) *
                    (power_moy / profil.pfs +
                        Z1 / 60 / (data_activity.total_timer_time / 60) +
                        Z2 / 60 / (data_activity.total_timer_time / 60) +
                        Z3 / 60 / (data_activity.total_timer_time / 60) +
                        Z4 / 60 / (data_activity.total_timer_time / 60) +
                        Z5 / 60 / (data_activity.total_timer_time / 60) +
                        Z6 / 60 / (data_activity.total_timer_time / 60) +
                        Z7 / 60 / (data_activity.total_timer_time / 60))
            )
            //Calcul sse
            score_stress_entrainement = Math.round(
                (score_stress_entrainement + intensite_travail) / 4
            )

            if (Z1 / data_activity.total_timer_time > 0.2) {
                description +=
                    'Ton coeur est très bas, cela veut dire que tu as fait une très bonne sortie de récupération ou que tu es très en forme et que ton coeur ne monte que quand cela est nécessaire ou que tu es très fatigué.'
            }
            if (
                coeur_haut != coeur_bas &&
                coeur_haut / data_activity.total_timer_time > 0.1
            ) {
                description +=
                    'Ton coeur monte plus vite que tes watts, cela veut dire que tu es dans une phase de surcompensation et que ton corps commence à assimiler ton entraînement ou que tu es sur une phase descendante de ta courbe de forme.'
            }
            if (coeur_bas == coeur_haut) {
                description +=
                    'Ton coeur est très en forme il monte vite mais descend également vite.'
            }
            if (Z4 / data_activity.total_timer_time > 0.2) {
                description +=
                    'Tu tiens très bien le seuil, tu commences à être en forme ou tu es déjà en forme.'
            }
            if (Z5 / data_activity.total_timer_time > 0.5) {
                description +=
                    'Tu as une très bonne PMA, tu es soit très très adepte des accouts soit très en forme si tu resistes également bien au seuil.\n'
            }

            Z1 = toHHMMSS(Z1)
            Z2 = toHHMMSS(Z2)
            Z3 = toHHMMSS(Z3)
            Z4 = toHHMMSS(Z4)
            Z5 = toHHMMSS(Z5)
            Z6 = toHHMMSS(Z6)
            Z7 = toHHMMSS(Z7)

            // Poste la séances sur Mongo
            entrainement = new Entrainement({
                _utilisateur: user,
                date: dayjs(date).format('MM/DD/YYYY'),
                duree,
                distance,
                deniv,
                intensite_travail,
                score_stress_entrainement,
                fc_seconds: fc_seconds,
                power_seconds: power_seconds,
                cad_seconds: cad_seconds,
                n10_fc: n10_fc,
                n10_power: n10_power,
                n30_fc: n30_fc,
                n30_power: n30_power,
                date,
                type,
                type_entrainement,
                fc_max,
                fc_moy,
                cadence_moy,
                cadence_max,
                power_moy,
                power_max,
                normalized_power,
                calories,
                specifique,
                description,
                Z1,
                Z2,
                Z3,
                Z4,
                Z5,
                Z6,
                Z7,
                zone_fc: [Z1_FC, Z2_FC, Z3_FC, Z4_FC, Z5_FC],
                power_zone: [Z1_W, Z2_W, Z3_W, Z4_W, Z5_W, Z6_W, Z7_W],
                point_carte,
            })

            entrainement.save()
            return res.status(200).json({
                data: entrainement,
                msg: 'Entrainement créé avec succès',
            })
        })
    } catch (e) {
        console.log(e)
        return res.status(202).json({
            error: e.message,
        })
    }
})

/**
 * @route GET api/entrainement
 * @description Permet de récupérer une séances avec son id
 */
router.get('/', [jwtauth], async (req, res) => {
    try {
        const seance = await Entrainement.find({
            _utilisateur: req.utilisateur._id,
        })
        return res.status(200).json({ data: seance.reverse() })
    } catch (err) {
        return res.status(500).json({ error: 'Une erreur est survenue' })
    }
})

/**
 * @route GET api/entrainement
 * @description Permet de récupérer une séances avec son id
 */
router.get('/:entrainementId', [jwtauth], async (req, res) => {
    axios
        .get(
            `http://localhost:5000/api/entrainement/${req.params.entrainementId}/performance`
        )
        .then()
        .catch()

    const seance = await Entrainement.findOne({
        _id: req.params.entrainementId,
    })

    return res.status(200).json({ data: seance })
})

/**
 * @route DELETE api/entrainement
 * @description Permet de supprimer une séances avec son id
 */
router.delete('/:entrainementId', [jwtauth], async (req, res) => {
    console.log('supression')
    const seance = await Entrainement.findOneAndDelete({
        _utilisateur: req.utilisateur._id,
        _id: req.params.entrainementId,
    })

    const entrainements = await Entrainement.find({
        _utilisateur: req.utilisateur._id,
    })

    return res.status(200).json({
        data: entrainements.reverse(),
        msg: `L'entrainement ${req.params.entrainementId} a été supprimé`,
    })
})

/**
 * @route GET api/entrainement/:entrainementId/performance
 * @description Calcule les performance
 */
router.get('/:entrainementId/performance', async (req, res) => {
    let entrainement = await Entrainement.findOne({
        _id: req.params.entrainementId,
    })

    let max_20_mins = 0
    let max_5_mins = 0
    let max_1_min = 0
    let max_5_secs = 0

    let points = entrainement.power_seconds

    if (!points) {
        return res.status(200).json({
            error: 'Impossible de trouver des statistiques de puissance',
        })
    }

    for (let i = 0; i < points.length; i++) {
        if (i > 4) {
            max_5_secs =
                moyenneArray(points.slice(i - 5, i)) > max_5_secs
                    ? moyenneArray(points.slice(i - 5, i))
                    : max_5_secs
            if (i > 59) {
                max_1_min =
                    moyenneArray(points.slice(i - 60, i)) > max_1_min
                        ? moyenneArray(points.slice(i - 60, i))
                        : max_1_min

                if (i > 299) {
                    max_5_mins =
                        moyenneArray(points.slice(i - 300, i)) > max_5_mins
                            ? moyenneArray(points.slice(i - 300, i))
                            : max_5_mins

                    if (i > 1199) {
                        max_20_mins =
                            moyenneArray(points.slice(i - 1200, i)) >
                            max_20_mins
                                ? moyenneArray(points.slice(i - 1200, i))
                                : max_20_mins
                    } else {
                        max_20_mins = moyenneArray(points)
                    }
                } else {
                    max_5_mins = moyenneArray(points)
                }
            } else {
                max_1_min = moyenneArray(points)
            }
        } else {
            max_5_secs = moyenneArray(points)
            max_1_min = moyenneArray(points)
            max_5_mins = moyenneArray(points)
            max_20_mins = moyenneArray(points)
        }
    }

    const profil = await Profil.findOne({
        _utilisateur: entrainement._utilisateur,
    })

    entrainement = await Entrainement.findOneAndUpdate(
        { _id: req.params.entrainementId },
        {
            $set: {
                date: dayjs(entrainement.date).toISOString(),
                tableau_statistiques: {
                    max_20_mins: [max_20_mins, max_20_mins / profil.poids],
                    max_5_mins: [max_5_mins, max_5_mins / profil.poids],
                    max_1_min: [max_1_min, max_1_min / profil.poids],
                    max_5_secs: [max_5_secs, max_5_secs / profil.poids],
                },
            },
        },
        { upsert: true }
    )

    return res.status(200).json({
        data: {
            tableau: entrainement.tableau_statistiques,
        },
        msg: "Récupération des performances de l'entrainement",
    })
})

/**
 * @route POST /api/entrainement/statistiques/all
 * @description Met à jour tous les entrainements avec le tableau de stats
 */
router.post('/statistiques/all', async (req, res) => {
    try {
        const entrainements = await Entrainement.find({})

        for (let i = 0; i < entrainements.length; i++) {
            let entrainement = await Entrainement.findOne({
                _id: entrainements[i]._id,
            })

            let max_20_mins = 0
            let max_5_mins = 0
            let max_1_min = 0
            let max_5_secs = 0

            let points = entrainement.power_seconds

            if (points) {
                for (let i = 0; i < points.length; i++) {
                    if (i > 4) {
                        max_5_secs =
                            moyenneArray(points.slice(i - 5, i)) > max_5_secs
                                ? moyenneArray(points.slice(i - 5, i))
                                : max_5_secs
                        if (i > 59) {
                            max_1_min =
                                moyenneArray(points.slice(i - 60, i)) >
                                max_1_min
                                    ? moyenneArray(points.slice(i - 60, i))
                                    : max_1_min

                            if (i > 299) {
                                max_5_mins =
                                    moyenneArray(points.slice(i - 300, i)) >
                                    max_5_mins
                                        ? moyenneArray(points.slice(i - 300, i))
                                        : max_5_mins

                                if (i > 1199) {
                                    max_20_mins =
                                        moyenneArray(
                                            points.slice(i - 1200, i)
                                        ) > max_20_mins
                                            ? moyenneArray(
                                                  points.slice(i - 1200, i)
                                              )
                                            : max_20_mins
                                } else {
                                    max_20_mins = moyenneArray(points)
                                }
                            } else {
                                max_5_mins = moyenneArray(points)
                            }
                        } else {
                            max_1_min = moyenneArray(points)
                        }
                    } else {
                        max_5_secs = moyenneArray(points)
                        max_1_min = moyenneArray(points)
                        max_5_mins = moyenneArray(points)
                        max_20_mins = moyenneArray(points)
                    }
                }

                const profil = await Profil.findOne({
                    _utilisateur: entrainement._utilisateur,
                })

                entrainement = await Entrainement.findOneAndUpdate(
                    { _id: req.params.entrainementId },
                    {
                        $set: {
                            tableau_statistiques: {
                                max_20_mins: [
                                    max_20_mins,
                                    max_20_mins / profil.poids,
                                ],
                                max_5_mins: [
                                    max_5_mins,
                                    max_5_mins / profil.poids,
                                ],
                                max_1_min: [
                                    max_1_min,
                                    max_1_min / profil.poids,
                                ],
                                max_5_secs: [
                                    max_5_secs,
                                    max_5_secs / profil.poids,
                                ],
                            },
                        },
                    },
                    { upsert: true }
                )
            }
        }

        return res
            .status(200)
            .json({ data: entrainement, msg: 'Entrainement mis à jour' })
    } catch (e) {
        console.log(e)
        return res.status(200).json({ error: 'Network error' })
    }
})

module.exports = router

// Convertisseurs
let toHHMMSS = (secs) => {
    let hours = Math.floor(secs / 3600)
    let minutes = Math.floor(secs / 60) % 60
    let seconds = secs % 60

    if (hours) {
        return `${hours > 9 ? hours : `0${hours}`}:${
            minutes > 9 ? minutes : `0${minutes}`
        }:${seconds > 9 ? seconds : `0${seconds}`}`
    }

    return `00:${minutes > 9 ? minutes : `0${minutes}`}:${
        seconds > 9 ? seconds : `0${seconds}`
    }`
}

let toKM = (val) => {
    return parseFloat(Number.parseFloat(val).toPrecision(4))
}

let toDM = (val) => {
    return Number.parseFloat(val).toPrecision(5) * 1000
}

// Calculs zones
const fc_zone = (pfc) => {
    if (pfc > 0.69) {
        if (pfc > 0.85) {
            if (pfc > 0.95) {
                if (pfc > 1.05) {
                    return 5
                }
                return 4
            }
            return 3
        }
        return 2
    }
    return 1
}

const power_zone = (pp) => {
    if (pp > 0.56) {
        if (pp > 0.76) {
            if (pp > 0.91) {
                if (pp > 1.06) {
                    if (pp > 1.21) {
                        if (pp > 1.5) {
                            return 7
                        }
                        return 6
                    }
                    return 5
                }
                return 4
            }
            return 3
        }
        return 2
    }
    return 1
}

moyenneArray = (arr) => {
    let nombres = arr.length,
        valeurs = 0
    for (let i = 0; i < nombres; i++) {
        valeurs += Number(arr[i])
    }
    return parseInt(valeurs / nombres)
}
