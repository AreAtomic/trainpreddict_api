const dayjs = require('dayjs')
const duration = require('dayjs/plugin/duration')
dayjs.extend(duration)
const DateServices = require('../calendar/date.service')

const { addHours } = require('../../api/controllers/coureur/utils')
const Seance = require('../../models/Seance')
const Assistant = require('../../models/Assistant')
const {
    hourToSeconds,
    toTimeFormat,
    dureeToSeconds,
} = require('../utils.service')

const stringToWeekIndex = [
    'lundi',
    'mardi',
    'mercredi',
    'jeudi',
    'vendredi',
    'samedi',
    'dimanche',
]

exports.Plan = class {
    constructor(user, profil, donneesUtilisateur, objectifs, calendar) {
        this.user = user
        this.profil = profil
        this.donneesUtilisateur = donneesUtilisateur
        this.objectifs = objectifs
        this.calendar = calendar
    }

    _planLog(phase, detail = {}) {
        const userId = this.user && (this.user._id ?? this.user.id)
        console.log(`[Plan] ${phase}`, {
            userId: userId != null ? String(userId) : undefined,
            ...detail,
        })
    }

    createPlanForObjectifs = async () => {
        this._planLog('createPlanForObjectifs:début', {
            objectifs: this.objectifs?.length ?? 0,
        })
        if (this.checkObjectifCreated()) {
            const firstDay = dayjs()

            for (const objectif of this.objectifs) {
                if (dayjs(objectif.date).isAfter(firstDay)) {
                    this._planLog('objectif:traitement', {
                        objectifId: String(objectif._id ?? objectif.id),
                        dateCible: objectif.date,
                    })
                    await this.generatePlanObjectif(objectif, firstDay)
                    this._planLog('objectif:ok', {
                        objectifId: String(objectif._id ?? objectif.id),
                    })
                }
            }
            this._planLog('createPlanForObjectifs:terminé', { ok: true })
        } else {
            throw 'Aucun objectifs trouvé'
        }
    }

    checkObjectifCreated = () => {
        return this.objectifs.length > 0
    }

    generatePlanObjectif = async (objectif, startingDay) => {
        const nombreSemaine = this.getNumberOfEntireWeek(
            startingDay,
            objectif.date
        )
        this._planLog('generatePlanObjectif', {
            nombreSemaine,
            voie:
                nombreSemaine < 8 ? 'highIntensity (<8 sem.)' : 'normalIntensity',
        })

        if (nombreSemaine < 8) {
            this.highIntensityPattern()
        } else {
            await this.normalIntensityPattern(
                nombreSemaine,
                startingDay,
                objectif
            )
        }
    }

    highIntensityPattern = () => {
        // Plan court
        // TODO: adapt normalIntensityPattern
        console.log('court')
        throw 'Il doit y avoir 8 semaines minimum entre chaques objectif.'
    }

    normalIntensityPattern = async (nombreSemaine, startingDay, objectif) => {
        this._planLog('normalIntensity:début', {
            nombreSemaine,
            startingDay: startingDay?.format
                ? startingDay.format('YYYY-MM-DD')
                : String(startingDay),
        })
        const weeksOfSharphingBloc = nombreSemaine % 4
        const weeksOfNormalBlocs = nombreSemaine - weeksOfSharphingBloc
        const seancesPossible = await this.possibleSeance(
            this.donneesUtilisateur.ppg,
            'any',
            this.donneesUtilisateur.musculation
        )
        this._planLog('normalIntensity:séances_possibles_chargées', {
            musculation: seancesPossible.musculation?.length ?? 0,
            cyclismeFoncier: seancesPossible.cyclisme?.foncier?.length ?? 0,
        })

        const seanceMaximum = await this.seanceMaximum(objectif)
        this._planLog('normalIntensity:plafond_séance', {
            sseMax: seanceMaximum.sse,
        })
        let trainings = []

        const generateTrainings = (types, nombreJourEntrainement) => {
            // TODO: Make it independant and put it under (make export and variables as params)
            let seanceSemaine = {
                cyclisme: {},
                musculation: [],
            }

            for (let type of types) {
                let seanceOfType = seancesPossible.cyclisme[type].filter(
                    (seance) =>
                        seance.score_stress_entrainement <= seanceMaximum.sse &&
                        seance.score_stress_entrainement >
                            seanceMaximum.sse * 0.59
                )
                if (seanceOfType.length !== 0) {
                    seanceSemaine.cyclisme[type] = seanceOfType
                } else {
                    seanceSemaine.cyclisme[type] =
                        seancesPossible.cyclisme[type]
                }
            }

            seanceSemaine.musculation = seancesPossible.musculation.filter(
                (seance) => true
            )

            let trainingDays = []
            const addOneTraining = (type, specifique) => {
                let choosed = 0
                if (type === 'cyclisme') {
                    choosed = parseInt(
                        Math.random() * seanceSemaine[type][specifique].length
                    )
                    console.log(seanceSemaine[type][specifique][choosed])
                    trainingDays.push(seanceSemaine[type][specifique][choosed])
                } else {
                    choosed = parseInt(
                        Math.random() * seanceSemaine[type].length
                    )
                    console.log(seanceSemaine[type][choosed])
                    trainingDays.push(seanceSemaine[type][choosed])
                }
            }

            let numberOfSecondType =
                types.length > 1 ? Math.round(0.3 * nombreJourEntrainement) : 0
            let numberOfMusculation =
                seanceSemaine.musculation.length > 0
                    ? Math.round(0.1 * nombreJourEntrainement)
                    : 0

            console.log(nombreJourEntrainement)
            for (let i = 0; i < nombreJourEntrainement; i++) {
                if (numberOfSecondType === 0) {
                    if (numberOfMusculation === 0) {
                        addOneTraining('cyclisme', types[0])
                    } else {
                        numberOfMusculation--
                        addOneTraining('musculation', null)
                    }
                } else {
                    addOneTraining('cyclisme', types[1])
                    numberOfSecondType--
                }
            }

            return trainingDays
        }

        const fullfillWeek = (week, types, firstHard) => {
            // TODO: Make it independant and put it under (make export and variables as params)
            let trainingsOfWeek = generateTrainings(
                types,
                week.filter((sse) => sse !== 0).length
            )
            for (let sse of week) {
                if (sse === 0) trainings.push(null)
                else {
                    if (!firstHard) {
                        trainings.push(
                            trainingsOfWeek[trainingsOfWeek.length - 1]
                        )
                        trainingsOfWeek.pop()
                    } else {
                        trainings.push(trainingsOfWeek[0])
                        trainingsOfWeek.shift()
                    }
                }
            }
        }

        // TODO: create a function under
        for (let i = 1; i < weeksOfNormalBlocs; i += 4) {
            // Week 60 %
            const week60percent = this.generateWeekWithPercentage(0.6)
            seanceMaximum.sse = Math.max(...week60percent)
            fullfillWeek(week60percent, ['foncier'])
            // Week 110 %
            const week110percent = this.generateWeekWithPercentage(1.1)
            seanceMaximum.sse = Math.max(week110percent)
            if (i < 8) {
                fullfillWeek(week110percent, ['foncier'], false)
            } else {
                fullfillWeek(week110percent, ['foncier', 'seuil'], false)
            }
            // Week 100 %
            const week100percent = this.generateWeekWithPercentage(1)
            seanceMaximum.sse = Math.max(week100percent)
            if (i < 8) {
                fullfillWeek(week100percent, ['foncier'], false)
            } else {
                fullfillWeek(week100percent, ['foncier', 'pma'], false)
            }
            // Week 50 %
            const week50percent = this.generateWeekWithPercentage(0.5)
            seanceMaximum.sse = Math.max(week50percent)
            if (i < 8) {
                fullfillWeek(week50percent, ['foncier'], false)
            } else {
                fullfillWeek(week50percent, ['foncier', 'rythme'], false)
            }
        }

        // TODO: create a function under
        for (let i = 1; i < weeksOfSharphingBloc; i += 1) {
            const week60percent = this.generateWeekWithPercentage(0.6)
            seanceMaximum.sse = Math.max(...week60percent)

            if (i === 1) {
                const week80percent = this.generateWeekWithPercentage(0.8)
                seanceMaximum.sse = Math.max(...week80percent)
                fullfillWeek(week80percent, ['rythme', 'vo2max'], true)
            }
            if (i < 3) {
                fullfillWeek(week60percent, ['rythme', 'vo2max'], true)
            } else {
                fullfillWeek(week60percent, ['foncier', 'rythme'], true)
            }
        }

        this._planLog('normalIntensity:grille_trainings_construite', {
            jours: trainings.length,
            avecSeance: trainings.filter((t) => t != null && t._id).length,
        })
        await this.insertTrainingInPlan(startingDay, trainings)
        this._planLog('normalIntensity:insertion_calendrier_ok', {
            jours: trainings.length,
        })
        this._planLog('normalIntensity:rechargement_assistant...')
        this.calendar = await Assistant.findOne({ _utilisateur: this.user._id })
        this._planLog('normalIntensity:terminé', {
            calendarOk: !!this.calendar,
        })
    }

    insertTrainingInPlan = async (startingDay, trainings) => {
        this._planLog('insertTrainingInPlan:début', {
            jours: trainings.length,
            debut: dayjs(startingDay).format('YYYY-MM-DD'),
        })
        const patches = []
        for (let index = 0; index < trainings.length; index += 1) {
            const training = trainings[index]
            const date = DateServices.dateToISOStringZero(
                dayjs(startingDay).add(index, 'day')
            )

            // Repos explicite (null) ; undefined = liste de séances épuisée (bug logique semaine)
            if (training != null && training._id) {
                const statistiques = {
                    time: training.duree,
                    distance: training.estimation_distance,
                    denivele: training.estimation_deniv,
                    sse: training.score_stress_entrainement,
                    nombreSeance: 1,
                }
                patches.push({
                    update: {
                        $set: {
                            'years.$[].weeks.$[].days.$[days].planned': [
                                training._id,
                            ],
                            'years.$[].weeks.$[].days.$[days].statistiques.planned':
                                [statistiques],
                        },
                    },
                    options: {
                        arrayFilters: [{ 'days.date': date }],
                    },
                })
            }
        }
        this._planLog('insertTrainingInPlan:patches_prêts', {
            patches: patches.length,
            ignores: trainings.length - patches.length,
        })
        if (patches.length) {
            this._planLog('insertTrainingInPlan:ecriture_bd...', {
                patches: patches.length,
            })
            await Assistant.updateManyEmbeddedPatches(
                { _utilisateur: this.user._id },
                patches
            )
            this._planLog('insertTrainingInPlan:ecriture_bd_ok', {
                patches: patches.length,
            })
        } else {
            this._planLog('insertTrainingInPlan:aucun_patch', {
                note: 'repos uniquement ou séances invalides',
            })
        }
        this._planLog('insertTrainingInPlan:terminé', { ok: true })
    }

    generateWeekWithPercentage = (percentage) => {
        const nombreEntrainement = parseInt(
            this.donneesUtilisateur.nombre_seance_semaine * percentage
        )
        const jourRepos = this.generateRestDays(
            nombreEntrainement,
            this.donneesUtilisateur.jours_repos
        )
        const week = this.semaineType(
            nombreEntrainement,
            parseInt(this.donneesUtilisateur.sse * percentage),
            jourRepos
        )
        return week
    }

    generateRestDays = (nombreEntrainement, jourRepos) => {
        let newJourRepos = jourRepos.map((jour) => {
            return jour.toLowerCase()
        })

        while (7 - newJourRepos.length > nombreEntrainement) {
            let newDayFind = false
            newJourRepos.forEach((jour) => {
                if (newDayFind) return
                const dayToTry =
                    this.stringDayToWeekIndex(jour) - 2 > 0
                        ? this.stringDayToWeekIndex(jour) - 2
                        : 6

                if (!this.estUnJourRepos(newJourRepos, dayToTry)) {
                    newJourRepos.push(this.indexWeekToDayString(dayToTry))
                    newDayFind = true
                }
            })
            if (!newDayFind) {
                newJourRepos.forEach((jour) => {
                    if (newDayFind) return
                    const dayToTry =
                        this.stringDayToWeekIndex(jour) - 1 > 0
                            ? this.stringDayToWeekIndex(jour) - 1
                            : 6

                    if (!this.estUnJourRepos(newJourRepos, dayToTry)) {
                        newJourRepos.push(this.indexWeekToDayString(dayToTry))
                        newDayFind = true
                    }
                })
            }
        }
        return newJourRepos
    }

    getNumberOfEntireWeek = (startingDay, endingDay) => {
        const diff = dayjs(endingDay).diff(startingDay)
        return parseInt(dayjs.duration(diff).asWeeks()) - 1
    }

    semaineType = (nombreJourEntrainement, chargeEntrainement, jourRepos) => {
        const emptyWeek = [0, 0, 0, 0, 0, 0, 0]
        const semaine = emptyWeek.map((day, index) => {
            if (!this.estUnJourRepos(jourRepos, index)) {
                return chargeEntrainement / nombreJourEntrainement
            }
            return 0
        })
        return semaine
    }

    seanceMaximum = (objectif) => {
        let distance = 0
        let duree = 0
        let denivele = 0
        let sse = 0
        let intensite_travail = 0

        if (this.profil.age > 15) {
            if (this.donneesUtilisateur.experience > 3) {
                duree = dureeToSeconds(`${objectif.temps}:00`) * 2
                denivele = objectif.denivele * 2
                distance = objectif.distance * 2
                sse =
                    this.donneesUtilisateur.sse /
                    this.donneesUtilisateur.nombre_seance_semaine
                intensite_travail = sse * 2
                if (
                    objectif.resultat_vise == 'Victoire' ||
                    objectif.resultat_vise == 'Podium'
                ) {
                    intensite_travail = sse * 4
                }
                if (
                    objectif.resultat_vise == 'Top 10' ||
                    objectif.resultat_vise == 'Top 20'
                ) {
                    intensite_travail = sse * 3
                }
            } else {
                duree = dureeToSeconds(`${objectif.temps}:00`)
                denivele = objectif.denivele
                distance = objectif.distance
                sse =
                    (this.donneesUtilisateur.sse /
                        this.donneesUtilisateur.nombre_seance_semaine) *
                    0.8
                intensite_travail = sse * 1.5
            }
        } else {
            duree = hourToSeconds(4)
            denivele = 2500
            distance = 120
            sse =
                (this.donneesUtilisateur.sse /
                    this.donneesUtilisateur.nombre_seance_semaine) *
                0.6
            intensite_travail = sse
        }
        return {
            distance,
            duree: toTimeFormat(duree),
            denivele,
            sse,
            intensite_travail,
        }
    }

    possibleSeance = async (ppg, foncierSpecifique, muscu) => {
        const seances = {
            musculation: [],
            ppg: [],
            cyclisme: {
                foncier: [],
                seuil: [],
                pma: [],
                vo2max: [],
                rythme: [],
                recuperation: [],
                vtt: [],
            },
            cap: [],
            natation: [],
        }
        if (muscu) {
            const musculation = await Seance.find({
                type: 'Musculation',
            })
            seances.musculation = musculation
        }

        const foncier = await Seance.find({ type: 'Foncier' })
        seances.cyclisme.foncier = foncier
        const seuil = await Seance.find({ type: 'Seuil' })
        seances.cyclisme.seuil = seuil
        const pma = await Seance.find({ type: 'PMA' })
        seances.cyclisme.pma = pma
        const vo2max = await Seance.find({ type: 'VO2 Max' })
        seances.cyclisme.vo2max = vo2max
        const rythme = await Seance.find({ type: 'Rythme' })
        seances.cyclisme.rythme = rythme
        const recuperation = await Seance.find({ type: 'Récupération' })
        seances.cyclisme.recuperation = recuperation
        const vtt = await Seance.find({ type: 'VTT' })
        seances.cyclisme.vtt = vtt

        return seances
    }

    stringDayToWeekIndex = (day) => {
        return stringToWeekIndex.indexOf(day.toLowerCase())
    }

    indexWeekToDayString = (day) => {
        return stringToWeekIndex[day]
    }

    estUnJourRepos = (jourRepos, index) => {
        return jourRepos.indexOf(this.indexWeekToDayString(index)) !== -1
    }

    calculChargeEntrainementSemaine = (week) => {
        if (week.length === 7) {
            let sum = 0
            week.forEach((charge) => {
                sum += charge
            })
            return sum
        } else {
            throw 'Week length not good'
        }
    }
}
