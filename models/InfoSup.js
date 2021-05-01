const mongoose = require('mongoose')
const Schema = mongoose.Schema

const InfoSupSchema = new Schema({
    _utilisateur: {
        type: Schema.Types.ObjectId,
        ref: 'Utilisateur',
    },
    naissance: {
        type: 'string',
        required: 'true',
    },
    adresse: {
        type: 'string',
        required: 'true',
    },
    decouverte: {
        type: 'string',
        required: 'true',
    },
    categorie: {
        type: 'string',
        required: 'true',
    },
    telephone: {
        type: 'string',
        required: 'true',
    },
})

module.exports = VerificationComptesDoublons = mongoose.model(
    'InfoSup',
    InfoSupSchema
)
