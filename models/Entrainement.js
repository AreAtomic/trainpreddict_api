'use strict'

const prisma = require('../lib/prisma')

function toLegacy(row) {
    if (!row) return null
    return {
        ...row,
        _id: row.id,
        id: row.id,
        _utilisateur: row.utilisateurId,
        type_entrainement: row.typeEntrainement,
        fc_moy: row.fcMoy,
        fc_max: row.fcMax,
        cadence_moy: row.cadenceMoy,
        cadence_max: row.cadenceMax,
        power_moy: row.powerMoy,
        power_max: row.powerMax,
        normalized_power: row.normalizedPower,
        fc_seconds: row.fcSeconds,
        power_seconds: row.powerSeconds,
        cad_seconds: row.cadSeconds,
        n10_fc: row.n10Fc,
        n10_power: row.n10Power,
        n30_fc: row.n30Fc,
        n30_power: row.n30Power,
        zone_fc: row.zoneFc,
        power_zone: row.powerZone,
        intensite_travail: row.intensiteTravail,
        score_stress_entrainement: row.scoreStressEntrainement,
        point_carte: row.pointCarte,
        tableau_statistiques: row.tableauStatistiques,
    }
}

function toPrismaPayload(doc) {
    const d = doc
    const base = {
        utilisateurId: String(d._utilisateur),
        date: d.date,
        typeEntrainement: d.type_entrainement ?? [],
        type: d.type,
        duree: d.duree,
        distance: d.distance,
        deniv: Number(d.deniv ?? 0),
        fcMoy: d.fc_moy,
        fcMax: d.fc_max,
        cadenceMoy: d.cadence_moy,
        cadenceMax: d.cadence_max,
        powerMoy: d.power_moy,
        powerMax: d.power_max,
        normalizedPower: d.normalized_power,
        calories: d.calories,
        specifique: d.specifique ?? [],
        fcSeconds: d.fc_seconds ?? [],
        powerSeconds: d.power_seconds ?? [],
        cadSeconds: d.cad_seconds ?? [],
        n10Fc: d.n10_fc ?? [],
        n10Power: d.n10_power ?? [],
        n30Fc: d.n30_fc ?? [],
        n30Power: d.n30_power ?? [],
        description: d.description,
        zoneFc: d.zone_fc ?? [],
        powerZone: d.power_zone ?? [],
        Z1: d.Z1,
        Z2: d.Z2,
        Z3: d.Z3,
        Z4: d.Z4,
        Z5: d.Z5,
        Z6: d.Z6,
        Z7: d.Z7,
        intensiteTravail: Number(d.intensite_travail),
        scoreStressEntrainement: Number(d.score_stress_entrainement),
        ressentis: Number(d.ressentis ?? 0),
        pointCarte: d.point_carte ?? [],
        statistiques: d.statistiques ?? false,
        tableauStatistiques: d.tableau_statistiques ?? {},
    }
    return Object.fromEntries(
        Object.entries(base).filter(([, v]) => v !== undefined)
    )
}

function Entrainement(data) {
    if (!(this instanceof Entrainement)) return new Entrainement(data)
    Object.assign(this, data)
}

Entrainement.prototype.save = async function saveEnt() {
    const payload = toPrismaPayload(this)
    if (!this._id && !this.id) {
        const row = await prisma.entrainement.create({
            data: {
                ...payload,
                Z6: payload.Z6 ?? '0',
                Z7: payload.Z7 ?? '0',
            },
        })
        Object.assign(this, toLegacy(row))
        return this
    }
    const row = await prisma.entrainement.update({
        where: { id: String(this._id || this.id) },
        data: payload,
    })
    Object.assign(this, toLegacy(row))
    return this
}

Entrainement.find = async function find(q) {
    const w = {}
    if (q._utilisateur != null) w.utilisateurId = String(q._utilisateur)
    if (q.type != null) w.type = q.type
    const rows = await prisma.entrainement.findMany({ where: w })
    return rows.map(toLegacy)
}

Entrainement.findOne = async function findOne(q) {
    const w = {}
    if (q._id != null) w.id = String(q._id)
    if (q._utilisateur != null) w.utilisateurId = String(q._utilisateur)
    if (q.type != null) w.type = q.type
    const row = await prisma.entrainement.findFirst({ where: w })
    return toLegacy(row)
}

module.exports = Entrainement
