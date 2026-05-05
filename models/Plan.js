'use strict'

const prisma = require('../lib/prisma')

const Plan = {}

function toLegacy(row) {
    if (!row) return null
    return {
        _id: row.id,
        id: row.id,
        _utilisateur: row.utilisateurId,
        _donnees_utilisateur: row.donneesUtilisateurId,
        date_debut: row.dateDebut,
        date_fin: row.dateFin,
        SeancesDefinies: row.seancesDefinies,
    }
}

Plan.find = async function find(q) {
    const rows = await prisma.plan.findMany({
        where: {
            utilisateurId: String(q._utilisateur),
        },
    })
    return rows.map(toLegacy)
}

module.exports = Plan
