const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SeanceMusuculationSchema = new Schema({
    nom: {
        type: String,
        required: true,
    },
    exercices: [
        {
            type: Schema.Types.ObjectId,
            ref: 'ExerciceMusculation',
        },
    ],
    description: {
        type: Number,
        required: true,
    },
    score_stress_entrainement: {
        type: Number,
        default: 75,
    },
})

module.exports = mongoose.model('SeanceMusculation', SeanceMusuculationSchema)
