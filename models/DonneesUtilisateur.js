const mongoose = require('mongoose')
const Schema = mongoose.Schema

const DonneesUtilisateurSchema = new Schema({
    // Connexion avec les collections de données de l'utilisateur
    _utilisateur: {
        type: Schema.Types.ObjectId,
        ref: 'Utilisateur',
    },
    experience: {
        // Annnées
        type: Number,
    },
    heure_sommeil: {
        // Heure
        type: Number,
        max: 12,
        min: 2,
    },
    temps_recup_max: {
        // heure
        type: Number,
        min: 12,
    },

    // Info plan semaine
    sse: {
        type: Number,
        default: 700,
    },
    nombre_heure_semaine: {
        type: Number,
        required: true,
    },
    nombre_seance_semaine: {
        type: Number,
        required: true,
    },
    jours_repos: [
        {
            type: String,
            enum: [
                'Lundi',
                'Mardi',
                'Mercredi',
                'Jeudi',
                'Vendredi',
                'Samedi',
                'Dimanche',
            ],
            default: ['Lundi', 'Jeudi'],
        },
    ],

    // Info complemantaire
    musculation: {
        type: Boolean,
        required: true,
    },
    ppg: {
        type: Boolean,
        default: true,
    },
    etirement: {
        type: Boolean,
        required: true,
    },
    foncier: {
        type: String,
        enum: ['Force', 'Vélocité', 'Fixe'],
        required: true,
    },
    style: {
        type: String,
        enum: [
            'Grimpeur',
            'Sprinteur',
            'Puncheur',
            'Coureur de classique',
            'Rouleur',
            'Complet',
        ],
        required: true,
    },
    point_faible: {
        type: String,
        enum: [
            'Montagne',
            'Sprint',
            'Explosivité',
            'Accélération répétée',
            'Plat',
            'Trop fort',
        ],
        required: true,
    },
})

module.exports = mongoose.model('DonneesUtilisateur', DonneesUtilisateurSchema)
