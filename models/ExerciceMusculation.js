const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ExerciceMusuculationSchema = new Schema({
    nom: {
        type: String,
        required: true,
    },
    repetitions: {
        type: Number,
        required: true,
    },
    series: {
        type: Number,
        required: true,
    },
    recup: {
        type: String,
        required: true,
        example: '00:01:30',
    },
    description: {
        type: String,
        required: true,
    },
    url: {
        type: String,
    },
})

module.exports = mongoose.model(
    'ExerciceMusculation',
    ExerciceMusuculationSchema
)
