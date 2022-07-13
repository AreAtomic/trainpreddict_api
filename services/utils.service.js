// Convertisseurs
exports.toTimeFormat = (secs) => {
    let hours = Math.floor(secs / 3600)
    let minutes = Math.floor(secs / 60) % 60
    let seconds = parseInt(secs % 60)

    if (hours) {
        return `${hours > 9 ? hours : `0${hours}`}:${
            minutes > 9 ? minutes : `0${minutes}`
        }:${seconds > 9 ? seconds : `0${seconds}`}`
    }

    return `00:${minutes > 9 ? minutes : `0${minutes}`}:${
        seconds > 9 ? seconds : `0${seconds}`
    }`
}

exports.dureeToSeconds = (duree) => {
    const time = duree.split(':')
    return time[0] * 3600 + time[1] * 60 + time[2] * 1
}

exports.hourToSeconds = (hour) => {
    return hour * 3600
}

exports.minutesToSeconds = (minutes) => {
    return minutes * 60
}

exports.toKilometer = (val) => {
    return parseFloat(Number.parseFloat(val).toPrecision(4))
}

exports.toMeters = (val) => {
    return Number.parseFloat(val).toPrecision(5) * 1000
}

// Calculs zones
exports.heartRateZone = (heartRatePercentage) => {
    if (heartRatePercentage > 0.69) {
        if (heartRatePercentage > 0.85) {
            if (heartRatePercentage > 0.95) {
                if (heartRatePercentage > 1.05) {
                    return 5
                }
                return 4
            }
            return 3
        }
        return 2
    }
    return 1
}

exports.powerZone = (powerPercentage) => {
    if (powerPercentage > 0.56) {
        if (powerPercentage > 0.76) {
            if (powerPercentage > 0.91) {
                if (powerPercentage > 1.06) {
                    if (powerPercentage > 1.21) {
                        if (powerPercentage > 1.5) {
                            return 7
                        }
                        return 6
                    }
                    return 5
                }
                return 4
            }
            return 3
        }
        return 2
    }
    return 1
}

exports.moyenneArray = (arr) => {
    let nombres = arr.length,
        valeurs = 0
    for (let i = 0; i < nombres; i++) {
        valeurs += Number(arr[i])
    }
    return parseInt(valeurs / nombres)
}
