const mongoose = require('mongoose')
const Schema = mongoose.Schema

const StructureUtilisateurSchema = new Schema({
    _utilisateur: {
        type: Schema.Types.ObjectId,
        ref: 'Utilisateur',
    },
    _admin: {
        type: Schema.Types.ObjectId,
        ref: 'Admin',
    },
})

module.exports = mongoose.model(
    'StructureUtilisateur',
    StructureUtilisateurSchema
)
