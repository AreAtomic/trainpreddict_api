const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ArticlesSchema = new Schema({
    _writer: {
        type: Schema.Types.ObjectId,
        ref: 'Utilisateur',
    },
    title: {
        type: String,
        required: true,
    },
    content: {
        type: Array,
        default: [],
    },
    _cover: {
        type: Schema.Types.ObjectId,
        ref: 'Image',
    },
    state: {
        type: String,
        enum: ['draft', 'publish', 'archive']
    },
    creation: {
        type: String, //ISOString
    },
    lastUpdate: {
        type: String, //ISOString
    },
})

module.exports = mongoose.model('Articles', ArticlesSchema)
