const mongoose = require('mongoose')
const Schema = mongoose.Schema

const DaySchema = new Schema({
    _week: {
        type: Schema.Types.ObjectId,
        ref: 'Year',
    },
    date: { type: String, required: true },
    planned: { type: Array, required: true /*[SeanceId... ||&& CoursesId]*/ },
    objectif: { type: Schema.Types.ObjectId, ref: 'Objectif' },
    comment: { type: Array, required: true /*[CommentId...]*/ },
    done: { type: Array, required: true /*[EntrainementId...]*/ },
    statistique: { type: Schema.Types.ObjectId, ref: 'Statistique' },
    form: { type: String, required: true },
    tiredness: { type: String, required: true },
})

module.exports = mongoose.model('Day', DaySchema)
