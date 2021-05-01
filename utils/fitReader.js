// Require the module
const FitParser = require('fit-file-parser').default
const fs = require('fs')

// Create a FitParser instance (options argument is optional)
var fitParser = new FitParser({
    force: true,
    speedUnit: 'km/h',
    lengthUnit: 'km',
    temperatureUnit: 'celsius',
    elapsedRecordField: true,
    mode: 'both',
})

const fitReader = (file) => {
    const read = () =>
        fs.readFile(`./tmp/${file}`, function (err, content) {
            if (err) {
                console.log(err)
            }

            // Parse your file
            const fitToJson = () =>
                fitParser.parse(content, function (error, data) {
                    let resume
                    let detailed_seconds = []
                    // Handle result of parse method
                    if (error) {
                        console.log(error)
                    } else {
                        // Lecture du résumé
                        resume = {
                            date: data.activity.sessions[0].timestamp,
                            duree: toHHMMSS(
                                data.activity.sessions[0].total_timer_time
                            ),
                            distance: Number.parseFloat(
                                data.activity.sessions[0].total_distance
                            ).toPrecision(4),
                            calories: data.activity.sessions[0].total_calories,
                            avg: Number.parseFloat(
                                data.activity.sessions[0].avg_speed
                            ).toPrecision(4),
                            ascent:
                                Number.parseFloat(
                                    data.activity.sessions[0].total_ascent
                                ).toPrecision(5) * 1000,
                            descent:
                                Number.parseFloat(
                                    data.activity.sessions[0].total_descent
                                ).toPrecision(5) * 1000,
                            alt_max:
                                Number.parseFloat(
                                    data.activity.sessions[0].max_altitude
                                ).toPrecision(5) * 1000,
                            fc_moy: data.activity.sessions[0].avg_heart_rate,
                            fc_max: data.activity.sessions[0].max_heart_rate,
                            cadence_moy: data.activity.sessions[0].avg_cadence,
                            cadence_max: data.activity.sessions[0].max_cadence,
                            power_moy: data.activity.sessions[0].avg_power,
                            power_normalized:
                                data.activity.sessions[0].normalized_power,
                        }

                        // Lecture de chaque points
                        for (let i = 0; i < data.records.length; i++) {
                            let point = data.records[i]
                            let add = {
                                duree: toHHMMSS(point.timer_time),
                                lat: point.position_lat,
                                long: point.position_long,
                                vitesse: Number.parseFloat(
                                    point.speed
                                ).toPrecision(4),
                                altitude:
                                    Number.parseFloat(
                                        point.altitude
                                    ).toPrecision(5) * 1000,
                            }
                            detailed_seconds.push(add)
                        }
                        data = { resume: resume, points: detailed_seconds }
                        return data
                    }
                })
            return fitToJson()
        })
    return read()
}

module.exports = fitReader

var toHHMMSS = (secs) => {
    var sec_num = parseInt(secs, 10)
    var hours = Math.floor(sec_num / 3600)
    var minutes = Math.floor(sec_num / 60) % 60
    var seconds = sec_num % 60

    return [hours, minutes, seconds]
        .map((v) => (v < 10 ? '0' + v : v))
        .filter((v, i) => v !== '00' || i > 0)
        .join(':')
}
