const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AdminSchema = new Schema({
    nom: {
        type: String,
        required: true,
    },

    comptes: {
        type: Array,
        default: []
    },

    type: {
        type: String,
        enum: ['Coach', 'Club', 'TrainPreddict'],
    },

    // Informations pour connexions
    email: {
        type: String,
        required: true,
        unique: true,
    },
    mot_de_passe: {
        type: String,
        required: true,
    },
})

module.exports = Admin = mongoose.model('Admin', AdminSchema)
