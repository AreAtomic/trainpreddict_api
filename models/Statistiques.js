const mongoose = require('mongoose')
const Schema = mongoose.Schema

const StatistiqueSchema = new Schema({
    // Connexion avec les collections de données de l'utilisateur
    _utilisateur: {
        type: Schema.Types.ObjectId,
        ref: 'Utilisateur',
    },
    // Total depuis utilisation appli
    entrainement: {
        type: Array,
        example: [
            {
                2020: {
                    mois: {
                        janvier: {
                            kilometres: 1000,
                            heures: 34,
                            sse: 3500,
                            gain_forme: +30,
                        },
                        février: {
                            kilometres: 1200,
                            heures: 40,
                            sse: 3900,
                            gain_forme: +40,
                        },
                        mars: {
                            kilometres: 1200,
                            heures: 40,
                            sse: 3900,
                            gain_forme: -5,
                        },
                    },
                    semaines: {
                        S1: {
                            kilometres: 200,
                            heures: 14,
                            sse: 700,
                            gain_forme: +5,
                        },
                        S2: {
                            kilometres: 250,
                            heures: 15,
                            sse: 710,
                            gain_forme: +7,
                        },
                    },
                },
            },
            {
                2021: {
                    mois: {
                        janvier: {
                            kilometres: 1000,
                            heures: 34,
                            sse: 3500,
                            gain_forme: +30,
                        },
                        février: {
                            kilometres: 1200,
                            heures: 40,
                            sse: 3900,
                            gain_forme: +40,
                        },
                        mars: {
                            kilometres: 1200,
                            heures: 40,
                            sse: 3900,
                            gain_forme: -5,
                        },
                    },
                    semaines: {
                        S1: {
                            kilometres: 200,
                            heures: 14,
                            sse: 700,
                            gain_forme: +5,
                        },
                        S2: {
                            kilometres: 250,
                            heures: 15,
                            sse: 710,
                            gain_forme: +7,
                        },
                    },
                },
            },
        ],
    },

    reccord_20_minutes: {
        type: Number,
    },
    reccord_5_minutes: {
        type: Number,
    },
    reccord_1_minutes: {
        type: Number,
    },
    recourd_5_seconds: {
        type: Number,
    },
})

module.exports = mongoose.model('Statistiques', StatistiqueSchema)
