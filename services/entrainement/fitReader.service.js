const dayjs = require('dayjs')
const EntrainementModel = require('../../models/Entrainement')
const UtilsServices = require('../utils.service')

const FitParser = require('fit-file-parser').default
const fitParser = new FitParser({
    force: true,
    speedUnit: 'km/h',
    lengthUnit: 'km',
    temperatureUnit: 'celsius',
    elapsedRecordField: true,
    mode: 'both',
})

exports.FitReader = class {
    constructor(file, user, profil) {
        this.file = file
        this.user = user
        this.profil = profil
        this.name = file.name

        this.dataEntries = {
            isCadence: false,
            isPower: false,
            isHeartRate: false,
        }

        this.activityResume = null
        this.activityRecord = null

        this.date = dayjs()

        this.duree = '00:00:00'
        this.distance = 0
        this.denivele = 0
        this.fc_max = 0
        this.fc_moy = 0
        this.cadence_moy = 0
        this.cadence_max = 0
        this.power_moy = 0
        this.power_max = 0
        this.normalized_power = 0
        this.calories = 0
        this.intensite_travail = 0
        this.score_stress_entrainement = 0

        this.specifique = []
        this.description = ''
        this.type_entrainement = ['Inconnu']

        this.Z1 = 0
        this.Z2 = 0
        this.Z3 = 0
        this.Z4 = 0
        this.Z5 = 0
        this.Z6 = 0
        this.Z7 = 0
        this.Z1_FC = 0
        this.Z2_FC = 0
        this.Z3_FC = 0
        this.Z4_FC = 0
        this.Z5_FC = 0
        this.Z1_W = 0
        this.Z2_W = 0
        this.Z3_W = 0
        this.Z4_W = 0
        this.Z5_W = 0
        this.Z6_W = 0
        this.Z7_W = 0

        this.coeur_haut = 0
        this.coeur_bas = 0

        this.detailed_seconds = []
        this.fc_seconds = []
        this.power_seconds = []
        this.cad_seconds = []
        this.point_carte = []

        this.n10_power = []
        this.n10_zone = []
        this.n10_fc = []
        this.n10_cadence = []

        this.n30_power = []
        this.n30_zone = []
        this.n30_fc = []
        this.n30_cadence = []
    }

    verifyTrainingNotExist = async (userId, fileName) => {
        const entrainement = await EntrainementModel.findOne({
            _utilisateur: userId,
            type: fileName,
        })
        return entrainement ? true : false
    }

    whatAreDataEntries = (cadenceAverage, powerAverage, HeartRateAverage) => {
        return {
            isCadence: cadenceAverage !== 0 && cadenceAverage !== undefined,
            isPower: powerAverage !== 0 && powerAverage !== undefined,
            isHeartRate:
                HeartRateAverage !== 0 && HeartRateAverage !== undefined,
        }
    }

    readFile = () => {
        fitParser.parse(this.file.data, async (error, data) => {
            if (error) {
                throw error.message
            }

            this.activityResume = data.activity.sessions[0]
            this.activityRecord = data.records

            this.dataEntries = this.whatAreDataEntries(
                this.activityResume.avg_cadence,
                this.activityResume.avg_power,
                this.activityResume.avg_heart_rate
            )

            this.date = dayjs(this.activityResume.timestamp).toISOString()

            this.duree = UtilsServices.toTimeFormat(
                this.activityResume.total_timer_time
            )
            this.distance = UtilsServices.toKilometer(
                this.activityResume.total_distance
            )
            this.denivele = UtilsServices.toMeters(
                this.activityResume.total_ascent || 0
            )
            this.fc_max = this.activityResume.max_heart_rate
            this.fc_moy = this.activityResume.avg_heart_rate
            this.cadence_moy = this.activityResume.avg_cadence
            this.cadence_max = this.activityResume.max_cadence
            this.power_moy = this.activityResume.avg_power
            this.power_max = this.activityResume.max_power
            this.normalized_power = this.activityResume.normalized_power
            this.calories = this.activityResume.total_calories
            this.intensite_travail = this.activityResume.intensity_factor
            this.score_stress_entrainement =
                this.activityResume.training_stress_score
        })
    }

    readRecordPoints = () => {
        this.activityRecord.forEach((point, index) => {
            const formatedPoint = this.calculPoint(
                point,
                this.dataEntries,
                this.profil
            )
            this.detailed_seconds.push(formatedPoint)

            const zones = formatedPoint.zones
            this.incrementZone(zones.gen)

            if (this.dataEntries.isHeartRate) {
                this.fc_seconds.push(this.detailed_seconds[index].fc)
                this.incrementZone(zones.fc)
            }
            if (this.dataEntries.isPower) {
                this.power_seconds.push(this.detailed_seconds[index].power)
                this.incrementZone(zones.power)
            }
            if (this.dataEntries.isCadence) {
                this.cad_seconds.push(this.detailed_seconds[index].power)
            }
            this.point_carte.push([
                this.detailed_seconds[index].lat,
                this.detailed_seconds[index].long,
            ])

            if (this.detailed_seconds[index].hearthHigh) this.coeur_haut += 1
            if (this.detailed_seconds[index].hearthLow) this.coeur_bas += 1

            if (index % 10 === 0) {
                this.add10SecondsPoint(formatedPoint, index)
            }
            if (index % 30 === 0) {
                this.add30SecondsPoint(formatedPoint, index)
            }
        })
    }

    calculPoint = (point) => {
        const zones = this.calculZone(point)
        let hearthHigh = false
        let hearthLow = false

        if (this.dataEntries.isHeartRate) {
            hearthHigh = this.isHeartHigh(zones)
            hearthLow = this.isHeartLow(zones)
        }

        const cadence = this.dataEntries.isCadence ? point.cadence : 0
        const heartRate = this.dataEntries.isHeartRate ? point.heart_rate : null
        const power = this.dataEntries.isPower ? point.power : null

        return {
            duree: UtilsServices.toTimeFormat(point.timer_time),
            lat: point.position_lat,
            long: point.position_long,
            vitesse: UtilsServices.toKilometer(point.speed),
            altitude: UtilsServices.toMeters(point.altitude),
            cadence: cadence,
            fc: heartRate,
            power: power,
            zones,
            hearthHigh,
            hearthLow,
        }
    }

    calculZone = (point) => {
        const power = point.power
        const HeartRate = point.heart_rate

        if (this.dataEntries.isPower) {
            if (this.dataEntries.isHeartRate) {
                const powerZone = UtilsServices.heartRateZone(
                    power / this.profil.pfs
                )
                const HeartRateZone = UtilsServices.powerZone(
                    HeartRate / this.profil.fcfs
                )
                const zone = Math.round((powerZone + HeartRateZone) / 2, 2)

                return { gen: zone, fc: HeartRateZone, power: powerZone }
            } else {
                const powerZone = UtilsServices.heartRateZone(
                    power / this.profil.pfs
                )

                return { gen: powerZone, power: powerZone }
            }
        } else if (this.dataEntries.isHeartRate) {
            const HeartRateZone = UtilsServices.powerZone(
                HeartRate / this.profil.fcfs
            )

            return { gen: HeartRateZone, fc: HeartRateZone }
        } else {
            throw 'There is no FC and no Power data.'
        }
    }

    isHeartHigh = (zones) => {
        if (zones.HeartRate > zones.power + 0.5) {
            return true
        }
        return false
    }

    isHeartLow = (zones) => {
        if (zones.power > zones.HeartRate + 0.5) {
            return true
        }
        return false
    }

    incrementZone = (zone, zone_power) => {
        if (zone > 1) {
            if (zone > 2) {
                if (zone > 3) {
                    if (zone > 4) {
                        if (zone_power > 5) {
                            if (zone_power > 6) {
                                this.Z7 += 1
                            } else {
                                this.Z6 += 1
                            }
                        } else {
                            this.Z5 += 1
                        }
                    } else {
                        this.Z4 += 1
                    }
                } else {
                    this.Z3 += 1
                }
            } else {
                this.Z2 += 1
            }
        } else {
            this.Z1 += 1
        }
    }

    incrementZoneHeartRate = (zone) => {
        if (zone > 1) {
            if (zone > 2) {
                if (zone > 3) {
                    if (zone > 4) {
                        this.Z5_FC += 1
                    } else {
                        this.Z4_FC += 1
                    }
                } else {
                    this.Z3_FC += 1
                }
            } else {
                this.Z2_FC += 1
            }
        } else {
            this.Z1_FC += 1
        }
    }

    incrementZonePower = (zone) => {
        if (zone > 1) {
            if (zone > 2) {
                if (zone > 3) {
                    if (zone > 4) {
                        if (zone > 5) {
                            if (zone > 6) {
                                this.Z7_W += 1
                            } else {
                                this.Z6_W += 1
                            }
                        } else {
                            this.Z5_W += 1
                        }
                    } else {
                        this.Z4_W += 1
                    }
                } else {
                    this.Z3_W += 1
                }
            } else {
                this.Z2_W += 1
            }
        } else {
            this.Z1_W += 1
        }
    }

    add10SecondsPoint = (point, index) => {
        let sum_HeartRate = 0
        let sum_power = 0
        const zones = {
            fc: 0,
            power: 0,
            gen: 0,
        }
        if (index > 9) {
            for (let i = index - 10; i < index; i++) {
                if (this.dataEntries.isHeartRate) {
                    sum_HeartRate += this.detailed_seconds[i].zones.fc
                }
                if (this.dataEntries.isPower) {
                    sum_power += this.detailed_seconds[i].zones.power
                }
            }
            if (this.dataEntries.isHeartRate) {
                if (this.dataEntries.isPower) {
                    zones.fc = sum_HeartRate / 10
                    zones.power = sum_power / 10
                    zones.gen = (sum_HeartRate / 10 + sum_power / 10) / 2
                } else {
                    zones.fc = sum_HeartRate / 10
                    zones.gen = sum_HeartRate / 10
                }
            } else if (this.dataEntries.isPower) {
                zones.power = sum_power / 10
                zones.gen = sum_power / 10
            }
            this.n10_zone.push(zones)
        }
        if (this.dataEntries.isHeartRate) {
            this.n10_fc.push(point.fc)
        }
        if (this.dataEntries.isPower) {
            this.n10_power.push(point.power)
        }
        if (this.dataEntries.isCadence) {
            this.n10_cadence.push(point.cadence)
        }
    }

    add30SecondsPoint = (point, index) => {
        let sum_HeartRate = 0
        let sum_power = 0
        const zones = {
            fc: 0,
            power: 0,
            gen: 0,
        }
        if (index > 29) {
            for (let i = index - 30; i < index; i++) {
                if (this.dataEntries.isHeartRate) {
                    sum_HeartRate += this.detailed_seconds[i].zones.fc
                }
                if (this.dataEntries.isPower) {
                    sum_power += this.detailed_seconds[i].zones.power
                }
            }
            if (this.dataEntries.isHeartRate) {
                if (this.dataEntries.isPower) {
                    zones.fc = sum_HeartRate / 30
                    zones.power = sum_power / 30
                    zones.gen = (sum_HeartRate / 30 + sum_power / 30) / 2
                } else {
                    zones.fc = sum_HeartRate / 30
                    zones.gen = sum_HeartRate / 30
                }
            } else if (this.dataEntries.isPower) {
                zones.power = sum_power / 30
                zones.gen = sum_power / 30
            }
            this.n30_zone.push(zones)
        }
        if (this.dataEntries.isHeartRate) {
            this.n30_fc.push(point.fc)
        }
        if (this.dataEntries.isPower) {
            this.n30_power.push(point.power)
        }
        if (this.dataEntries.isCadence) {
            this.n30_cadence.push(point.cadence)
        }
    }

    calculSpecifique = () => {
        let zone = 0
        let temps = 0
        this.n30_zone.forEach((point, index) => {
            if (index == 0) {
                temps = 30
                zone = parseInt(this.n30_zone[index].gen)
            }
            if (parseInt(this.n30_zone[index].gen) == zone) {
                temps += 30
            } else {
                if (temps < 60) {
                    this.specifique.push(
                        `Z${zone}: ${UtilsServices.toTimeFormat(temps)}`
                    )
                } else {
                    this.specifique.push(
                        `Z${zone}: ${UtilsServices.toTimeFormat(temps)}`
                    )
                }
                zone = parseInt(this.n30_zone[index].gen)
                temps = 30
            }
        })
    }

    generateDescription = () => {
        const time = this.activityResume.total_timer_time
        if (this.dataEntries.isHeartRate) {
            if (this.dataEntries.isPower) {
                if (this.Z1 / time > 0.2) {
                    this.description +=
                        'Ton coeur est très bas, cela veut dire que tu as fait une très bonne sortie de récupération ou que tu es très en forme et que ton coeur ne monte que quand cela est nécessaire ou que tu es très fatigué.'
                }
                if (
                    this.coeur_haut != this.coeur_bas &&
                    this.coeur_haut / time > 0.1
                ) {
                    this.description +=
                        'Ton coeur monte plus vite que tes watts, cela veut dire que tu es dans une phase de surcompensation et que ton corps commence à assimiler ton entraînement ou que tu es sur une phase descendante de ta courbe de forme.'
                }
                if (this.coeur_bas == this.coeur_haut) {
                    this.description +=
                        'Ton coeur est très en forme il monte vite mais descend également vite.'
                }
                if (this.Z4 / time > 0.2) {
                    this.description +=
                        'Tu tiens très bien le seuil, tu commences à être en forme ou tu es déjà en forme.'
                }
                if (this.Z5 / time > 0.5) {
                    this.description +=
                        'Tu as une très bonne PMA, tu es soit très très adepte des accouts soit très en forme si tu resistes également bien au seuil.\n'
                }
            } else {
                if (this.Z1 / time > 0.3) {
                    this.description +=
                        'Ton coeur est très bas, cela veut dire que tu as fait une très bonne sortie de récupération ou que tu es très en forme et que ton coeur ne monte que quand cela est nécessaire ou que tu es très fatigué.'
                }
                if (this.Z4 / time > 0.2 && this.Z5 / time > 0.1) {
                    this.description +=
                        'Ton coeur monte vite, cela veut dire que tu es dans une phase de surcompensation et que ton corps commence à assimiler ton entraînement ou que tu es sur une phase descendante de ta courbe de forme.'
                }
                if (this.Z2 / time > 0.5) {
                    this.description +=
                        "Tu as réalisé un bonne sortie d'endurance fondamentale."
                }
                if (this.Z4 / time > 0.2 && this.Z1 / time > 0.2) {
                    this.description +=
                        'Ton coeur est très en forme il monte vite mais descend également vite.'
                }
                if (this.Z4 / time > 0.2) {
                    this.description +=
                        'Tu tiens très bien le seuil, tu commences à être en forme ou tu es déjà en forme.'
                }
                if (this.Z5 / time > 0.05) {
                    this.description +=
                        'Tu as une très bonne PMA, tu es soit très très adepte des accouts soit très en forme si tu resistes également bien au seuil.\n'
                }
            }
        } else if (this.dataEntries.isPower) {
            if (this.Z1 > time / 3) {
                this.description +=
                    "Tu as passé beaucoup de temps en zone 1, c'est une très bonne sortie de récupération ou que tu es très fatigué."
            }
            if (this.Z2 > time / 2) {
                this.description +=
                    "Tu as réalisé un bonne sortie d'endurance fondamentale."
            }
            if (this.Z4 / time > 0.2) {
                this.description +=
                    'Tu tiens très bien le seuil, tu commences à être en forme ou tu es déjà en forme.'
            }
            if (this.Z5 / time > 0.05) {
                this.description +=
                    'Tu as une très bonne PMA, tu es soit très très adepte des accouts soit très en forme si tu resistes également bien au seuil.\n'
            }
        }
    }

    getEntrainement = () => {
        return {
            date: this.date,
            duree: this.duree,
            distance: this.distance,
            deniv: this.denivele,
            intensite_travail: this.intensite_travail,
            score_stress_entrainement: this.score_stress_entrainement,
            fc_seconds: this.dataEntries.isHeartRate && this.fc_seconds,
            power_seconds: this.dataEntries.isPower && this.power_seconds,
            cad_seconds: this.dataEntries.isCadence && this.cad_seconds,
            n10_fc: this.dataEntries.isHeartRate && this.n10_fc,
            n10_power: this.dataEntries.isPower && this.n10_power,
            n10_cadence: this.dataEntries.isCadence && this.n10_cadence,
            n10_zone: this.n10_zone,
            n30_fc: this.dataEntries.isHeartRate && this.n30_fc,
            n30_power: this.dataEntries.isPower && this.n30_power,
            n30_cadence: this.dataEntries.isCadence && this.n30_cadence,
            n30_zone: this.n30_zone,
            type: this.name,
            type_entrainement: this.type_entrainement,
            fc_max: this.dataEntries.isHeartRate && this.fc_max,
            fc_moy: this.dataEntries.isHeartRate && this.fc_moy,
            cadence_moy: this.dataEntries.isCadence && this.cadence_moy,
            cadence_max: this.dataEntries.isCadence && this.cadence_max,
            power_moy: this.dataEntries.isPower && this.power_moy,
            power_max: this.dataEntries.isPower && this.power_max,
            normalized_power: this.dataEntries.isPower && this.normalized_power,
            calories: this.calories,
            specifique: this.specifique,
            description: this.description,
            Z1: this.Z1,
            Z2: this.Z2,
            Z3: this.Z3,
            Z4: this.Z4,
            Z5: this.Z5,
            Z6: this.Z6,
            Z7: this.Z7,
            zone_fc: [
                this.Z1_FC,
                this.Z2_FC,
                this.Z3_FC,
                this.Z4_FC,
                this.Z5_FC,
            ],
            power_zone: [
                this.Z1_W,
                this.Z2_W,
                this.Z3_W,
                this.Z4_W,
                this.Z5_W,
                this.Z6_W,
                this.Z7_W,
            ],
            point_carte: this.point_carte,
            dataEntries: this.dataEntries,
        }
    }
}
