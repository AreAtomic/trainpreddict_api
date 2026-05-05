const CourseModel = require('../../models/Course')

exports.updateOrganismeRace = async (model, structureId, adding) => {
    try {
        if (adding)
            await CourseModel.findOneAndUpdate(
                {
                    _organisme: structureId,
                    titre: model.titre,
                    date: date,
                },
                {
                    $set: {
                        type: model.type,
                        description: model.description,
                        denivele: model.denivele,
                        distance: model.distance,
                        temps: model.temps,
                        sse: model.sse,
                    },
                },
                {
                    new: true,
                    upsert: true,
                }
            )
        else
            await CourseModel.findOneAndDelete({
                _organisme: structureId,
                titre: model.titre,
                date: date,
            })

        return
    } catch (error) {
        throw error
    }
}
