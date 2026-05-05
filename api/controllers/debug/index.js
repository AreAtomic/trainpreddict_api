//* MODULES *//
const dayjs = require('dayjs')
const isoWeeksInYear = require('dayjs/plugin/isoWeeksInYear')
const isLeapYear = require('dayjs/plugin/isLeapYear')
const weekOfYear = require('dayjs/plugin/weekOfYear')
dayjs.extend(isoWeeksInYear)
dayjs.extend(isLeapYear)
dayjs.extend(weekOfYear)

//* MODELS *//
const Assistant = require('../../../models/Assistant')
const AssistantServices = require('../../../services/calendar/assistant.service')

exports.fixYearGeneration = async (req, res) => {
    try {
        const userId = req.params.userId
        const year = parseInt(req.params.year)

        let actualYear = await Assistant.findOne(
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
        if (actualYear.years.length === 0) {
            actualYear = await AssistantServices.generateYear(userId, year)
        } else {
            actualYear = await AssistantServices.fixYear(userId, year)
        }

        console.log(actualYear._id)
        return res.status(200).json({
            data: { actualYear },
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
