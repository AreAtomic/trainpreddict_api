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
        example: [[50, "...", 0], [0, "...", 0]]
    },
    fatigue: {
        type: Array,
        required: true,
        example: [[150, "...", 0], [0, "...", 0]]
    },
    labels: {
        type: Array,
        required: true,
        example: [["01/01/2000", "...", "31/12/2000"], ["01/01/2100", "...", "31/12/2100"]]
    },
})

module.exports = mongoose.model('CourbesRea', CourbesReaSchema)
