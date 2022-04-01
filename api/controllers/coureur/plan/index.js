//* MODULES *//
const utils = require('../utils/index')
const dayjs = require('dayjs')
const isoWeeksInYear = require('dayjs/plugin/isoWeeksInYear')
const isLeapYear = require('dayjs/plugin/isLeapYear')
const weekOfYear = require('dayjs/plugin/weekOfYear')
dayjs.extend(isoWeeksInYear)
dayjs.extend(isLeapYear)
dayjs.extend(weekOfYear)

//* MODELS *//
const DonneesUtilisateur = require('../../../../models/DonneesUtilisateur')
const calculPlan = require('../../../../utils/calculPlan')
const Objectif = require('../../../../models/Objectif')

exports.createPlan = async (req, res) => {
    try {
        const { objectifId } = req.body
        const objectif = await Objectif.findOne({ _id: objectifId })
        const donnesUtilisateur = await DonneesUtilisateur.findOne({
            _utilisateur: req.utilisateur._id,
        })

        const plan = await calculPlan(
            JSON.parse(JSON.stringify(objectif)).date_objectif,
            JSON.parse(JSON.stringify(objectif)).date_debut,
            donnesUtilisateur,
            false
        )
        
        return res
            .status(200)
            .json({ plan, message: 'Séances du nouveau plan générées' })
    } catch (error) {
        console.log('CreatePlan - catch error : ', error)
        return res.status(500).json({
            error: error.message,
            message: 'Une erreur est servenue, veuillez réessayer plus tard.',
        })
    }
}
