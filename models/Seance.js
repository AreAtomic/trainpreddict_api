const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SeanceSchema = new Schema({
    // Donnees Generales
    type: {
        type: Array,
        required: true,
    },
    titre: {
        type: String,
        required: true,
    },
    // De la forme "hh:mm:ss"
    duree: {
        type: String,
        required: true,
    },
    estimation_distance: {
        type: Number,
        required: true,
    },
    estimation_deniv: {
        type: Number,
        required: true,
    },

    // Description entrainement
    specifique: {
        type: Array,
        required: true,
        example: [
            'Z2: 10',
            "Z3: 4'",
            "Z5: 1'",
            "Z3: 4'",
            "Z5: 1'",
            "Z3: 4'",
            "Z5: 1'",
            "Z3: 4'",
            "Z5: 1'",
            "Z3: 4'",
            "Z5: 1'",
            "Z3: 4'",
            "Z5: 1'",
            "Z3: 4'",
            "Z5: 1'",
            "Z3: 4'",
            "Z5: 1'",
            "Z3: 4'",
            "Z5: 1'",
            "Z2: 20'",
        ],
    },
    description: {
        type: String,
    },
    specifique_description: {
        Array,
    },

    // Donnes physiologiques attendues
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
        required: true,
    },
    Z7: {
        type: String,
        required: true,
    },

    // Pourcentage par rapport à la pfs
    puissance_moyenne: {
        type: Number,
        required: true,
    },
    charge_entrainement_estime: {
        type: Number,
        required: true,
    },
    intensite_travail: {
        type: Number,
        required: true,
    },
    score_stress_entrainement: {
        type: Number,
        required: true,
    },
})

module.exports = mongoose.model('Seance', SeanceSchema)
