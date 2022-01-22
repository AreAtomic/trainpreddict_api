exports.genMdp = () => {
    const mdp = [
        '(',
        ')',
        '+',
        'a',
        'b',
        'c',
        'd',
        'e',
        'f',
        'g',
        'h',
        'i',
        'j',
        'k',
        'l',
        'm',
        'n',
        'o',
        'p',
        'q',
        'r',
        's',
        't',
        'u',
        'v',
        'w',
        'x',
        'y',
        'z',
        '?',
        '#',
        '!',
        '=',
        '§',
        '*',
        '$',
        '£',
        '_',
        '/',
        'è',
        'ç',
        'à',
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
    ]

    let mdp_decrypt = ''
    let caractere
    for (let i = 0; i < 12; i++) {
        caractere = mdp[Math.floor(Math.random() * (mdp.length + 1))]
        mdp_decrypt += caractere
    }

    return mdp_decrypt
}

exports.addHours = (a, b) => {
    console.log(a, b)
    const s1 = parseInt(a.substr(6, 9))
    const s2 = parseInt(b.substr(6, 9))
    const s = s1 + s2
    const seconds = s > 59 ? s - 60 : s
    const m1 = parseInt(a.substr(3, 5))
    const m2 = parseInt(b.substr(3, 5))
    const m = m1 + m2 + (s > 59 ? 1 : 0)
    const minutes = m > 59 ? m - 60 : m
    const h1 = parseInt(a.substr(0, 2))
    const h2 = parseInt(b.substr(0, 2))
    const hours = h1 + h2 + (m > 59 ? 1 : 0)
    return `${hours < 10 ? `0${hours}` : hours}:${
        minutes < 10 ? `0${minutes}` : minutes
    }:${seconds < 10 ? `0${seconds}` : seconds}`
}

exports.deleteHours = (a, b) => {
    console.log(a, b)
    const s1 = parseInt(a.substr(6, 9))
    const s2 = parseInt(b.substr(6, 9))
    const s = s1 - s2
    const seconds = s < 0 ? 60 + s : s
    const m1 = parseInt(a.substr(3, 5))
    const m2 = parseInt(b.substr(3, 5))
    const m = m1 - m2 - (s < 0 ? 1 : 0)
    const minutes = m < 0 ? 60 + m : m
    const h1 = parseInt(a.substr(0, 2))
    const h2 = parseInt(b.substr(0, 2))
    const hours = h1 - h2 - (m < 0 ? 1 : 0)
    return `${hours < 10 ? `0${hours}` : hours}:${
        minutes < 10 ? `0${minutes}` : minutes
    }:${seconds < 10 ? `0${seconds}` : seconds}`
}

exports.hoursToInt = (duree) => {
    let hours = parseInt(duree.substr(0, 2))
    const minutes = parseFloat(parseInt(duree.substr(3, 5)) / 60).toPrecision(1)
    hours = parseFloat(hours) + parseFloat(minutes)
    return hours
}

exports.moyenneArray = (array) => {
    let i = 0,
        summ = 0,
        arrayLength = array.length
    while (i < arrayLength) {
        summ = summ + array[i++]
    }
    return summ / arrayLength
}
