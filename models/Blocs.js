'use strict'

const prisma = require('../lib/prisma')

function toLegacy(row) {
    if (!row) return null
    return {
        ...row,
        _id: row.id,
        id: row.id,
        _creator: row.creatorId,
    }
}

function specifiqueEq(a, b) {
    return JSON.stringify(a) === JSON.stringify(b)
}

function Blocs(data) {
    if (!(this instanceof Blocs)) return new Blocs(data)
    Object.assign(this, data)
}

Blocs.prototype.save = async function saveBloc() {
    const row = await prisma.bloc.create({
        data: {
            specifique: this.specifique,
            certified: !!this.certified,
            creatorId: this._creator ? String(this._creator) : null,
        },
    })
    Object.assign(this, toLegacy(row))
    return this
}

Blocs.findOne = async function findOne(q) {
    if (q.specifique != null) {
        const rows = await prisma.bloc.findMany({})
        const row = rows.find((r) => specifiqueEq(r.specifique, q.specifique))
        return toLegacy(row)
    }
    const w = {}
    if (q.id != null || q._id != null) w.id = String(q.id || q._id)
    if (q._creator != null) w.creatorId = String(q._creator)
    const row = await prisma.bloc.findFirst({ where: w })
    return toLegacy(row)
}

Blocs.findOneAndUpdate = async function findOneAndUpdate(filter, update) {
    const id = String(filter.id || filter._id)
    const row = await prisma.bloc.update({
        where: { id },
        data: {
            specifique: update.specifique,
        },
    })
    return toLegacy(row)
}

Blocs.findOneAndDelete = async function findOneAndDelete(filter) {
    const id = String(filter.id || filter._id)
    try {
        const row = await prisma.bloc.delete({ where: { id } })
        return toLegacy(row)
    } catch {
        return null
    }
}

Blocs.find = async function find(q) {
    const w = {}
    if (q && q._creator != null) w.creatorId = String(q._creator)
    const rows = await prisma.bloc.findMany({ where: w })
    return rows.map(toLegacy)
}

module.exports = Blocs
