const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CourbesReaSchema = new Schema({
    _utilisateur: {
        type: Schema.Types.ObjectId,
        ref: 'Utilisateur',
        required: true,
    },
    forme: {
        type: Array,
        required: true,
    },
    fatigue: {
        type: Array,
        required: true,
    },
    labels: {
        type: Array,
        required: true,
    },
})

module.exports = mongoose.model('CourbesRea', CourbesReaSchema)
