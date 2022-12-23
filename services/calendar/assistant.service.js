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
                date.indexOf(year) !== -1
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

exports.fixYear = async (userId, year) => {
    let assistant = await Assistant.findOne({ _utilisateur: userId })
    let years = assistant.years
    let yearObject = {}
    let yearIndex = 0

    for (let y in years) {
        if (years[y].year === year.toString()) {
            yearObject = years[y]
            yearIndex = y
        }
    }

    let weeks = yearObject.weeks

    let newWeeks = []
    let weekNumber = 0
    let lastWeek = 0
    for (let week in weeks) {
        const days = weeks[week].days.filter(
            (day) => day.date.indexOf(year) !== -1
        )
        for (let day in days) {
            days[day].date = DateServices.dateToISOStringZero(days[day].date)
        }
        if (days.length !== 0) {
            const weekToPush = {
                ...weeks[week]._doc,
                week: weekNumber,
                days: days,
            }

            newWeeks.push(weekToPush)
            weekNumber++
            lastWeek = weekNumber
        }
    }

    const lastDay = parseInt(
        newWeeks[newWeeks.length - 1].days[
            newWeeks[newWeeks.length - 1].days.length - 1
        ].date
            .split('-')[2]
            .split('T')[0]
    )

    let missingDays = 31 - lastDay
    const missingWeeks = Math.ceil(missingDays / 7)

    for (let s = 0; s < missingWeeks; s++) {
        const maxDay = s * 7 + 7 > missingDays ? missingDays % 7 : s * 7 + 7

        const days = []
        for (let j = 0; j < maxDay; j++) {
            const date = DateServices.dateToISOStringZero(
                `${year}-12-${lastDay + 1 + s * 7 + j}T23:00:00.000Z`
            )

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

        let week = {
            week: lastWeek + s,
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
        newWeeks.push(week)
    }

    yearObject.weeks = newWeeks
    years[yearIndex] = yearObject

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
