//* MODULES *//

//* MODELS *//
const Blocs = require('../../../../models/Blocs')

/**
 * @route POST api/seance/blocs
 * @description Permet de créer un bloc d'entrainement
 */
exports.createBloc = async (req, res) => {
    try {
        let bloc = await Blocs.findOne({ specifique: req.body.specifique })

        if (bloc) {
            return res.status(400).json({ error: 'Le bloc existe déjà' })
        }

        if (req.utilisateur._id === '5fb64aeb462e0df71872c3e1') {
            bloc = new Blocs({
                specifique: req.body.specifique,
                certified: true,
                _creator: req.utilisateur._id,
            })
        } else {
            bloc = new Blocs({
                specifique: req.body.specifique,
                _creator: req.utilisateur._id,
            })
        }

        bloc.save()

        return res
            .status(200)
            .json({ data: bloc, msg: 'Bloc créé avec succès.' })
    } catch (e) {
        res.status(400).json({ error: 'Une erreur est survenue', e })
    }
}

/**
 * @route PUT api/seance/blocs
 * @description Permet de modifier un bloc d'entrainement
 */
exports.putBloc = async (req, res) => {
    try {
        let bloc = await Blocs.findOneAndUpdate(
            { id: req.params.id },
            { specifique: req.body.specifique },
            { upsert: true }
        )

        return res
            .status(200)
            .json({ data: bloc, msg: 'Bloc modififé avec succès.' })
    } catch (e) {
        res.status(400).json({ error: 'Une erreur est survenue', e })
    }
}

/**
 * @route DELETE api/seance/blocs
 * @description Permet de supprimer un bloc d'entrainement
 */
exports.deleteBloc = async (req, res) => {
    try {
        let bloc = await Blocs.findOneAndDelete({ id: req.params.id })

        return res
            .status(200)
            .json({ data: bloc, msg: 'Bloc supprimé avec succès.' })
    } catch (e) {
        res.status(400).json({ error: 'Une erreur est survenue', e })
    }
}

/**
 * @route GET api/seance/blocs
 * @description Permet de récupérer les blocs d'entrainement
 */
exports.getAllBlocs = async (req, res) => {
    try {
        let blocs = await Blocs.find({})

        return res
            .status(200)
            .json({ data: blocs, msg: 'Bloc récupéré avec succès.' })
    } catch (e) {
        res.status(400).json({ error: 'Une erreur est survenue', e })
    }
}

/**
 * @route GET api/seance/blocs
 * @description Permet de récupérer les blocs d'entrainement
 */
exports.getUserBlocs = async (req, res) => {
    try {
        let blocs = await Blocs.find({ _creator: req.utilisateur._id })

        return res
            .status(200)
            .json({ data: blocs, msg: 'Bloc récupéré avec succès.' })
    } catch (e) {
        res.status(400).json({ error: 'Une erreur est survenue', e })
    }
}
