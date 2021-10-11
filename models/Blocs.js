const mongoose = require('mongoose')
const Schema = mongoose.Schema

const BlocsSchema = new Schema({
    specifique: {
        type: Array,
        required: true,
        example: ['ZX:XX:XX:XX', '...', 'ZX:XX:XX:XX'],
    },

    certified: {
        type: Boolean,
        default: false,
    },

    _creator: {
        type: Schema.Types.ObjectId,
        ref: 'Utilisateur',
        required: false,
    },
})

module.exports = Blocs = mongoose.model('Blocs', BlocsSchema)
