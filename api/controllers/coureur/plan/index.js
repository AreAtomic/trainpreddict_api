//* MODULES *//
const utils = require('../utils/index')
const dayjs = require('dayjs')
const isoWeeksInYear = require('dayjs/plugin/isoWeeksInYear')
const isLeapYear = require('dayjs/plugin/isLeapYear')
const weekOfYear = require('dayjs/plugin/weekOfYear')
dayjs.extend(isoWeeksInYear)
dayjs.extend(isLeapYear)
dayjs.extend(weekOfYear)
const { Plan } = require('../../../../services/calendar/plan.service')

//* MODELS *//
const Utilisateur = require('../../../../models/Utilisateur')
const DonneesUtilisateur = require('../../../../models/DonneesUtilisateur')
const PlanModel = require('../../../../models/Plan')
const AssistantModel = require('../../../../models/Assistant')
const Objectif = require('../../../../models/Objectif')
const Profil = require('../../../../models/Profil')

exports.createPlan = async (req, res) => {
    try {
        const utilisateur = await Utilisateur.findOne({
            email: 'fake@trainpreddict.fr',
        })
        const profil = await Profil.findOne({ _utilisateur: utilisateur._id })
        const donneesUtilisateur = await DonneesUtilisateur.findOne({
            _utilisateur: utilisateur._id,
        })
        const objectifs = await Objectif.find({
            _utilisateur: utilisateur._id,
        }).sort({ date: -1 })
        const calendar = await AssistantModel.findOne({
            _utilisateur: utilisateur._id,
        })

        plan = new Plan(
            utilisateur,
            profil,
            donneesUtilisateur,
            objectifs,
            calendar
        )

        const seances = await plan.possibleSeance(true, false, true)
        const seanceMaximum = plan.seanceMaximum(objectifs[0])
        const planGenerated = plan.createPlanForObjectifs()

        return res
            .status(200)
            .json({ plan, message: 'Séances du nouveau plan générées' })
    } catch (error) {
        console.log('CreatePlan - catch error : ', error)
        return res.status(500).json({
            error: error.message,
            message: 'Une erreur est servenue, veuillez réessayer plus tard.',
        })
    }
}

exports.migratePlanOldModel = async (req, res) => {
    try {
        const userId = req.params.userId
        const plans = await PlanModel.find({ _utilisateur: userId })
        const calendar = await AssistantModel.findOne({ _utilisateur: userId })

        plans.forEach((plan) => {
            plan.SeancesDefinies.forEach((seance) => {
                const seanceId = seance[0]._id
                const date = seance[1]

                const year = dayjs(date).year()
                const week = dayjs(date).week()
                const day = dayjs(date).day()

                const actualyPlanned =
                    calendar.years[year - 2020].weeks[week].days[day].planned
                const actualyCommented =
                    calendar.years[year - 2020].weeks[week].days[day].comment

                if (typeof seance[0] !== 'string') {
                    if (actualyPlanned.indexOf(seanceId) === -1) {
                        actualyPlanned.push(seanceId)
                    }
                } else if (seance[0] === 'musculation') {
                    if (actualyCommented.length === 0) {
                        actualyCommented.push({
                            from: 'TrainPreddict',
                            value: 'musculation',
                        })
                    }
                }

                const plannedArrayFiltered =
                    clearArrayEntrainementPlanned(actualyPlanned)
                calendar.years[year - 2020].weeks[week].days[day].planned =
                    plannedArrayFiltered
                calendar.years[year - 2020].weeks[week].days[day].comment =
                    actualyCommented
            })
        })

        calendar.save()

        return res
            .status(200)
            .json({ plans, message: 'Plans added successfully to calendar' })
    } catch (error) {
        console.error('migratePlanModel', error)
        return res.status(500).json({ error: error, message: error.message })
    }
}

const clearArrayEntrainementPlanned = (planned) => {
    planned.filter((id) => typeof id === 'string')
    return planned.filter((id, index) => planned.indexOf(id) === index)
}
