const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ObjectifSchema = new Schema({
    // Connexion avec l'utilisateur
    _utilisateur: {
        type: Schema.Types.ObjectId,
        ref: 'Utilisateur',
    },

    // Description de l'ojectif
    date_objectif: {
        type: String,
        required: true,
        unique: false,
    },
    date_debut: {
        type: String,
    },
    type: {
        type: String,
        enum: [
            'Critérium',
            'Course par étape',
            'Course en ligne',
            'Contre la montre',
            'Cyclosportive',
            'Road trip',
            'Distance',
            'Montagne',
        ],
        default: 'Vallon',
    },
    resultat_vise: {
        type: String,
        // enum: ['Victoire', 'Place', 'Plaisir', 'Gagner', 'Top 10', 'Top 30', 'Finir', 'Podium'],
        default: 'Victoire',
    },
    titre: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: '...',
    },
    denivele: {
        type: String,
        required: true,
    },
    distance: {
        type: Number,
        required: true,
    },
    temps: {
        type: String,
        required: true,
    },
    realise: {
        type: Boolean,
        default: false,
    },
})

ObjectifSchema.index({ _utilisateur: 1 })

module.exports = mongoose.model('Objectif', ObjectifSchema)
