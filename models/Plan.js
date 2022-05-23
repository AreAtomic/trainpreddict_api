const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PlanSchema = new Schema({
    // Connexion avec les collections de données de l'utilisateur
    _utilisateur: {
        type: Schema.Types.ObjectId,
        ref: 'Utilisateur',
    },
    _donnees_utilisateur: {
        type: Schema.Types.ObjectId,
        ref: 'DonneesUtilisateur',
    },

    // Duree du plan
    date_debut: {
        type: Date,
        default: Date.now(),
    },
    date_fin: {
        type: Date,
        required: true,
    },

    // Connexions aux collections de données de séances et d'entrainement
    SeancesDefinies: {
        type: Array,
        example: [
            'idSeancexx1',
            'Sun Aug 16 2020 11:21:33 GMT+0200 (GMT+02:00)',
        ],
    },
})

module.exports = mongoose.model('Plan', PlanSchema)
