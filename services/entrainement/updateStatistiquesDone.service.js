const utils = require('../../api/controllers/assistant/utils')
const dayjs = require('dayjs')

exports.UpdateStatistiquesDone = class {
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
