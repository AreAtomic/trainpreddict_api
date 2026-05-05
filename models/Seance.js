'use strict'

const prisma = require('../lib/prisma')

function toLegacy(row) {
    if (!row) return null
    return {
        ...row,
        _id: row.id,
        id: row.id,
        _utilisateur: row.utilisateurId,
        estimation_distance: row.estimationDistance,
        estimation_deniv: row.estimationDeniv,
        puissance_moyenne: row.puissanceMoyenne,
        charge_entrainement_estime: row.chargeEntrainementEstime,
        intensite_travail: row.intensiteTravail,
        score_stress_entrainement: row.scoreStressEntrainement,
        specifique_description: row.descripiqueDescription,
    }
}

function matchesTypeField(typeVal, cond) {
    if (cond == null) return true
    if (typeof cond === 'string') {
        if (Array.isArray(typeVal)) return typeVal.includes(cond)
        return String(typeVal) === cond
    }
    if (cond.$in) {
        const arr = Array.isArray(cond.$in) ? cond.$in : [cond.$in]
        if (Array.isArray(typeVal)) return arr.some((t) => typeVal.includes(t))
        return arr.includes(typeVal)
    }
    return true
}

function buildWhere(q) {
    const w = {}
    if (!q) return w
    if (q._id != null) w.id = String(q._id)
    if (q.titre != null) w.titre = q.titre
    if (q._utilisateur != null) w.utilisateurId = String(q._utilisateur)
    if (q.public === false) w.public = false
    if (q.public && q.public.$ne === false) w.public = true
    return w
}

function Seance(data) {
    if (!(this instanceof Seance)) return new Seance(data)
    Object.assign(this, data)
}

Seance.prototype.save = async function saveSeance() {
    const payload = {
        utilisateurId: this._utilisateur
            ? String(this._utilisateur)
            : null,
        type: this.type ?? [],
        titre: this.titre,
        duree: this.duree,
        estimationDistance: Number(this.estimation_distance),
        estimationDeniv: Number(this.estimation_deniv),
        specifique: this.specifique ?? [],
        description: this.description,
        descripiqueDescription: this.specifique_description,
        Z1: this.Z1,
        Z2: this.Z2,
        Z3: this.Z3,
        Z4: this.Z4,
        Z5: this.Z5,
        Z6: this.Z6 ?? '0',
        Z7: this.Z7 ?? '0',
        puissanceMoyenne: Number(this.puissance_moyenne),
        chargeEntrainementEstime: Number(this.charge_entrainement_estime),
        intensiteTravail: Number(this.intensite_travail),
        scoreStressEntrainement: Number(this.score_stress_entrainement),
        public: this.public !== false,
    }
    if (!this._id && !this.id) {
        const row = await prisma.seance.create({ data: payload })
        Object.assign(this, toLegacy(row))
        return this
    }
    const row = await prisma.seance.update({
        where: { id: String(this._id || this.id) },
        data: payload,
    })
    Object.assign(this, toLegacy(row))
    return this
}

Seance.findOne = async function findOne(q) {
    const w = buildWhere(q)
    const row = await prisma.seance.findFirst({ where: w })
    return toLegacy(row)
}

Seance.find = async function find(q) {
    const base = buildWhere(q)
    let rows = await prisma.seance.findMany({ where: base })
    if (q && q.type != null) {
        rows = rows.filter((r) => matchesTypeField(r.type, q.type))
    }
    return rows.map(toLegacy)
}

Seance.findOneAndUpdate = async function findOneAndUpdate(filter, update) {
    const w = buildWhere(filter)
    const row = await prisma.seance.findFirst({ where: w })
    if (!row) return null
    const s = update.$set || update
    const data = {
        titre: s.titre,
        type: s.type,
        duree: s.duree,
        estimationDistance: s.estimation_distance,
        estimationDeniv: s.estimation_deniv,
        specifique: s.specifique,
        description: s.description,
        Z1: s.Z1,
        Z2: s.Z2,
        Z3: s.Z3,
        Z4: s.Z4,
        Z5: s.Z5,
        Z6: s.Z6,
        Z7: s.Z7,
        puissanceMoyenne: s.puissance_moyenne,
        chargeEntrainementEstime: s.charge_entrainement_estime,
        intensiteTravail: s.intensite_travail,
        scoreStressEntrainement: s.score_stress_entrainement,
        public: s.public,
    }
    const clean = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined)
    )
    const updated = await prisma.seance.update({
        where: { id: row.id },
        data: clean,
    })
    return toLegacy(updated)
}

module.exports = Seance
