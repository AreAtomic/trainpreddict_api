const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ImageSchema = new Schema({
    _owner: {
        type: Schema.Types.ObjectId,
        ref: 'Utilisateur',
    },
    fileId: String,
    name: String,
    thumbnailUrl: String,
    url: String,
})

module.exports = mongoose.model('Image', ImageSchema)
