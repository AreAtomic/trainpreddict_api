const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ProfilSchema = new Schema({
    //Connexion avec l'utilisateur
    _utilisateur: {
        type: Schema.Types.ObjectId,
        ref: 'Utilisateur',
    },

    // Données physique sur l'utilisateur
    fcfs: {
        type: Number,
        required: true,
        default: 200,
        max: 220,
    },
    pfs: {
        type: Number,
        required: true,
        default: 300,
    },
    age: {
        type: Number,
        required: true,
        default: 14,
        min: 14,
    },
    poids: {
        type: Number,
        required: true,
        default: 75,
        max: 120,
    },
})

module.exports = mongoose.model('Profil', ProfilSchema)
