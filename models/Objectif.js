'use strict'

const prisma = require('../lib/prisma')

function toLegacy(row) {
    if (!row) return null
    return {
        ...row,
        _id: row.id,
        id: row.id,
        _utilisateur: row.utilisateurId,
        resultat_vise: row.resultatVise,
    }
}

function buildWhere(q) {
    const w = {}
    if (!q) return w
    if (q._id != null) w.id = String(q._id)
    if (q._utilisateur != null) w.utilisateurId = String(q._utilisateur)
    if (q.date != null) w.date = q.date
    return w
}

function attachSave(legacy) {
    if (!legacy) return null
    const id = String(legacy._id || legacy.id)
    legacy.save = async function saveObj() {
        const row = await prisma.objectif.update({
            where: { id },
            data: {
                type: this.type,
                resultatVise: this.resultat_vise,
                titre: this.titre,
                description: this.description,
                denivele: this.denivele,
                distance: this.distance,
                temps: this.temps,
                sse: this.sse,
                date: this.date,
                realise: this.realise,
            },
        })
        Object.assign(this, toLegacy(row))
        return this
    }
    return legacy
}

function makeFindQuery(filter) {
    const self = {
        _filter: filter,
        _sort: null,
        sort(spec) {
            self._sort = spec
            return self
        },
        then(onFulfilled, onRejected) {
            return self.exec().then(onFulfilled, onRejected)
        },
        async exec() {
            const orderBy = self._sort
                ? {
                      date:
                          self._sort.date === 1 || self._sort.date === 'asc'
                              ? 'asc'
                              : 'desc',
                  }
                : undefined
            const rows = await prisma.objectif.findMany({
                where: buildWhere(self._filter),
                orderBy,
            })
            return rows.map(toLegacy)
        },
    }
    return self
}

const Objectif = {}

Objectif.find = function find(filter) {
    return makeFindQuery(filter)
}

Objectif.findOne = async function findOne(q) {
    if (q._utilisateur && !q._id && !q.date) {
        const row = await prisma.objectif.findFirst({
            where: { utilisateurId: String(q._utilisateur) },
            orderBy: { date: 'asc' },
        })
        return attachSave(toLegacy(row))
    }
    const row = await prisma.objectif.findFirst({ where: buildWhere(q) })
    return attachSave(toLegacy(row))
}

Objectif.findOneAndUpdate = async function findOneAndUpdate(
    filter,
    update,
    opts
) {
    const w = buildWhere(filter)
    let row = await prisma.objectif.findFirst({ where: w })
    const s = update.$set || update
    const data = {
        type: s.type,
        resultatVise: s.resultat_vise,
        titre: s.titre,
        description: s.description,
        denivele: s.denivele,
        distance: s.distance,
        temps: s.temps,
        sse: s.sse,
        date: s.date,
    }
    const clean = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined)
    )
    if (!row) {
        if (!opts?.upsert) return null
        row = await prisma.objectif.create({
            data: {
                utilisateurId: String(filter._utilisateur),
                date: filter.date,
                type: s.type || 'Vallon',
                resultatVise: s.resultat_vise ?? 'Victoire',
                titre: s.titre ?? '',
                description: s.description,
                denivele: s.denivele ?? '0',
                distance: Number(s.distance ?? 0),
                temps: s.temps ?? '00:00:00',
                sse: Number(s.sse ?? 200),
                realise: s.realise ?? false,
            },
        })
    } else {
        row = await prisma.objectif.update({
            where: { id: row.id },
            data: clean,
        })
    }
    return toLegacy(row)
}

Objectif.findOneAndDelete = async function findOneAndDelete(filter) {
    const w = buildWhere(filter)
    const row = await prisma.objectif.findFirst({ where: w })
    if (!row) return null
    await prisma.objectif.delete({ where: { id: row.id } })
    return toLegacy(row)
}

module.exports = Objectif
