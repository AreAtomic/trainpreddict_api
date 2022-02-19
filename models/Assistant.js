const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AssistantSchema = new Schema({
    _utilisateur: {
        type: Schema.Types.ObjectId,
        ref: 'Utilisateur',
    },
    years: [
        {
            year: { type: String, required: true },
            statistiques: {
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
            },
            weeks: [
                {
                    week: { type: Number, required: true },
                    statistiques: {
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
                    },
                    days: [
                        {
                            date: { type: String, required: true },
                            planned: {
                                type: Array,
                                required: true /*[SeanceId... ||&& CoursesId]*/,
                            },
                            objectif: {
                                type: Schema.Types.ObjectId,
                                ref: 'Objectif',
                            },
                            comment: {
                                type: Array,
                                required: true /*[CommentId...]*/,
                            },
                            done: {
                                type: Array,
                                required: true /*[EntrainementId...]*/,
                            },
                            statistiques: {
                                planned: {
                                    time: { type: String, required: true },
                                    distance: { type: Number, required: true },
                                    sse: { type: Number, required: true },
                                    denivele: { type: Number, required: true },
                                    nombreSeance: {
                                        type: Number,
                                        required: true,
                                    },
                                },
                                done: {
                                    time: { type: String, required: true },
                                    distance: { type: Number, required: true },
                                    sse: { type: Number, required: true },
                                    denivele: { type: Number, required: true },
                                    nombreSeance: {
                                        type: Number,
                                        required: true,
                                    },
                                },
                            },
                            form: {
                                planned: { type: Number, required: true },
                                done: { type: Number, required: true },
                            },
                            tiredness: {
                                planned: { type: Number, required: true },
                                done: { type: Number, required: true },
                            },
                        },
                    ],
                },
            ],
        },
    ],
})

module.exports = mongoose.model('Assistant', AssistantSchema)
