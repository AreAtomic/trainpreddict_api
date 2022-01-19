const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AssistantSchema = new Schema({
    _year: {
        type: Schema.Types.ObjectId,
        ref: 'Year',
    },
    week: { type: Number, required: true },
    days: {
        type: Array,
        required: true,
        // Contain [dayId, ...] => day : {date, planned [], comment [], done [], statistique, form, tiredness}
    },
    statistique: { type: Schema.Types.ObjectId, ref: 'Statistique' },
    form: { type: String, required: true },
    tiredness: { type: String, required: true },
})

module.exports = mongoose.model('Assistant', AssistantSchema)
