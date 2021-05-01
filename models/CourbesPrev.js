const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CourbesPrevSchema = new Schema({
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

module.exports = mongoose.model('CourbesPrev', CourbesPrevSchema)
