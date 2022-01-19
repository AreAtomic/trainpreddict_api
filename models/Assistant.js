const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AssistantSchema = new Schema({
    _utilisateur: {
        type: Schema.Types.ObjectId,
        ref: 'Utilisateur',
    },
    years: {
        type: Array,
        required: true,
        // Contain [yearId, ...] => Contain [weekId, ...] => Contain [dayId, ...] => day : {date, planned [], comment [], done [], statistique, form, tiredness}
    },
})

module.exports = mongoose.model('Assistant', AssistantSchema)
