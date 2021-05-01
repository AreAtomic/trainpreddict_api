const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CourseSchema = new Schema({
    _utilisateur: {
        type: Schema.Types.ObjectId,
        ref: 'Utilisateur',
    },
    date: {
        type: String,
        required: true,
    },
    titre: {
        type: String,
        reqiured: true,
    },
})

module.exports = mongoose.model('Course', CourseSchema)
