const mongoose = require('mongoose')
const Schema = mongoose.Schema

const EntrainementSchema = new Schema({
    //Donnes utilisateur
    _utilisateur: {
        type: Schema.Types.ObjectId,
        ref: 'Utilisateur',
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    type_entrainement: {
        type: Array,
    },

    // Donnees Generales
    type: {
        type: String,
        required: true,
    },
    duree: {
        type: String,
        required: true,
    },
    distance: {
        type: String,
        required: true,
    },
    deniv: {
        type: Number,
        required: true,
    },
    fc_moy: {
        type: Number,
    },
    fc_max: {
        type: Number,
    },
    cadence_moy: {
        type: Number,
        min: 0,
    },
    cadence_max: {
        type: Number,
        min: 0,
    },
    power_moy: {
        type: Number,
        min: 0,
    },
    power_max: {
        type: Number,
        min: 0,
    },
    normalized_power: {
        type: Number,
        min: 0,
    },
    calories: {
        type: Number,
        min: 0,
    },

    // Description entrainement
    specifique: {
        type: Array,
        required: true,
    },
    fc_seconds: {
        type: Array,
    },
    power_seconds: {
        type: Array,
    },
    cad_seconds: {
        type: Array,
    },
    n10_fc: {
        type: Array,
    },
    n10_power: {
        type: Array,
    },
    n30_fc: {
        type: Array,
    },
    n30_power: {
        type: Array,
    },
    description: {
        type: String,
    },

    // Donnes physiologiques de l'utilisateurs
    zone_fc: {
        type: Array,
    },
    power_zone: {
        type: Array,
    },
    Z1: {
        type: String,
        required: true,
    },
    Z2: {
        type: String,
        required: true,
    },
    Z3: {
        type: String,
        required: true,
    },
    Z4: {
        type: String,
        required: true,
    },
    Z5: {
        type: String,
        required: true,
    },
    Z6: {
        type: String,
    },
    Z7: {
        type: String,
    },
    intensite_travail: {
        type: Number,
        required: true,
    },
    score_stress_entrainement: {
        type: Number,
        required: true,
    },
    ressentis: {
        type: Number,
        example: '0.8',
        default: 0,
    },
    point_carte: {
        type: Array,
    },

    // Prise en compte dans les statistiques
    statistiques: {
        type: Boolean,
        default: false,
    },
    tableau_statistiques: {
        max_20_mins: { type: Array },
        max_5_mins: { type: Array },
        max_1_min: { type: Array },
        max_5_secs: { type: Array },
    },
})

EntrainementSchema.index({ date: 1 })

module.exports = mongoose.model('Entrainement', EntrainementSchema)
