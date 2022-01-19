const mongoose = require('mongoose')
const Schema = mongoose.Schema

const StatistiqueSchema = new Schema({
    planned: {
        time: { type: String, required: true },
        distance: { type: Number, required: true },
        sse: { type: Number, required: true },
        denivele: { type: Number, required: true },
        nombreSeance: { type: Number, required: true },
    },
    done: {
        time: { type: String, required: true },
        distance: { type: Number, required: true },
        sse: { type: Number, required: true },
        denivele: { type: Number, required: true },
        nombreSeance: { type: Number, required: true },
    },
})

module.exports = mongoose.model('Statistique', StatistiqueSchema)
