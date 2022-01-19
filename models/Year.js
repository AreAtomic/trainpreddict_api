const mongoose = require('mongoose')
const Schema = mongoose.Schema

const YearSchema = new Schema({
    _assistant: {
        type: Schema.Types.ObjectId,
        ref: 'Assistant',
    },
    year: { type: String, required: true },
    weeks: {
        type: Array,
        required: true,
        // Contain [week, ...] => Contain [day, ...] => day : {date, planned [], comment [], done [], statistique, form, tiredness}
    },
})

module.exports = mongoose.model('Year', YearSchema)
