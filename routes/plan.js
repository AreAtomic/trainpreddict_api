/**
 * @import Modules
 */
const express = require('express')
const router = express.Router()
const dayjs = require('dayjs')
const calculPlan = require('../utils/calculPlan')
const { jwtauth } = require('../middlewares/auth.middleware')
/**
 * @import Models
 */
const Objectif = require('../models/Objectif')
const DonneesUtilisateur = require('../models/DonneesUtilisateur.js')
const Plan = require('../models/Plan')
const Entrainement = require('../models/Entrainement')
const Utilisateur = require('../models/Utilisateur')

// Tri bulle
function sort(tab) {
    var changed
    do {
        changed = false
        for (var i = 0; i < tab.length - 1; i++) {
            if (
                dayjs(tab[i].date_objectif).isBefore(
                    dayjs(tab[i + 1].date_objectif)
                )
            ) {
                var tmp = tab[i]
                tab[i] = tab[i + 1]
                tab[i + 1] = tmp
                changed = true
            }
        }
    } while (changed)
    return tab
}

/**
 * @route POST api/plan
 * @description Permet de créer un plan d'entrainement pour l'utilisateur
 */
router.post('/', [jwtauth], async (req, res) => {
    console.log("plan")
    try {
        console.log("plan 2")
        // Données du plan
        const utilisateur = req.utilisateur._id
        // Données pour la création du plan
        let objectif = await Objectif.find({ _utilisateur: utilisateur })

        if (objectif.length === 0) {
            return res
                .status(400)
                .json({ error: "Veuillez d'abord créer un objectif" })
        }
        objectif = sort(objectif)
        const donneesUtilisateur = await DonneesUtilisateur.findOne({
            _utilisateur: utilisateur,
        })

        // Création du plan
        const seances = await calculPlan(objectif[0], donneesUtilisateur, false)

        let seances_definies = []
        for (let i = 0; i < seances.length; i++) {
            for (j = 0; j < seances[i].length; j++) {
                seances_definies.push(seances[i][j])
            }
        }

        let plan = await Plan.findOneAndDelete({
            _utilisateur: utilisateur,
            date_debut: objectif[0].date_debut,
            date_fin: objectif[0].date_objectif,
        })

        if(plan){
            return res.status(400).json({error: "Un plan existe déjà pour ces dates"})
        }

        plan = new Plan({
            _utilisateur: utilisateur,
            _donnees_utilisateur: donneesUtilisateur,
            date_debut: objectif[0].date_debut,
            date_fin: objectif[0].date_objectif,
            SeancesDefinies: seances_definies,
        })

        plan.save()

        // Pousse on mongodb
        return res.status(200).json({ data: plan, msg: 'Nouveau plan créé' })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: err.message })
    }
})

/**
 * @route PUT api/plan/:planId
 * @description Permet de modifier un plan d'entrainement pour l'utilisateur
 */
router.put('/:planId', [jwtauth], async (req, res) => {
    try {
        // Données du plan
        const utilisateur = req.utilisateur._id
        const date_debut = dayjs(req.body.date_debut)
        const date_fin = dayjs(req.body.date_fin)
        // Données pour la création du plan
        const objectif = await Objectif.findOne({ _utilisateur: utilisateur })
        const donneesUtilisateur = await DonneesUtilisateur.findOne({
            _utilisateur: utilisateur,
        })

        // Création du plan
        const seances = await calculPlan(objectif, donneesUtilisateur, false)
        let seances_definies = []
        for (let i = 0; i < seances.length - 1; i++) {
            for (j = 0; j < 7; j++) {
                seances_definies.push(seances[i][j])
            }
        }

        let plan = await Plan.findOneAndUpdate(
            { _id: req.params.planId },
            {
                _utilisateur: utilisateur,
                _donnees_utilisateur: donneesUtilisateur,
                date_debut: date_debut,
                date_fin: date_fin,
                SeancesDefinies: seances_definies,
                Entrainements: [],
            },
            { upsert: true, new: true }
        )

        //Pousse on mongodb
        return res.status(200).json({ plan })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: err.message })
    }
})

/**
 * @route GET api/plan
 * @description Permet de récupérer les plans d'entrainement pour l'utilisateur
 */
router.get('/', [jwtauth], async (req, res) => {
    try {
        const utilisateur = req.utilisateur._id
        const plan = await Plan.find({ _utilisateur: utilisateur })
        if (!plan) {
            return res
                .status(200)
                .json({ error: 'Pas de plan créé pour cet utilisateur' })
        }
        return res.status(200).json({ data: plan })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: err.message })
    }
})

/**
 * @route DELETE api/plan/:planId/
 * @description Suprimme un plan son id
 */
router.delete('/:planId', [jwtauth], async (req, res) => {
    try {
        const plan = await Plan.findOneAndDelete({ _id: req.params.planId })

        return res.status(200).json({ msg: `Plan ${plan.id} supprimé avec succès` })
    } catch (err) {
        console.log(err)
        return res.status(200).json({
            error: err.message,
        })
    }
})

/**
 * @route put api/plan/:planId/seance
 * @description Insère une nouvelle séance dans le plan
 */
router.put('/:planId/seance', [jwtauth],async (req, res) => {
    // Récup des données
    const utilisateur = req.utilisateur._id
    const newSeance = [req.body.seance, dayjs(req.body.date).toISOString()]

    const entrainements = await Entrainement.find({ _utilisateur: utilisateur })
    let plan = await Plan.findOne({ _id: req.params.planId })
    if (!plan) {
        return res
            .status(400)
            .json({ error: 'Pas de plan créé pour cet utilisateur' })
    }

    // On regarde s'il y a déjà une séance de prévue à cette date
    let seances_definies = plan.SeancesDefinies
    const date = dayjs(newSeance[1])
    const date_debut = dayjs(plan.date_debut)

    if (date.isBefore(date_debut)) {
        return res.status(400).json({ error: 'Jour pas dans le plan' })
    }
    for (let i = 0; i < entrainements.length; i++) {
        if (dayjs(entrainements[i].date).isSame(date)) {
            return res
                .statusMessage(400)
                .json({ error: 'Tu as déjà réalisé la séance de ce jour la' })
        }
    }

    for (let i = 0; i < seances_definies.length; i++) {
        if (
            dayjs(newSeance[1]).format('MM/DD/YYYY') ==
            dayjs(seances_definies[i][1]).format('MM/DD/YYYY')
        ) {
            seances_definies.splice(i, 1, newSeance)
            // On actualise dans la collection
            plan = await Plan.findOneAndUpdate(
                { _utilisateur: utilisateur },
                { $set: { SeancesDefinies: seances_definies } },
                { new: true, upsert: true }
            )

            return res.status(200).json({ data: plan })
        }
    }

    // On remplace ou on crée
    const date_fin = dayjs(seances_definies[seances_definies.length - 1][1])
    const diff = date.diff(date_fin, 'day')
    if (date.isAfter(date_fin)) {
        for (let i = 0; i < diff; i++) {
            seances_definies.push([
                'repos',
                date_fin.add(i, 'day').toISOString(),
            ])
        }
    }
    plan = await Plan.findOneAndUpdate(
        { _utilisateur: utilisateur },
        { $set: { SeancesDefinies: seances_definies } },
        { new: true, upsert: true }
    )
    return res.status(200).json({ data: newSeance, msg: 'Séance mise à jour' })
})

/**
 * @route GET api/plan/:userID/courbes
 * @description Permet de calculer les courbes de forme et de les renvoyer
 */
router.get('/:userId/courbes', async (req, res) => {
    try {
        const utilisateur = req.params.userId

        let plan = await Plan.find({ _utilisateur: utilisateur })
        if (!plan) {
            return res.status(200).json({
                data: [],
            })
        }

        const seances_definies = plan[0].SeancesDefinies
        let tss = []
        let fatigue = []
        let forme = []
        const labels = []
        let last_entrainement = plan[0].date_debut
        let last_index = 0

        // Réalisé avant
        var entrainements = await Entrainement.find({
            _utilisateur: utilisateur,
        })

        if (entrainements.length > 0) {
            let premierEntrainement = dayjs(entrainements[0].date)
            for (let i = 0; i < entrainements.length; i++) {
                let nbJoursRepos
                if (
                    dayjs(entrainements[i].date).isBefore(
                        dayjs(seances_definies[0][1])
                    )
                ) {
                    if (
                        dayjs(entrainements[i].date).isBefore(
                            premierEntrainement
                        )
                    ) {
                        premierEntrainement = dayjs(entrainements[i].date)
                    }
                    labels.push(
                        dayjs(entrainements[i].date).format('MM/DD/YYYY')
                    )
                    last_entrainement = dayjs(entrainements[i].date)
                    tss.push(entrainements[i].score_stress_entrainement)
                    if (i != 0) {
                        nbJoursRepos = dayjs(entrainements[i].date).diff(
                            dayjs(entrainements[i - 1].date),
                            'week'
                        )
                        for (let i = 0; i < nbJoursRepos; i++) {
                            tss.push(0)
                        }
                    }

                    //Récup fatigue et forme
                    let seven_last_tss = []
                    let fourtytwo_last_tss = []

                    if (tss.length > 7) {
                        if (tss.length > 42) {
                            fourtytwo_last_tss = tss.slice(
                                tss.length - 42,
                                tss.length
                            )
                        } else {
                            fourtytwo_last_tss = tss
                        }
                        seven_last_tss = tss.slice(tss.length - 7, tss.length)
                    } else {
                        seven_last_tss = fourtytwo_last_tss = tss
                    }

                    fatigue.push(moyenneArray(seven_last_tss))
                    forme.push(
                        fourtytwo_last_tss.length > 10
                            ? moyenneArray(fourtytwo_last_tss)
                            : moyenneArray(fourtytwo_last_tss) / 2
                    )
                    last_index = i
                }
            }
        }

        let diffEetS =
            entrainements.length > 0
                ? dayjs(last_entrainement).diff(
                      dayjs(premierEntrainement),
                      'day'
                  )
                : 0

        // if (diffEetS == 0 && entrainements.length > 0) {
        //     diffEetS = dayjs(plan[0].date_debut).diff(last_entrainement, 'day')
        // }

        formeDepart = forme.length > 0 ? forme[forme.length - 1] : 0
        for (let i = 0; i < diffEetS; i++) {
            labels.push(
                dayjs(last_entrainement.add(i, 'day')).format('MM/DD/YYYY')
            )
            tss.push(0)
            //Récup fatigue et forme
            let seven_last_tss = []
            let fourtytwo_last_tss = []

            if (tss.length > 7) {
                if (tss.length > 42) {
                    fourtytwo_last_tss = tss.slice(tss.length - 42, tss.length)
                } else {
                    fourtytwo_last_tss = tss
                }
                seven_last_tss = tss.slice(tss.length - 7, tss.length)
            } else {
                seven_last_tss = fourtytwo_last_tss = tss
            }

            fatigue.push(moyenneArray(seven_last_tss))
            forme.push(
                fourtytwo_last_tss.length > 10
                    ? moyenneArray(fourtytwo_last_tss)
                    : moyenneArray(fourtytwo_last_tss) / 2
            )
        }

        tss = []
        // Fitness = Moyenne TSS 42 dernier jour (Forme) - moyenne TSS 7 dernier jours (Fatigue)
        for (let i = 0; i < seances_definies.length; i++) {
            labels.push(dayjs(seances_definies[i][1]).format('MM/DD/YYYY'))
            let seance = seances_definies[i]
            let did = false
            let secondindex
            for (let j = last_index; j < entrainements.length; j++) {
                if (
                    dayjs(entrainements[j].date).format('MM/DD/YYYY') ==
                    labels[i]
                ) {
                    if (!did) {
                        did = true
                        last_index = j
                    } else {
                        secondindex = j
                    }
                }
                if (dayjs(entrainements[j].date).isAfter(dayjs(labels[i]))) {
                    j = entrainements.length
                }
            }

            // Récup tss
            if (did) {
                if (typeof secondindex == 'number') {
                    tss.push(
                        entrainements[last_index].score_stress_entrainement +
                            entrainements[secondindex].score_stress_entrainement
                    )
                } else {
                    tss.push(
                        entrainements[last_index].score_stress_entrainement
                    )
                }
            } else if (seance[0] == 'repos') {
                tss.push(0)
            } else if (seance[0] == 'musculation') {
                tss.push(50)
            } else if (seance[0] == 'course à pied') {
                tss.push(75)
            } else {
                let data
                if (seance.length == 2) {
                    data = seance[0]
                }
                tss.push(data.score_stress_entrainement)
            }

            //Récup fatigue et forme
            let seven_last_tss = []
            let fourtytwo_last_tss = []

            if (tss.length > 7) {
                if (tss.length > 42) {
                    fourtytwo_last_tss = tss.slice(tss.length - 42, tss.length)
                } else {
                    fourtytwo_last_tss = tss
                }
                seven_last_tss = tss.slice(tss.length - 7, tss.length)
            } else {
                seven_last_tss = fourtytwo_last_tss = tss
            }

            fatigue.push(moyenneArray(seven_last_tss))
            forme.push(
                fourtytwo_last_tss.length > 10
                    ? moyenneArray(fourtytwo_last_tss)
                    : moyenneArray(fourtytwo_last_tss) / 2
            )
        }

        return res
            .status(200)
            .json({ data: { forme: forme, fatigue: fatigue, labels: labels } })
    } catch (e) {
        console.log(e)
        return res.status(200).json({ data: [] })
    }
})

/**
 * @route GET api/plan/:userID/courbes
 * @description Permet de calculer les courbes de forme et de les renvoyer
 */
router.get('/:userId/courbes', async (req, res) => {
    try {
        const utilisateur = req.params.userId
        const date_debut = req.params.date_fin || dayjs().add(-150, 'day')
        const date_fin = req.params.date_debut || dayjs().add(+150, 'day')

        let plan = await Plan.find({ _utilisateur: utilisateur })

        if (!plan) {
            return res.status(200).json({
                data: [],
            })
        }

        const seances_definies = plan[0].SeancesDefinies
        let tss = []
        let fatigue = []
        let forme = []
        const labels = []

        // Réalisé avant
        var entrainements = await Entrainement.find({
            _utilisateur: utilisateur,
        })

        if (entrainements.length > 0) {
            let premierEntrainement = dayjs(entrainements[0].date)
            for (let i = 0; i < entrainements.length; i++) {
                let nbJoursRepos
                if (
                    dayjs(entrainements[i].date).isBefore(
                        dayjs(seances_definies[0][1])
                    )
                ) {
                    if (
                        dayjs(entrainements[i].date).isBefore(
                            premierEntrainement
                        )
                    ) {
                        premierEntrainement = dayjs(entrainements[i].date)
                    }
                    labels.push(
                        dayjs(entrainements[i].date).format('MM/DD/YYYY')
                    )
                    last_entrainement = dayjs(entrainements[i].date)
                    tss.push(entrainements[i].score_stress_entrainement)
                    if (i != 0) {
                        nbJoursRepos = dayjs(entrainements[i].date).diff(
                            dayjs(entrainements[i - 1].date),
                            'week'
                        )
                        for (let i = 0; i < nbJoursRepos; i++) {
                            tss.push(0)
                        }
                    }

                    //Récup fatigue et forme
                    let seven_last_tss = []
                    let fourtytwo_last_tss = []

                    if (tss.length > 7) {
                        if (tss.length > 42) {
                            fourtytwo_last_tss = tss.slice(
                                tss.length - 42,
                                tss.length
                            )
                        } else {
                            fourtytwo_last_tss = tss
                        }
                        seven_last_tss = tss.slice(tss.length - 7, tss.length)
                    } else {
                        seven_last_tss = fourtytwo_last_tss = tss
                    }

                    fatigue.push(moyenneArray(seven_last_tss))
                    forme.push(
                        fourtytwo_last_tss.length > 10
                            ? moyenneArray(fourtytwo_last_tss)
                            : moyenneArray(fourtytwo_last_tss) / 2
                    )
                    last_index = i
                }
            }
        }

        let diffEetS =
            entrainements.length > 0
                ? dayjs(last_entrainement).diff(
                      dayjs(premierEntrainement),
                      'day'
                  )
                : 0

        // if (diffEetS == 0 && entrainements.length > 0) {
        //     diffEetS = dayjs(plan[0].date_debut).diff(last_entrainement, 'day')
        // }

        formeDepart = forme.length > 0 ? forme[forme.length - 1] : 0
        for (let i = 0; i < diffEetS; i++) {
            labels.push(
                dayjs(last_entrainement.add(i, 'day')).format('MM/DD/YYYY')
            )
            tss.push(0)
            //Récup fatigue et forme
            let seven_last_tss = []
            let fourtytwo_last_tss = []

            if (tss.length > 7) {
                if (tss.length > 42) {
                    fourtytwo_last_tss = tss.slice(tss.length - 42, tss.length)
                } else {
                    fourtytwo_last_tss = tss
                }
                seven_last_tss = tss.slice(tss.length - 7, tss.length)
            } else {
                seven_last_tss = fourtytwo_last_tss = tss
            }

            fatigue.push(moyenneArray(seven_last_tss))
            forme.push(
                fourtytwo_last_tss.length > 10
                    ? moyenneArray(fourtytwo_last_tss)
                    : moyenneArray(fourtytwo_last_tss) / 2
            )
        }

        tss = []
        // Fitness = Moyenne TSS 42 dernier jour (Forme) - moyenne TSS 7 dernier jours (Fatigue)
        for (let i = 0; i < seances_definies.length; i++) {
            labels.push(dayjs(seances_definies[i][1]).format('MM/DD/YYYY'))
            let seance = seances_definies[i]
            let did = false
            let secondindex
            for (let j = last_index; j < entrainements.length; j++) {
                if (
                    dayjs(entrainements[j].date).format('MM/DD/YYYY') ==
                    labels[i]
                ) {
                    if (!did) {
                        did = true
                        last_index = j
                    } else {
                        secondindex = j
                    }
                }
                if (dayjs(entrainements[j].date).isAfter(dayjs(labels[i]))) {
                    j = entrainements.length
                }
            }

            // Récup tss
            if (did) {
                if (typeof secondindex == 'number') {
                    tss.push(
                        entrainements[last_index].score_stress_entrainement +
                            entrainements[secondindex].score_stress_entrainement
                    )
                } else {
                    tss.push(
                        entrainements[last_index].score_stress_entrainement
                    )
                }
            } else if (seance[0] == 'repos') {
                tss.push(0)
            } else if (seance[0] == 'musculation') {
                tss.push(50)
            } else if (seance[0] == 'course à pied') {
                tss.push(75)
            } else {
                let data
                if (seance.length == 2) {
                    data = seance[0]
                }
                tss.push(data.score_stress_entrainement)
            }

            //Récup fatigue et forme
            let seven_last_tss = []
            let fourtytwo_last_tss = []

            if (tss.length > 7) {
                if (tss.length > 42) {
                    fourtytwo_last_tss = tss.slice(tss.length - 42, tss.length)
                } else {
                    fourtytwo_last_tss = tss
                }
                seven_last_tss = tss.slice(tss.length - 7, tss.length)
            } else {
                seven_last_tss = fourtytwo_last_tss = tss
            }

            fatigue.push(moyenneArray(seven_last_tss))
            forme.push(
                fourtytwo_last_tss.length > 10
                    ? moyenneArray(fourtytwo_last_tss)
                    : moyenneArray(fourtytwo_last_tss) / 2
            )
        }

        return res
            .status(200)
            .json({ data: { forme: forme, fatigue: fatigue, labels: labels } })
    } catch (e) {
        console.log(e)
        return res.status(200).json({ data: [] })
    }
})

module.exports = router

moyenneArray = (arr) => {
    var nombres = arr.length,
        valeurs = 0,
        i
    for (i = 0; i < nombres; i++) {
        valeurs += Number(arr[i])
    }
    return parseInt(valeurs / nombres)
}

compareDate = (a, b) => {
    const dateA = dayjs(a.date)
    const dateB = dayjs(b.date)

    let comparison = 0
    if (dateA.isAfter(dateB)) {
        comparison = 1
    } else if (dateA.isBefore(dateB)) {
        comparison = -1
    }
    return comparison
}
