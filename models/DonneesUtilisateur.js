'use strict'

const prisma = require('../lib/prisma')
const {
    coerceOptionalInt,
    coerceOptionalFloat,
    coerceFiniteNumber,
    coerceFiniteInt,
} = require('../lib/prismaCoerce')

function toLegacy(row) {
    if (!row) return null
    return {
        _id: row.id,
        id: row.id,
        _utilisateur: row.utilisateurId,
        experience: row.experience,
        heure_sommeil: row.heureSommeil,
        temps_recup_max: row.tempsRecupMax,
        sse: row.sse,
        nombre_heure_semaine: row.nombreHeureSemaine,
        nombre_seance_semaine: row.nombreSeanceSemaine,
        jours_repos: row.joursRepos,
        musculation: row.musculation,
        ppg: row.ppg,
        etirement: row.etirement,
        foncier: row.foncier,
        style: row.style,
        point_faible: row.pointFaible,
    }
}

function fromSet(src) {
    const o = {}
    if (src.experience !== undefined)
        o.experience = coerceOptionalInt(src.experience)
    if (src.heure_sommeil !== undefined)
        o.heureSommeil = coerceOptionalFloat(src.heure_sommeil)
    if (src.temps_recup_max !== undefined)
        o.tempsRecupMax = coerceOptionalFloat(src.temps_recup_max)
    if (src.sse !== undefined) {
        const v = coerceFiniteNumber(src.sse)
        if (v !== undefined) o.sse = v
    }
    if (src.nombre_heure_semaine !== undefined) {
        const v = coerceFiniteNumber(src.nombre_heure_semaine)
        if (v !== undefined) o.nombreHeureSemaine = v
    }
    if (src.nombre_seance_semaine !== undefined) {
        const v = coerceFiniteInt(src.nombre_seance_semaine)
        if (v !== undefined) o.nombreSeanceSemaine = v
    }
    if (src.jours_repos !== undefined) o.joursRepos = src.jours_repos
    if (src.musculation !== undefined) o.musculation = src.musculation
    if (src.ppg !== undefined) o.ppg = src.ppg
    if (src.etirement !== undefined) o.etirement = src.etirement
    if (src.foncier !== undefined) o.foncier = src.foncier
    if (src.style !== undefined) o.style = src.style
    if (src.point_faible !== undefined) o.pointFaible = src.point_faible
    return o
}

function DonneesUtilisateur() {}

DonneesUtilisateur.findOne = async function findOne(q) {
    const uid = String(q._utilisateur)
    const row = await prisma.donneesUtilisateur.findUnique({
        where: { utilisateurId: uid },
    })
    return toLegacy(row)
}

DonneesUtilisateur.findOneAndUpdate = async function findOneAndUpdate(
    filter,
    update,
    opts
) {
    const uid = String(filter._utilisateur)
    const src = update.$set || update
    const data = fromSet(src)
    let row = await prisma.donneesUtilisateur.findUnique({
        where: { utilisateurId: uid },
    })
    if (!row && opts?.upsert) {
        row = await prisma.donneesUtilisateur.create({
            data: {
                utilisateurId: uid,
                nombreHeureSemaine: data.nombreHeureSemaine ?? 0,
                nombreSeanceSemaine: data.nombreSeanceSemaine ?? 0,
                joursRepos: data.joursRepos ?? [],
                musculation: data.musculation ?? false,
                ppg: data.ppg ?? true,
                etirement: data.etirement ?? false,
                foncier: data.foncier ?? '',
                style: data.style ?? '',
                pointFaible: data.pointFaible ?? '',
                ...data,
            },
        })
    } else if (row) {
        row = await prisma.donneesUtilisateur.update({
            where: { id: row.id },
            data,
        })
    }
    return toLegacy(row)
}

module.exports = DonneesUtilisateur
