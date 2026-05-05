'use strict'

const prisma = require('../lib/prisma')

const Course = {}

function toLegacy(row) {
    if (!row) return null
    return {
        ...row,
        _id: row.id,
        id: row.id,
        _utilisateur: row.utilisateurId,
        _organisme: row.organismeId,
    }
}

function buildWhere(q) {
    const w = {}
    if (!q) return w
    if (q._id != null) w.id = String(q._id)
    if (q._utilisateur != null) w.utilisateurId = String(q._utilisateur)
    if (q._organisme != null) w.organismeId = String(q._organisme)
    if (q.titre != null) w.titre = q.titre
    if (q.date != null) w.date = q.date
    return w
}

Course.find = async function find(q) {
    const rows = await prisma.course.findMany({ where: buildWhere(q) })
    return rows.map(toLegacy)
}

Course.findOne = async function findOne(q) {
    const row = await prisma.course.findFirst({ where: buildWhere(q) })
    return toLegacy(row)
}

Course.findOneAndUpdate = async function findOneAndUpdate(
    filter,
    update,
    opts
) {
    const w = buildWhere(filter)
    const row = await prisma.course.findFirst({ where: w })
    const s = update.$set || update
    const data = {
        type: s.type,
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
        const created = await prisma.course.create({
            data: {
                utilisateurId: filter._utilisateur
                    ? String(filter._utilisateur)
                    : null,
                organismeId: filter._organisme
                    ? String(filter._organisme)
                    : null,
                date: filter.date || s.date,
                type: s.type || 'Cyclosportive',
                titre: filter.titre || s.titre,
                description: s.description ?? '...',
                denivele: s.denivele ?? '0',
                distance: Number(s.distance ?? 0),
                temps: s.temps ?? '00:00:00',
                sse: Number(s.sse ?? 200),
                course: true,
            },
        })
        return toLegacy(created)
    }
    const updated = await prisma.course.update({
        where: { id: row.id },
        data: clean,
    })
    return toLegacy(updated)
}

Course.findOneAndDelete = async function findOneAndDelete(filter) {
    const w = buildWhere(filter)
    const row = await prisma.course.findFirst({ where: w })
    if (!row) return null
    await prisma.course.delete({ where: { id: row.id } })
    return toLegacy(row)
}

module.exports = Course
