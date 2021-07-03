/**
 * @import Modules
 */
const express = require('express')
const router = express.Router()
const dayjs = require('dayjs')
const { check } = require('express-validator')
const { jwtauth } = require('../middlewares/auth.middleware')
/**
 * @import Models
 */
const Objectif = require('../models/Objectif')

/**
 * @route post api/objectif
 * @description Permet de créer un objectif pour l'utilisateur
 */
router.post(
    '/',
    [jwtauth],
    [
        check('date_objectif', "Date de l'objectif requise").exists(),
        check(
            'date_debut',
            "La date de début de l'entrainment est requise"
        ).exists(),
        check('type', 'Le type est requis').exists(),
        check('resultat_vise', 'Le résultat visé est requis').exists(),
        check('titre', 'Le titre est requis').exists(),
    ],
    async (req, res) => {
        try {
            console.log(req.body)
            const utilisateur = req.utilisateur._id

            const {
                date_objectif,
                date_debut,
                type,
                resultat_vise,
                titre,
                description,
                distance,
                temps,
                denivele,
            } = req.body

            const objectifInfo = {
                _utilisateur: utilisateur,
                date_debut: dayjs(date_debut).toISOString(),
                date_objectif: dayjs(date_objectif).toISOString(),
                type: type,
                resultat_vise: resultat_vise,
                titre: titre,
                description: description.toString(),
                distance: distance,
                denivele: denivele,
                temps: temps,
                realise: false,
            }

            let objectif = await Objectif.find({
                _utilisateur: utilisateur,
            })

            for (let i = 0; i < objectif.length; i++) {
                if (dayjs(date_debut).isBefore(objectif[i].date_objectif)) {
                    return res.status(200).json({
                        error:
                            "Impossible de créer un objectif pour lequel tu commences à t'entrainer avant la fin d'un autre objectif",
                    })
                }
            }

            var date_d = new Date(date_debut)
            var date_o = new Date(date_objectif)
            console.log(date_d.getMonth(), date_o.getMonth())
            if (date_o.getMonth() - date_d.getMonth() < 3) {
                return res.status(200).json({
                    error:
                        "Il doit y a avoir au moins 3 mois d'écart entre le début de l'entrainement et la réalisation de l'objectif",
                })
            }

            objectif = new Objectif(objectifInfo)
            objectif.save()

            console.log(objectif)

            return res
                .status(200)
                .json({ data: objectif, msg: 'Objectif créé' })
        } catch (err) {
            return res.status(400).json({ error: err.message })
        }
    }
)

/**
 * @route PUT api/objectif
 * @description permet de mettre à jour les objectifs de l'utilisateur et de les retourner
 */
router.put(
    '/',
    [jwtauth],
    [
        check('date_objectif', "Date de l'objectif requise").exists(),
        check(
            'date_debut',
            "La date de début de l'entrainment est requise"
        ).exists(),
        check('type', 'Le type est requis').exists(),
        check('resultat_vise', 'Le résultat visé est requis').exists(),
        check('titre', 'Le titre est requis').exists(),
    ],
    async (req, res) => {
        try {
            const utilisateur = req.utilisateur._id

            const {
                date_objectif,
                date_debut,
                type,
                resultat_vise,
                titre,
                description,
                distance,
                temps,
                denivele,
            } = req.body

            var realise = false
            if (dayjs().isAfter(dayjs(date_objectif))) {
                realise = true
            }

            const objectifInfo = {
                date_debut: dayjs(date_debut).toISOString(),
                type: type,
                resultat_vise: resultat_vise,
                titre: titre,
                description: description,
                distance: distance,
                denivele: denivele,
                temps: temps,
                realise: realise,
            }

            let objectif = await Objectif.findOneAndUpdate(
                {
                    _utilisateur: utilisateur,
                    date_objectif: dayjs(date_objectif).toISOString(),
                },
                { $set: objectifInfo },
                { new: true, upsert: true }
            )
            return res
                .status(200)
                .json({ data: objectif, msg: 'Objectif mis à jour' })
        } catch (err) {
            res.status(500).json({ error: err.message })
        }
    }
)

/**
 * @route get api/objectif
 * @description permet de récupérer les objectifs
 */
router.get('/', [jwtauth], async (req, res) => {
    const utilisateur = req.utilisateur._id
    try {
        var objectif = await Objectif.find({ _utilisateur: utilisateur })
        if (objectif.length > 1) {
            objectif = sort(objectif)
        }

        return res.status(200).json({ data: objectif })
    } catch (e) {
        return res.status(200).send({ data: null })
    }
})

/**
 * @route post api/:objectif/
 * @description Supprimer l'objectif
 */
router.delete('/:objectifId', [jwtauth], async (req, res) => {
    const id = req.params.objectifId
    try {
        const objectif = await Objectif.findOneAndDelete({ _id: id })

        return res
            .status(200)
            .json({ msg: `Objectif ${objectif.titre} supprimé` })
    } catch (err) {
        return res.status(200).send({ error: err.message })
    }
})
/**
 * @route PUT api/update/objectif
 * @description Mise à jour d'un objectif
 */
router.put('/:objectifId', [jwtauth], async (req, res) => {
    try {
        const id = req.params.objectifId
        const {
            date_objectif,
            resultat_vise,
            titre,
            description,
            distance,
            temps,
            denivele,
            type,
        } = req.body

        var realise = false

        if (dayjs().isAfter(dayjs(date_objectif))) {
            realise = true
        }

        const objectifInfo = {
            type: type,
            resultat_vise: resultat_vise,
            titre: titre,
            description: description,
            distance: distance,
            denivele: denivele,
            temps: temps,
            realise: realise,
        }
        var objectif = await Objectif.findOneAndUpdate(
            { _id: id },
            { $set: objectifInfo },
            { new: true, upsert: true }
        )

        return res
            .status(200)
            .json({ data: objectif, msg: 'Objectif mis à jour' })
    } catch (e) {
        console.log(e)
        return res
            .status(200)
            .json({ error: 'Erreur de traitement des données' })
    }
})

module.exports = router

// Tri bulle
function sort(tab) {
    var changed
    do {
        changed = false
        for (var i = 0; i < tab.length - 1; i++) {
            if (
                dayjs(tab[i].date_objectif).isBefore(
                    dayjs(tab[i + 1].date_objectif)
                )
            ) {
                var tmp = tab[i]
                tab[i] = tab[i + 1]
                tab[i + 1] = tmp
                changed = true
            }
        }
    } while (changed)
    return tab
}
