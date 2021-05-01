const mongoose = require('mongoose')
const Schema = mongoose.Schema

const StatistiqueSchema = new Schema({
    // Connexion avec les collections de données de l'utilisateur
    _utilisateur: {
        type: Schema.Types.ObjectId,
        ref: 'Utilisateur',
    },
    // Total depuis utilisation appli
    total_kilometres: {
        type: Number,
        default: 0,
    },
    total_heures: {
        type: Number,
        default: 0,
    },
    total_sorties: {
        type: Number,
        default: 0,
    },
    // Total sur l'année
    an_kilometres: {
        type: Number,
        default: 0,
    },
    an_heures: {
        type: Number,
        default: 0,
    },
    an_sorties: {
        type: Number,
        default: 0,
    },
    // Total sur le mois
    mois_kilometres: {
        type: Number,
        default: 0,
    },
    mois_heures: {
        type: Number,
        default: 0,
    },
    mois_sorties: {
        type: Number,
        default: 0,
    },
    // Semaine
    semaine_kilometres: {
        type: Number,
        default: 0,
    },
    semaine_heures: {
        type: Number,
        default: 0,
    },
    semaine_sorties: {
        type: Number,
        default: 0,
    },
})

module.exports = mongoose.model('Statistiques', StatistiqueSchema)
