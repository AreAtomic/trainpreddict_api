const dayjs = require('dayjs')

exports.dateToISOStringZero = (date) => {
    return `${dayjs(date).toISOString().split('T')[0]}T00:00:00.000Z`
}
