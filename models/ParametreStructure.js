'use strict'

const prisma = require('../lib/prisma')

const ParametreStructure = {}

function toLegacy(row) {
    if (!row) return null
    return {
        _id: row.id,
        id: row.id,
        _structure: row.structureId,
        coureur: { courbes: row.coureurCourbes },
        seance: { partage: row.seancePartage, own: row.seanceOwn },
    }
}

ParametreStructure.findOne = async function findOne(q) {
    const sid = String(q._structure)
    const row = await prisma.parametreStructure.findUnique({
        where: { structureId: sid },
    })
    return toLegacy(row)
}

ParametreStructure.create = async function create(doc) {
    const sid = String(doc._structure)
    const row = await prisma.parametreStructure.create({
        data: {
            structureId: sid,
            coureurCourbes: false,
            seancePartage: true,
            seanceOwn: true,
        },
    })
    return toLegacy(row)
}

ParametreStructure.findOneAndUpdate = async function findOneAndUpdate(
    filter,
    update,
    opts
) {
    const sid = String(filter._structure)
    const src = update.$set || update
    const data = {}
    if (src.coureur && src.coureur.courbes != null) {
        data.coureurCourbes = src.coureur.courbes
    }
    if (src.seance) {
        if (src.seance.partage != null) data.seancePartage = src.seance.partage
        if (src.seance.own != null) data.seanceOwn = src.seance.own
    }
    let row = await prisma.parametreStructure.findUnique({
        where: { structureId: sid },
    })
    if (!row && opts?.upsert) {
        row = await prisma.parametreStructure.create({
            data: {
                structureId: sid,
                coureurCourbes: data.coureurCourbes ?? false,
                seancePartage: data.seancePartage ?? true,
                seanceOwn: data.seanceOwn ?? true,
            },
        })
    } else if (row) {
        row = await prisma.parametreStructure.update({
            where: { id: row.id },
            data,
        })
    }
    return toLegacy(row)
}

module.exports = ParametreStructure
