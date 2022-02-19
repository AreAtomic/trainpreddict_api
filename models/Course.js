const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CourseSchema = new Schema({
    // Connexion avec l'utilisateur
    _utilisateur: {
        type: Schema.Types.ObjectId,
        ref: 'Utilisateur',
    },
    _organisme: {
        type: Schema.Types.ObjectId,
        ref: 'Utilisateur',
    },

    // Connexion avec le jour
    date: {
        type: String,
        required: true,
    },

    // Description de la course
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
            'VTT'
        ],
        default: 'Vallon',
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
    sse: {
        type: Number,
        default: 200,
    },
})

CourseSchema.index({ date: 1 })

module.exports = mongoose.model('Course', CourseSchema)
