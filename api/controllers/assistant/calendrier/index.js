//* MODULES *//
const utils = require('../utils/index')
const dayjs = require('dayjs')
const isoWeeksInYear = require('dayjs/plugin/isoWeeksInYear')
const isLeapYear = require('dayjs/plugin/isLeapYear')
const weekOfYear = require('dayjs/plugin/weekOfYear')
dayjs.extend(isoWeeksInYear)
dayjs.extend(isLeapYear)
dayjs.extend(weekOfYear)
const DateServices = require('../../../../services/calendar/date.service')

//* MODELS *//
const Assistant = require('../../../../models/Assistant')
const Seance = require('../../../../models/Seance')
const Course = require('../../../../models/Course')
const Objectif = require('../../../../models/Objectif')
const Entrainement = require('../../../../models/Entrainement')

/**
 * @route GET /api/v1/assistant/calendrier/:userId/:year
 * @function getCalendrier
 * @description Récupération du calendrier d'un coureur avec son id
 */
exports.getCalendrier = async (req, res) => {
    try {
        const userId = req.params.userId
        const year = parseInt(req.params.year)

        const actualYear = await Assistant.findOne(
            {
                _utilisateur: userId,
            },
            {
                years: {
                    $elemMatch: {
                        year: year,
                    },
                },
            }
        )
        const pastYear = await Assistant.findOne(
            {
                _utilisateur: userId,
            },
            {
                years: {
                    $elemMatch: {
                        year: year - 1,
                    },
                },
            }
        )
        const nextYear = await Assistant.findOne(
            {
                _utilisateur: userId,
            },
            {
                years: {
                    $elemMatch: {
                        year: year + 1,
                    },
                },
            }
        )
        return res.status(200).json({
            data: { actualYear, pastYear, nextYear },
            message: 'Calendrier récupéré avec succès',
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
 * @route POST /api/v1/assistant/calendrier/:userId
 * @function createCalendrier
 * @description Création d'un calendrier pour un coureur avec son id (par défaut => repos partout)
 */
exports.createCalendrier = async (req, res) => {
    try {
        const userId = req.params.userId
        let assistant = await Assistant.findOne({ _utilisateur: userId })
        if (assistant) {
            return res
                .status(403)
                .json({ message: "L'utilisateur a déjà un calendrier." })
        }

        let years = []
        for (let y = 2020; y < 2023; y++) {
            // Variables for weeks
            let weeks = []
            let numberOfWeek = dayjs(
                `01-01-${y}`,
                'MM-DD-YYYY'
            ).isoWeeksInYear()

            for (let w = 0; w <= numberOfWeek; w++) {
                // Variables for days
                let days = []
                let weekValue = dayjs(`01-01-${y}`, 'MM-DD-YYYY').week(w)

                for (let d = 0; d < 7; d++) {
                    // Create day
                    const day = {
                        date: DateServices.dateToISOStringZero(weekValue.day(d)),
                        planned: [],
                        objectif: null,
                        comment: [],
                        done: [],
                        statistiques: {
                            planned: {
                                time: '00:00:00',
                                distance: 0,
                                sse: 0,
                                denivele: 0,
                                nombreSeance: 0,
                            },
                            done: {
                                time: '00:00:00',
                                distance: 0,
                                sse: 0,
                                denivele: 0,
                                nombreSeance: 0,
                            },
                        },
                        form: { planned: 0, done: 0 },
                        tiredness: { planned: 0, done: 0 },
                    }
                    days.push(day)
                }
                //Create week
                week = {
                    week: w,
                    days: days,
                    statistiques: {
                        planned: {
                            time: '00:00:00',
                            distance: 0,
                            sse: 0,
                            denivele: 0,
                            nombreSeance: 0,
                        },
                        done: {
                            time: '00:00:00',
                            distance: 0,
                            sse: 0,
                            denivele: 0,
                            nombreSeance: 0,
                        },
                    },
                    form: { planned: 0, done: 0 },
                }
                weeks.push(week)
            }
            // Create year
            year = {
                year: y,
                statistiques: {
                    planned: {
                        time: '00:00:00',
                        distance: 0,
                        sse: 0,
                        denivele: 0,
                        nombreSeance: 0,
                    },
                    done: {
                        time: '00:00:00',
                        distance: 0,
                        sse: 0,
                        denivele: 0,
                        nombreSeance: 0,
                    },
                },
                weeks: weeks,
            }
            years.push(year)
        }
        await Assistant.findOneAndUpdate(
            {
                _utilisateur: userId,
            },
            { $set: { years: years } },
            { new: true, upsert: true }
        )
        return res.status(200).json({
            message: 'Assistant created successfully',
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
 * @route GET /api/v1/assistant/calendrier/:userId/day/:date
 * @function getDayCalendrier
 * @description Récupération calendrier pour un jour pour un coureur avec son id
 */
exports.getDayCalendrier = async (req, res) => {
    try {
        const userId = req.params.userId
        let date = req.params.date
        let year = parseInt(date.split('-')[0])
        let month = parseInt(date.split('-')[1])
        let week = dayjs(req.params.date).week()
        let day = dayjs(req.params.date).day()

        const yearCalendrier = await Assistant.findOne(
            {
                _utilisateur: userId,
            },
            {
                years: {
                    $elemMatch: {
                        year: week == 1 && month === 12 ? year + 1 : year,
                    },
                },
            }
        )

        return res.status(200).json({
            data: { day: yearCalendrier.years[0].weeks[week].days[day] },
            message: 'Calendrier récupéré avec succès',
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
 * @route PUT /api/v1/assistant/calendrier/:userId/planned/:date
 * @function putDayCalendrierPlanned
 * @description Modification du paramètre planned d'un calendrier pour un jour pour un coureur avec son id
 * @utilisation Calcul de l'intervale à ajouter ou supprimer au niveau du front.
 * @params adding = true SI intervalle >= 0 SINON false
 */
exports.putDayCalendrierPlanned = async (req, res) => {
    try {
        // Query informations
        const planned = req.body.planned
        const userId = req.params.userId
        const date = DateServices.dateToISOStringZero(req.params.date)

        //* Planned modif *//
        await Assistant.updateOne(
            {
                _utilisateur: userId,
            },
            {
                $set: { 'years.$[].weeks.$[].days.$[days].planned': planned },
            },
            {
                arrayFilters: [
                    {
                        'days.date': date,
                    },
                ],
            }
        )

        //* Statistiques modif *//
        let year = parseInt(date.split('-')[0])
        let month = parseInt(date.split('-')[1])
        let week = dayjs(req.params.date).week()
        let day = dayjs(req.params.date).day()
        const adding = req.body.adding
        const statistiques = req.body.statistiques

        const nextYearIsStorage = week == 1 && month === 12 ? true : false

        const calendrier = await Assistant.findOne(
            {
                _utilisateur: userId,
            },
            {
                years: {
                    $elemMatch: {
                        year: year,
                    },
                },
            }
        )
        const calendrierNextYear = await Assistant.findOne(
            {
                _utilisateur: userId,
            },
            {
                years: {
                    $elemMatch: {
                        year: year + 1,
                    },
                },
            }
        )

        //* Update year stats *//
        await Assistant.updateOne(
            {
                _utilisateur: userId,
            },
            {
                $set: {
                    'years.$[years].statistiques.planned': {
                        time: adding
                            ? utils.addHours(
                                  calendrier.years[0].statistiques.planned.time,
                                  statistiques.time
                              )
                            : utils.deleteHours(
                                  calendrier.years[0].statistiques.planned.time,
                                  statistiques.time
                              ),
                        distance: adding
                            ? calendrier.years[0].statistiques.planned
                                  .distance + statistiques.distance
                            : calendrier.years[0].statistiques.planned
                                  .distance - statistiques.distance,
                        sse: adding
                            ? calendrier.years[0].statistiques.planned.sse +
                              statistiques.sse
                            : calendrier.years[0].statistiques.planned.sse -
                              statistiques.sse,
                        denivele: adding
                            ? calendrier.years[0].statistiques.planned
                                  .denivele + statistiques.denivele
                            : calendrier.years[0].statistiques.planned
                                  .denivele - statistiques.denivele,
                        nombreSeance: adding
                            ? calendrier.years[0].statistiques.planned
                                  .nombreSeance + statistiques.nombreSeance
                            : calendrier.years[0].statistiques.planned
                                  .nombreSeance - statistiques.nombreSeance,
                    },
                },
            },
            {
                arrayFilters: [
                    {
                        'years.year': year,
                    },
                ],
            }
        )

        //* Update week stats *//
        const storageOfWeek = nextYearIsStorage
            ? calendrierNextYear.years[0].weeks[week].statistiques
            : calendrier.years[0].weeks[week].statistiques

        await Assistant.updateOne(
            {
                _utilisateur: userId,
                years: {
                    $elemMatch: {
                        year: week == 1 && month === 12 ? year + 1 : year,
                    },
                },
            },
            {
                $set: {
                    'years.$[].weeks.$[weeks].statistiques.planned': {
                        time: adding
                            ? utils.addHours(
                                  storageOfWeek.planned.time,
                                  statistiques.time
                              )
                            : utils.deleteHours(
                                  storageOfWeek.planned.time,
                                  statistiques.time
                              ),
                        distance: adding
                            ? storageOfWeek.planned.distance +
                              statistiques.distance
                            : storageOfWeek.planned.distance -
                              statistiques.distance,
                        sse: adding
                            ? storageOfWeek.planned.sse + statistiques.sse
                            : storageOfWeek.planned.sse - statistiques.sse,
                        denivele: adding
                            ? storageOfWeek.planned.denivele +
                              statistiques.denivele
                            : storageOfWeek.planned.denivele -
                              statistiques.denivele,
                        nombreSeance: adding
                            ? storageOfWeek.planned.nombreSeance +
                              statistiques.nombreSeance
                            : storageOfWeek.planned.nombreSeance -
                              statistiques.nombreSeance,
                    },
                },
            },
            {
                arrayFilters: [
                    {
                        'weeks.week': week,
                    },
                ],
            }
        )
        //* Update day stats *//
        const storageOfDay = nextYearIsStorage
            ? calendrierNextYear.years[0].weeks[week].days[day].statistiques
            : calendrier.years[0].weeks[week].days[day].statistiques

        await Assistant.updateOne(
            {
                _utilisateur: userId,
            },
            {
                $set: {
                    'years.$[].weeks.$[].days.$[days].statistiques.planned': {
                        time: adding
                            ? utils.addHours(
                                  storageOfDay.planned.time,
                                  statistiques.time
                              )
                            : utils.deleteHours(
                                  storageOfDay.planned.time,
                                  statistiques.time
                              ),
                        distance: adding
                            ? storageOfDay.planned.distance +
                              statistiques.distance
                            : storageOfDay.planned.distance -
                              statistiques.distance,
                        sse: adding
                            ? storageOfDay.planned.sse + statistiques.sse
                            : storageOfDay.planned.sse - statistiques.sse,
                        denivele: adding
                            ? storageOfDay.planned.denivele +
                              statistiques.denivele
                            : storageOfDay.planned.denivele -
                              statistiques.denivele,
                        nombreSeance: adding
                            ? storageOfDay.planned.nombreSeance +
                              statistiques.nombreSeance
                            : storageOfDay.planned.nombreSeance -
                              statistiques.nombreSeance,
                    },
                },
            },
            {
                arrayFilters: [
                    {
                        'days.date': date,
                    },
                ],
            }
        )

        return res.status(200).json({
            message: 'Calendrier récupéré avec succès',
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
 * @route PUT /api/v1/assistant/calendrier/:userId/done/:dayId
 * @function putDayCalendrierDone
 * @description Modification du paramètre done d'un calendrier pour un jour pour un coureur avec son id
 * @utilisation Calcul de l'intervale à ajouter ou supprimer au niveau du front.
 * @params adding = true SI intervalle >= 0 SINON false
 */
exports.putDayCalendrierDone = async (req, res) => {
    try {
        // Query informations
        const done = req.body.done
        const userId = req.params.userId
        const date = DateServices.dateToISOStringZero(req.params.date)

        //* Done modif *//
        await Assistant.updateOne(
            {
                _utilisateur: userId,
            },
            {
                $set: { 'years.$[].weeks.$[].days.$[days].done': done },
            },
            {
                arrayFilters: [
                    {
                        'days.date': date,
                    },
                ],
            }
        )

        //* Statistiques modif *//
        let year = parseInt(date.split('-')[0])
        let month = parseInt(date.split('-')[1])
        let week = dayjs(req.params.date).week()
        let day = dayjs(req.params.date).day()
        const adding = req.body.adding
        const statistiques = req.body.statistiques

        const nextYearIsStorage = week == 1 && month === 12 ? true : false

        const calendrier = await Assistant.findOne(
            {
                _utilisateur: userId,
            },
            {
                years: {
                    $elemMatch: {
                        year: year,
                    },
                },
            }
        )
        const calendrierNextYear = await Assistant.findOne(
            {
                _utilisateur: userId,
            },
            {
                years: {
                    $elemMatch: {
                        year: year + 1,
                    },
                },
            }
        )

        //* Update year stats *//
        await Assistant.updateOne(
            {
                _utilisateur: userId,
            },
            {
                $set: {
                    'years.$[years].statistiques.done': {
                        time: adding
                            ? utils.addHours(
                                  calendrier.years[0].statistiques.done.time,
                                  statistiques.time
                              )
                            : utils.deleteHours(
                                  calendrier.years[0].statistiques.done.time,
                                  statistiques.time
                              ),
                        distance: adding
                            ? calendrier.years[0].statistiques.done.distance +
                              statistiques.distance
                            : calendrier.years[0].statistiques.done.distance -
                              statistiques.distance,
                        sse: adding
                            ? calendrier.years[0].statistiques.done.sse +
                              statistiques.sse
                            : calendrier.years[0].statistiques.done.sse -
                              statistiques.sse,
                        denivele: adding
                            ? calendrier.years[0].statistiques.done.denivele +
                              statistiques.denivele
                            : calendrier.years[0].statistiques.done.denivele -
                              statistiques.denivele,
                        nombreSeance: adding
                            ? calendrier.years[0].statistiques.done
                                  .nombreSeance + statistiques.nombreSeance
                            : calendrier.years[0].statistiques.done
                                  .nombreSeance - statistiques.nombreSeance,
                    },
                },
            },
            {
                arrayFilters: [
                    {
                        'years.year': year,
                    },
                ],
            }
        )

        //* Update week stats *//
        const storageOfWeek = nextYearIsStorage
            ? calendrierNextYear.years[0].weeks[week].statistiques
            : calendrier.years[0].weeks[week].statistiques

        await Assistant.updateOne(
            {
                _utilisateur: userId,
                years: {
                    $elemMatch: {
                        year: week == 1 && month === 12 ? year + 1 : year,
                    },
                },
            },
            {
                $set: {
                    'years.$[].weeks.$[weeks].statistiques.done': {
                        time: adding
                            ? utils.addHours(
                                  storageOfWeek.done.time,
                                  statistiques.time
                              )
                            : utils.deleteHours(
                                  storageOfWeek.done.time,
                                  statistiques.time
                              ),
                        distance: adding
                            ? storageOfWeek.done.distance +
                              statistiques.distance
                            : storageOfWeek.done.distance -
                              statistiques.distance,
                        sse: adding
                            ? storageOfWeek.done.sse + statistiques.sse
                            : storageOfWeek.done.sse - statistiques.sse,
                        denivele: adding
                            ? storageOfWeek.done.denivele +
                              statistiques.denivele
                            : storageOfWeek.done.denivele -
                              statistiques.denivele,
                        nombreSeance: adding
                            ? storageOfWeek.done.nombreSeance +
                              statistiques.nombreSeance
                            : storageOfWeek.done.nombreSeance -
                              statistiques.nombreSeance,
                    },
                },
            },
            {
                arrayFilters: [
                    {
                        'weeks.week': week,
                    },
                ],
            }
        )
        //* Update day stats *//
        const storageOfDay = nextYearIsStorage
            ? calendrierNextYear.years[0].weeks[week].days[day].statistiques
            : calendrier.years[0].weeks[week].days[day].statistiques

        await Assistant.updateOne(
            {
                _utilisateur: userId,
                years: {
                    $elemMatch: {
                        year: week == 1 && month === 12 ? year + 1 : year,
                    },
                },
            },
            {
                $set: {
                    'years.$[].weeks.$[].days.$[days].statistiques.done': {
                        time: adding
                            ? utils.addHours(
                                  storageOfDay.done.time,
                                  statistiques.time
                              )
                            : utils.deleteHours(
                                  storageOfDay.done.time,
                                  statistiques.time
                              ),
                        distance: adding
                            ? storageOfDay.done.distance + statistiques.distance
                            : storageOfDay.done.distance -
                              statistiques.distance,
                        sse: adding
                            ? storageOfDay.done.sse + statistiques.sse
                            : storageOfDay.done.sse - statistiques.sse,
                        denivele: adding
                            ? storageOfDay.done.denivele + statistiques.denivele
                            : storageOfDay.done.denivele -
                              statistiques.denivele,
                        nombreSeance: adding
                            ? storageOfDay.done.nombreSeance +
                              statistiques.nombreSeance
                            : storageOfDay.done.nombreSeance -
                              statistiques.nombreSeance,
                    },
                },
            },
            {
                arrayFilters: [
                    {
                        'days.date': date,
                    },
                ],
            }
        )

        return res.status(200).json({
            message: 'Calendrier récupéré avec succès',
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
 * @route PUT /api/v1/assistant/calendrier/:userId/comment/:dayId
 * @function putDayCalendrierComment
 * @description Modification du paramètre comment d'un calendrier pour un jour pour un coureur avec son id
 * @utilisation Supression et ajout des commentaires gérés au niveau du front et envoie d'un array
 * @params comment = [...Avec les nouveau ou sans les ancien] de la forme {from: "Nom", value: "Comment"}
 */
exports.putDayCalendrierComment = async (req, res) => {
    try {
        // Query informations
        const comment = req.body.comment
        const userId = req.params.userId
        const date = DateServices.dateToISOStringZero(req.params.date)

        //* Comment modif *//
        await Assistant.updateOne(
            {
                _utilisateur: userId,
            },
            {
                $set: {
                    'years.$[].weeks.$[].days.$[days].comment': comment,
                },
            },
            {
                arrayFilters: [
                    {
                        'days.date': date,
                    },
                ],
            }
        )

        return res
            .status(200)
            .json({ message: 'Commentaire ajouté avec succès.' })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error: error.message,
            message: 'Une erreur est survenue, veuillez réessayer plus tard.',
        })
    }
}

/**
 * @route PUT /api/v1/assistant/calendrier/:userId/course/:dayId
 * @function putDayCalendrierCourse
 * @description Modification du paramètre course d'un calendrier pour un jour pour un coureur avec son id
 */
exports.putDayCalendrierCourse = async (req, res) => {
    try {
        // Query informations
        let { planned, adding, statistiques, model } = req.body
        const userId = req.params.userId
        const date = DateServices.dateToISOStringZero(req.params.date)

        if (adding) {
            const course = await Course.findOneAndUpdate(
                {
                    _utilisateur: userId,
                    titre: model.titre,
                    date: date,
                },
                {
                    $set: {
                        type: model.type,
                        description: model.description,
                        denivele: model.denivele,
                        distance: model.distance,
                        temps: model.temps,
                        sse: model.sse,
                    },
                },
                {
                    new: true,
                    upsert: true,
                }
            )
            planned[planned.length - 1] = course._id.toString()
        }

        //* Comment modif *//
        await Assistant.updateOne(
            {
                _utilisateur: userId,
            },
            {
                $set: {
                    'years.$[].weeks.$[].days.$[days].planned': planned,
                },
            },
            {
                arrayFilters: [
                    {
                        'days.date': date,
                    },
                ],
            }
        )

        // Update statistiques
        //* Statistiques modif *//
        let year = parseInt(date.split('-')[0])
        let month = parseInt(date.split('-')[1])
        let week = dayjs(req.params.date).week()
        let day = dayjs(req.params.date).day()

        const nextYearIsStorage = week == 1 && month === 12 ? true : false

        const calendrier = await Assistant.findOne(
            {
                _utilisateur: userId,
            },
            {
                years: {
                    $elemMatch: {
                        year: year,
                    },
                },
            }
        )
        const calendrierNextYear = await Assistant.findOne(
            {
                _utilisateur: userId,
            },
            {
                years: {
                    $elemMatch: {
                        year: year + 1,
                    },
                },
            }
        )

        //* Update year stats *//
        await Assistant.updateOne(
            {
                _utilisateur: userId,
            },
            {
                $set: {
                    'years.$[years].statistiques.done': {
                        time: utils.addHours(
                            calendrier.years[0].statistiques.planned.time,
                            statistiques.time
                        ),
                        distance:
                            calendrier.years[0].statistiques.planned.distance +
                            statistiques.distance,
                        sse:
                            calendrier.years[0].statistiques.planned.sse +
                            statistiques.sse,
                        denivele:
                            calendrier.years[0].statistiques.planned.denivele +
                            statistiques.denivele,
                        nombreSeance: adding
                            ? calendrier.years[0].statistiques.planned
                                  .nombreSeance + 1
                            : calendrier.years[0].statistiques.planned
                                  .nombreSeance - 1,
                    },
                },
            },
            {
                arrayFilters: [
                    {
                        'years.year': year,
                    },
                ],
            }
        )

        //* Update week stats *//
        const storageOfWeek = nextYearIsStorage
            ? calendrierNextYear.years[0].weeks[week].statistiques
            : calendrier.years[0].weeks[week].statistiques

        await Assistant.updateOne(
            {
                _utilisateur: userId,
                years: {
                    $elemMatch: {
                        year: week == 1 && month === 12 ? year + 1 : year,
                    },
                },
            },
            {
                $set: {
                    'years.$[].weeks.$[weeks].statistiques.done': {
                        time: utils.addHours(
                            storageOfWeek.planned.time,
                            statistiques.time
                        ),
                        distance:
                            storageOfWeek.planned.distance +
                            statistiques.distance,
                        sse: storageOfWeek.planned.sse + statistiques.sse,
                        denivele:
                            storageOfWeek.planned.denivele +
                            statistiques.denivele,
                        nombreSeance: adding
                            ? storageOfWeek.planned.nombreSeance + 1
                            : storageOfWeek.planned.nombreSeance - 1,
                    },
                },
            },
            {
                arrayFilters: [
                    {
                        'weeks.week': week,
                    },
                ],
            }
        )
        //* Update day stats *//
        const storageOfDay = nextYearIsStorage
            ? calendrierNextYear.years[0].weeks[week].days[day].statistiques
            : calendrier.years[0].weeks[week].days[day].statistiques

        await Assistant.updateOne(
            {
                _utilisateur: userId,
                years: {
                    $elemMatch: {
                        year: week == 1 && month === 12 ? year + 1 : year,
                    },
                },
            },
            {
                $set: {
                    'years.$[].weeks.$[].days.$[days].statistiques.done': {
                        time: utils.addHours(
                            storageOfDay.planned.time,
                            statistiques.time
                        ),
                        distance:
                            storageOfDay.planned.distance +
                            statistiques.distance,
                        sse: storageOfDay.planned.sse + statistiques.sse,
                        denivele:
                            storageOfDay.planned.denivele +
                            statistiques.denivele,
                        nombreSeance: adding
                            ? storageOfDay.planned.nombreSeance + 1
                            : storageOfDay.planned.nombreSeance - 1,
                    },
                },
            },
            {
                arrayFilters: [
                    {
                        'days.date': date,
                    },
                ],
            }
        )

        return res.status(200).json({ message: 'Course ajoutée avec succès.' })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error: error.message,
            message: 'Une erreur est survenue, veuillez réessayer plus tard.',
        })
    }
}

/**
 * @route PUT /api/v1/assistant/calendrier/:userId/objectif/:dayId
 * @function putDayCalendrierObjectif
 * @description Modification du paramètre objectif d'un calendrier pour un jour pour un coureur avec son id
 */
exports.putDayCalendrierObjectif = async (req, res) => {
    try {
        // Query informations
        const {
            type,
            resultat_vise,
            titre,
            description,
            denivele,
            distance,
            temps,
        } = req.body
        const userId = req.params.userId
        const date = DateServices.dateToISOStringZero(req.params.date)
        const sse =
            parseInt(temps.split(':')[0]) * 100 +
            parseInt(temps.split(':')[1]) * 1.67
        let year = parseInt(date.split('-')[0])
        let month = parseInt(date.split('-')[1])
        let week = dayjs(req.params.date).week()
        let day = dayjs(req.params.date).day()
        const nextYearIsStorage = week == 1 && month === 12 ? true : false

        const objectif = await Objectif.findOneAndUpdate(
            {
                _utilisateur: userId,
                date: dayjs(date).toISOString(),
            },
            {
                $set: {
                    type,
                    resultat_vise,
                    titre,
                    description,
                    denivele,
                    distance,
                    temps,
                    sse,
                },
            },
            {
                new: true,
                upsert: true,
            }
        )

        //* Objectif modif *//
        const objectifsDay = await Assistant.updateOne(
            {
                _utilisateur: userId,
            },
            {
                $set: {
                    'years.$[].weeks.$[].days.$[days].objectif':
                        objectif._id.toString(),
                },
            },
            {
                arrayFilters: [
                    {
                        'days.date': date,
                    },
                ],
            }
        )

        // Update statistiques
        const calendrier = await Assistant.findOne(
            {
                _utilisateur: userId,
            },
            {
                years: {
                    $elemMatch: {
                        year: year,
                    },
                },
            }
        )
        const calendrierNextYear = await Assistant.findOne(
            {
                _utilisateur: userId,
            },
            {
                years: {
                    $elemMatch: {
                        year: year + 1,
                    },
                },
            }
        )

        //* Update year stats *//
        await Assistant.updateOne(
            {
                _utilisateur: userId,
            },
            {
                $set: {
                    'years.$[years].statistiques.done': {
                        time: utils.addHours(
                            calendrier.years[0].statistiques.planned.time,
                            temps
                        ),
                        distance:
                            calendrier.years[0].statistiques.planned.distance +
                            distance,
                        sse: calendrier.years[0].statistiques.planned.sse + sse,
                        denivele:
                            calendrier.years[0].statistiques.planned.denivele +
                            denivele,
                        nombreSeance:
                            calendrier.years[0].statistiques.planned
                                .nombreSeance + 1,
                    },
                },
            },
            {
                arrayFilters: [
                    {
                        'years.year': year,
                    },
                ],
            }
        )

        //* Update week stats *//
        const storageOfWeek = nextYearIsStorage
            ? calendrierNextYear.years[0].weeks[week].statistiques
            : calendrier.years[0].weeks[week].statistiques

        await Assistant.updateOne(
            {
                _utilisateur: userId,
                years: {
                    $elemMatch: {
                        year: week == 1 && month === 12 ? year + 1 : year,
                    },
                },
            },
            {
                $set: {
                    'years.$[].weeks.$[weeks].statistiques.done': {
                        time: utils.addHours(storageOfWeek.planned.time, temps),
                        distance: storageOfWeek.planned.distance + distance,
                        sse: storageOfWeek.planned.sse + sse,
                        denivele: storageOfWeek.planned.denivele + denivele,
                        nombreSeance: storageOfWeek.planned.nombreSeance + 1,
                    },
                },
            },
            {
                arrayFilters: [
                    {
                        'weeks.week': week,
                    },
                ],
            }
        )
        //* Update day stats *//
        const storageOfDay = nextYearIsStorage
            ? calendrierNextYear.years[0].weeks[week].days[day].statistiques
            : calendrier.years[0].weeks[week].days[day].statistiques

        await Assistant.updateOne(
            {
                _utilisateur: userId,
                years: {
                    $elemMatch: {
                        year: week == 1 && month === 12 ? year + 1 : year,
                    },
                },
            },
            {
                $set: {
                    'years.$[].weeks.$[].days.$[days].statistiques.done': {
                        time: utils.addHours(storageOfDay.planned.time, temps),
                        distance: storageOfDay.planned.distance + distance,
                        sse: storageOfDay.planned.sse + sse,
                        denivele: storageOfDay.planned.denivele + denivele,
                        nombreSeance: storageOfDay.planned.nombreSeance + 1,
                    },
                },
            },
            {
                arrayFilters: [
                    {
                        'days.date': date,
                    },
                ],
            }
        )

        return res.status(200).json({ message: 'Course ajoutée avec succès.' })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error: error.message,
            message: 'Une erreur est survenue, veuillez réessayer plus tard.',
        })
    }
}

/**
 * @route PUT /api/v1/assistant/calendrier/:userId/objectif/:dayId
 * @function putDayCalendrierObjectif
 * @description Modification du paramètre objectif d'un calendrier pour un jour pour un coureur avec son id
 */
exports.deleteDayCalendrierObjectif = async (req, res) => {
    try {
        // Query informations
        const { denivele, distance, temps } = req.body
        const userId = req.params.userId
        const date = DateServices.dateToISOStringZero(req.params.date)

        const sse =
            parseInt(temps.split(':')[0]) * 100 +
            parseInt(temps.split(':')[1]) * 1.67

        await Objectif.findOneAndDelete({
            _utilisateur: userId,
            date: dayjs(date).toISOString(),
        })

        //* Comment modif *//
        await Assistant.updateOne(
            {
                _utilisateur: userId,
            },
            {
                $set: {
                    'years.$[].weeks.$[].days.$[days].objectif': null,
                },
            },
            {
                arrayFilters: [
                    {
                        'days.date': date,
                    },
                ],
            }
        )

        // Update statistiques
        //* Statistiques modif *//
        let year = parseInt(dayjs(date).toISOString().split('-')[0])
        let month = parseInt(dayjs(date).toISOString().split('-')[1])
        let week = dayjs(req.params.date).week()
        let day = dayjs(req.params.date).day()

        const nextYearIsStorage = week == 1 && month === 12 ? true : false

        const calendrier = await Assistant.findOne({
            _utilisateur: userId,
        })
        const calendrierNextYear = await Assistant.findOne(
            {
                _utilisateur: userId,
            },
            {
                years: {
                    $elemMatch: {
                        year: year + 1,
                    },
                },
            }
        )

        //* Update year stats *//
        await Assistant.updateOne(
            {
                _utilisateur: userId,
            },
            {
                $set: {
                    'years.$[years].statistiques.done': {
                        time: utils.deleteHours(
                            calendrier.years[0].statistiques.planned.time,
                            temps
                        ),
                        distance:
                            calendrier.years[0].statistiques.planned.distance -
                            distance,
                        sse: calendrier.years[0].statistiques.planned.sse - sse,
                        denivele:
                            calendrier.years[0].statistiques.planned.denivele -
                            denivele,
                        nombreSeance:
                            calendrier.years[0].statistiques.planned
                                .nombreSeance - 1,
                    },
                },
            },
            {
                arrayFilters: [
                    {
                        'years.year': year,
                    },
                ],
            }
        )

        //* Update week stats *//
        const storageOfWeek = nextYearIsStorage
            ? calendrierNextYear.years[0].weeks[week].statistiques
            : calendrier.years[0].weeks[week].statistiques

        await Assistant.updateOne(
            {
                _utilisateur: userId,
                years: {
                    $elemMatch: {
                        year: week == 1 && month === 12 ? year + 1 : year,
                    },
                },
            },
            {
                $set: {
                    'years.$[].weeks.$[weeks].statistiques.done': {
                        time: utils.deleteHours(
                            storageOfWeek.planned.time,
                            temps
                        ),
                        distance: storageOfWeek.planned.distance - distance,
                        sse: storageOfWeek.planned.sse - sse,
                        denivele: storageOfWeek.planned.denivele - denivele,
                        nombreSeance: storageOfWeek.planned.nombreSeance - 1,
                    },
                },
            },
            {
                arrayFilters: [
                    {
                        'weeks.week': week,
                    },
                ],
            }
        )
        //* Update day stats *//
        const storageOfDay = nextYearIsStorage
            ? calendrierNextYear.years[0].weeks[week].days[day].statistiques
            : calendrier.years[0].weeks[week].days[day].statistiques

        await Assistant.updateOne(
            {
                _utilisateur: userId,
                years: {
                    $elemMatch: {
                        year: week == 1 && month === 12 ? year + 1 : year,
                    },
                },
            },
            {
                $set: {
                    'years.$[].weeks.$[].days.$[days].statistiques.done': {
                        time: utils.deleteHours(
                            storageOfDay.planned.time,
                            temps
                        ),
                        distance: storageOfDay.planned.distance - distance,
                        sse: storageOfDay.planned.sse - sse,
                        denivele: storageOfDay.planned.denivele - denivele,
                        nombreSeance: storageOfDay.planned.nombreSeance - 1,
                    },
                },
            },
            {
                arrayFilters: [
                    {
                        'days.date': date,
                    },
                ],
            }
        )

        return res
            .status(200)
            .json({ message: 'Objectif supprimée avec succès.' })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error: error.message,
            message: 'Une erreur est survenue, veuillez réessayer plus tard.',
        })
    }
}

/**
 * @route PUT /api/v1/assistant/calendrier/:userId/indicators/:date
 * @function putIndicators
 * @description Modification des paramètres form, tiredness for a specific day
 */
exports.putIndicators = async (req, res) => {
    try {
        const userId = req.params.userId
        const date = req.params.date
        const plan = await Assistant.findOne(
            {
                _utilisateur: userId,
            },
            {
                years: {
                    $elemMatch: { year: dayjs(date).year() },
                },
            }
        )

        let ssePlanned = []
        let sseDone = []

        const year = plan.years[0]
        year.weeks.forEach((week) => {
            week.days.forEach((day) => {
                ssePlanned.push(day.statistiques.planned.sse)
                sseDone.push(day.statistiques.done.sse)
                let length = ssePlanned.length
                // Calcul fatigue
                day.tiredness.planned = utils.moyenneArray(
                    length > 7
                        ? ssePlanned.slice(length - 7, length)
                        : ssePlanned
                )
                day.tiredness.done = utils.moyenneArray(
                    length > 7 ? sseDone.slice(length - 7, length) : sseDone
                )

                // Calcul forme
                day.form.planned = utils.moyenneArray(
                    length > 42
                        ? ssePlanned.slice(length - 42, length)
                        : ssePlanned
                )
                day.form.done = utils.moyenneArray(
                    length > 42 ? sseDone.slice(length - 42, length) : sseDone
                )
            })
        })

        await Assistant.findOneAndUpdate(
            {
                _utilisateur: userId,
            },
            {
                $set: {
                    'years.$[years]': year,
                },
            },
            {
                arrayFilters: [
                    {
                        'years.year': dayjs(date).year(),
                    },
                ],
            }
        )

        return res
            .status(200)
            .json({ message: 'Courbes updated', actualYear: year })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error: error.message,
            message: 'Une erreur est survenue, veuillez réessayer plus tard.',
        })
    }
}

exports.getDayPlannedObject = async (req, res) => {
    try {
        const seanceId = req.params.seanceId
        let data = await Seance.findOne({ _id: seanceId })
        if (!data) {
            data = await Course.findOne({ _id: seanceId })
            if (!data) {
                return res.status(404).json({
                    message: `No seance or course find with the id : ${seanceId}`,
                    error: 'No data found',
                })
            }
        }
        return res.status(200).json({ data: data, message: 'Seance fetch' })
    } catch (error) {
        console.log('DayPlannedObject error: ', error)
        return res.status(500).json({
            error: error.message,
            message: 'Une erreur est survenue, veuillez réessayer plus tard.',
        })
    }
}

exports.putStatistiquesDone = async (req, res) => {
    try {
        // Query informations
        const userId = req.params.userId

        //* Done modif *//
        const entrainementsDone = await Entrainement.find({
            _utilisateur: userId,
        })

        const updateStatistiques = new UpdateStatistiquesDone(userId)

        await Promise.all(
            entrainementsDone.map(async (entrainement) => {
                const date = DateServices.dateToISOStringZero(dayjs(entrainement.date))
                let year = dayjs(date).year()
                let month = dayjs(date).month()
                let week = dayjs(date).week()

                const nextYearIsStorage =
                    week == 1 && month === 12 ? true : false

                updateStatistiques.countNewDay(entrainement)
                await Assistant.updateOne(
                    {
                        _utilisateur: userId,
                    },
                    {
                        $set: {
                            'years.$[years].statistiques.done': {
                                time: updateStatistiques.year.time,
                                distance: updateStatistiques.year.distance,
                                sse: updateStatistiques.year.sse,
                                denivele: updateStatistiques.year.denivele,
                                nombreSeance:
                                    updateStatistiques.year.nombreSeance,
                            },
                        },
                    },
                    {
                        arrayFilters: [
                            {
                                'years.year': year,
                            },
                        ],
                    }
                )

                //* Update week stats *//
                await Assistant.updateOne(
                    {
                        _utilisateur: userId,
                        years: {
                            $elemMatch: {
                                year: nextYearIsStorage ? year + 1 : year,
                            },
                        },
                    },
                    {
                        $set: {
                            'years.$[].weeks.$[weeks].statistiques.done': {
                                time: updateStatistiques.week.time,
                                distance: updateStatistiques.week.distance,
                                sse: updateStatistiques.week.sse,
                                denivele: updateStatistiques.week.denivele,
                                nombreSeance:
                                    updateStatistiques.week.nombreSeance,
                            },
                        },
                    },
                    {
                        arrayFilters: [
                            {
                                'weeks.week': week,
                            },
                        ],
                    }
                )
                //* Update day stats *//
                await Assistant.updateOne(
                    {
                        _utilisateur: userId,
                        years: {
                            $elemMatch: {
                                year: nextYearIsStorage ? year + 1 : year,
                            },
                        },
                    },
                    {
                        $set: {
                            'years.$[].weeks.$[].days.$[days].statistiques.done':
                                {
                                    time: updateStatistiques.day.time,
                                    distance: updateStatistiques.day.distance,
                                    sse: updateStatistiques.day.sse,
                                    denivele: updateStatistiques.day.denivele,
                                    nombreSeance:
                                        updateStatistiques.day.nombreSeance,
                                },
                        },
                    },
                    {
                        arrayFilters: [
                            {
                                'days.date': date,
                            },
                        ],
                    }
                )
            })
        )

        const calendar = await Assistant.findOne({
            _utilisateur: userId,
        })

        return res.status(200).json({
            message: 'Calendrier récupéré avec succès',
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error: error.message,
            message: 'Une erreur est servenue, veuillez réessayer plus tard.',
        })
    }
}

const UpdateStatistiquesDone = class {
    constructor(userId) {
        this.userId = userId
        this.year = {
            year: dayjs().year(),
            time: '00:00:00',
            distance: 0,
            sse: 0,
            denivele: 0,
            nombreSeance: 0,
        }

        this.week = {
            week: dayjs().week(),
            time: '00:00:00',
            distance: 0,
            sse: 0,
            denivele: 0,
            nombreSeance: 0,
        }

        this.day = {
            date: dayjs().format('DD/MM/YYYY'),
            time: '00:00:00',
            distance: 0,
            sse: 0,
            denivele: 0,
            nombreSeance: 0,
        }
    }

    countNewDay = (entrainement) => {
        this.updateDay(entrainement)
        this.updateWeek(entrainement)
        this.updateYear(entrainement)
    }

    updateDay = (entrainement) => {
        if (dayjs(entrainement.date).format('DD/MM/YYYY') !== this.date) {
            this.day.date = dayjs(entrainement.date).format('DD/MM/YYYY')
            this.day.time = entrainement.duree
            this.day.distance = entrainement.distance
            this.day.sse = entrainement.score_stress_entrainement
            this.day.denivele = entrainement.deniv
            this.day.nombreSeance = 1
        } else {
            this.day.time = utils.addHours(this.day.time, entrainement.duree)
            this.day.nombreSeance += 1
        }
    }

    updateWeek = (entrainement) => {
        if (dayjs(entrainement.date).week() !== dayjs(this.date).week()) {
            this.week.week = dayjs(entrainement.date).week()
            this.week.time = entrainement.duree
            this.week.distance = entrainement.distance
            this.week.sse = entrainement.score_stress_entrainement
            this.week.denivele = entrainement.deniv
            this.week.nombreSeance = 1
        } else {
            this.week.time = utils.addHours(this.week.time, entrainement.duree)
            this.week.nombreSeance += 1
        }
    }

    updateYear = (entrainement) => {
        if (dayjs(entrainement.date).year() !== dayjs(this.date).year()) {
            this.year.year = dayjs(entrainement.date).year()
            this.year.time = entrainement.duree
            this.year.distance = entrainement.distance
            this.year.sse = entrainement.score_stress_entrainement
            this.year.denivele = entrainement.deniv
            this.year.nombreSeance = 1
        } else {
            this.year.time = utils.addHours(this.year.time, entrainement.duree)
            this.year.nombreSeance += 1
        }
    }
}
