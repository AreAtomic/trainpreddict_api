const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ParametreStructureSchema = new Schema({
    _structure: {
        type: Schema.Types.ObjectId,
        ref: 'Utilisateur',
    },
    coureur: {
        courbes: {
            type: Boolean,
            default: false,
        },
    },
    seance: {
        partage: {
            type: Boolean,
            default: true,
        },
        own: {
            type: Boolean,
            default: true,
        },
    },
})

module.exports = Blocs = mongoose.model(
    'ParametreStructure',
    ParametreStructureSchema
)
