//* MODULES *//
const utils = require('../../utils')
const dayjs = require('dayjs')
const isoWeeksInYear = require('dayjs/plugin/isoWeeksInYear')
const isLeapYear = require('dayjs/plugin/isLeapYear')
const weekOfYear = require('dayjs/plugin/weekOfYear')
dayjs.extend(isoWeeksInYear)
dayjs.extend(isLeapYear)
dayjs.extend(weekOfYear)
const DateServices = require('./date.service')

//* MODELS *//
const Assistant = require('../../models/Assistant')

exports.generateYear = async (userId, year) => {
    let assistant = await Assistant.findOne({ _utilisateur: userId })
    let years = assistant.years

    // Variables for weeks
    let weeks = []
    let numberOfWeek = dayjs(`01-01-${year}`, 'MM-DD-YYYY').isoWeeksInYear()

    for (let w = 0; w <= numberOfWeek + 1; w++) {
        // Variables for days
        let days = []
        let weekValue = dayjs(`01-01-${year}`, 'MM-DD-YYYY').week(w)

        for (let d = 0; d < 7; d++) {
            const date = DateServices.dateToISOStringZero(weekValue.day(d))
            // Create day
            if (
                date.indexOf(year - 1) === -1 &&
                date.indexOf(year + 1) === -1
            ) {
                const day = {
                    date: date,
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
    newYear = {
        year: year,
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
    years.push(newYear)

    await Assistant.findOneAndUpdate(
        {
            _utilisateur: userId,
        },
        { $set: { years: years } },
        { new: true, upsert: true }
    )

    return await Assistant.findOne(
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
}
