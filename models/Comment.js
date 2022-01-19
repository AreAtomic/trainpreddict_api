const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CommentSchema = new Schema({
    _day: {
        type: Schema.Types.ObjectId,
        ref: 'Day',
    },
    comments: { type: Array, default: [] /* Strings */ },
})

module.exports = mongoose.model('Comment', CommentSchema)
