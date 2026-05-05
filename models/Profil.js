'use strict'

const prisma = require('../lib/prisma')
const { coerceFiniteInt, coerceFiniteNumber } = require('../lib/prismaCoerce')

function toLegacy(row) {
    if (!row) return null
    return {
        _id: row.id,
        id: row.id,
        _utilisateur: row.utilisateurId,
        fcfs: row.fcfs,
        pfs: row.pfs,
        age: row.age,
        poids: row.poids,
    }
}

function Profil(partial) {
    if (!(this instanceof Profil)) return new Profil(partial)
    Object.assign(this, partial)
}

Profil.prototype.save = async function saveProfil() {
    const uid = String(this._utilisateur || this.utilisateurId)
    if (!this._id && !this.id) {
        const row = await prisma.profil.create({
            data: {
                utilisateurId: uid,
                fcfs: coerceFiniteInt(this.fcfs) ?? 200,
                pfs: coerceFiniteInt(this.pfs) ?? 300,
                age: coerceFiniteInt(this.age) ?? 14,
                poids: coerceFiniteNumber(this.poids) ?? 75,
            },
        })
        Object.assign(this, toLegacy(row))
        return this
    }
    const data = {}
    if (this.fcfs !== undefined) {
        const v = coerceFiniteInt(this.fcfs)
        if (v !== undefined) data.fcfs = v
    }
    if (this.pfs !== undefined) {
        const v = coerceFiniteInt(this.pfs)
        if (v !== undefined) data.pfs = v
    }
    if (this.age !== undefined) {
        const v = coerceFiniteInt(this.age)
        if (v !== undefined) data.age = v
    }
    if (this.poids !== undefined) {
        const v = coerceFiniteNumber(this.poids)
        if (v !== undefined) data.poids = v
    }
    if (Object.keys(data).length === 0) {
        const existing = await prisma.profil.findUnique({
            where: { utilisateurId: uid },
        })
        Object.assign(this, toLegacy(existing))
        return this
    }
    const row = await prisma.profil.update({
        where: { utilisateurId: uid },
        data,
    })
    Object.assign(this, toLegacy(row))
    return this
}

Profil.findOne = async function findOne(q) {
    const uid = q._utilisateur != null ? String(q._utilisateur) : null
    const id = q._id != null ? String(q._id) : null
    const row = uid
        ? await prisma.profil.findUnique({ where: { utilisateurId: uid } })
        : id
          ? await prisma.profil.findUnique({ where: { id } })
          : null
    return toLegacy(row)
}

Profil.findOneAndUpdate = async function findOneAndUpdate(filter, update, opts) {
    const uid = String(filter._utilisateur)
    let row = await prisma.profil.findUnique({ where: { utilisateurId: uid } })
    const src = update.$set || update
    const data = {}
    if (src.fcfs !== undefined) {
        const v = coerceFiniteInt(src.fcfs)
        if (v !== undefined) data.fcfs = v
    }
    if (src.pfs !== undefined) {
        const v = coerceFiniteInt(src.pfs)
        if (v !== undefined) data.pfs = v
    }
    if (src.age !== undefined) {
        const v = coerceFiniteInt(src.age)
        if (v !== undefined) data.age = v
    }
    if (src.poids !== undefined) {
        const v = coerceFiniteNumber(src.poids)
        if (v !== undefined) data.poids = v
    }
    if (!row && opts?.upsert) {
        row = await prisma.profil.create({
            data: {
                utilisateurId: uid,
                fcfs: coerceFiniteInt(src.fcfs) ?? 200,
                pfs: coerceFiniteInt(src.pfs) ?? 300,
                age: coerceFiniteInt(src.age) ?? 14,
                poids: coerceFiniteNumber(src.poids) ?? 75,
            },
        })
    } else if (row) {
        const patch = Object.fromEntries(
            Object.entries(data).filter(([, v]) => v !== undefined)
        )
        row =
            Object.keys(patch).length === 0
                ? row
                : await prisma.profil.update({
                      where: { id: row.id },
                      data: patch,
                  })
    }
    return toLegacy(row)
}

module.exports = Profil
