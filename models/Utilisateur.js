const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UtilisateurSchema = new Schema({
    prenom: {
        type: 'string',
        required: true,
    },
    nom: {
        type: 'string',
        required: true,
    },

    // Informations pour connexions
    email: {
        type: 'string',
        required: true,
        unique: true,
    },
    mot_de_passe: {
        type: 'string',
        required: true,
    },
})

module.exports = mongoose.model('Utilisateur', UtilisateurSchema)
