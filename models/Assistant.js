'use strict'

const { getPrismaForAssistant } = require('../lib/prismaDirect')
const prisma = getPrismaForAssistant()
const {
    clone,
    sameYear,
    matchesDocumentFilter,
    applySetOnYears,
} = require('../lib/assistantEmbeddedPatch')

function toLegacy(row) {
    if (!row) return null
    const userId = row.utilisateurId
    const years = clone(row.embeddedYears || [])
    return {
        _id: row.id,
        id: row.id,
        _utilisateur: userId,
        years,
        save: async function persistAssistant() {
            await prisma.assistant.update({
                where: { utilisateurId: userId },
                data: { embeddedYears: this.years },
            })
        },
    }
}

async function findOne(filter, projection) {
    if (!filter || filter._utilisateur == null) return null
    const userId = String(filter._utilisateur)
    const row = await prisma.assistant.findUnique({
        where: { utilisateurId: userId },
        select: { id: true, utilisateurId: true, embeddedYears: true },
    })
    if (!row) return null
    const base = toLegacy(row)
    if (projection && projection.years && projection.years.$elemMatch) {
        const yv = projection.years.$elemMatch.year
        base.years = base.years.filter((y) => sameYear(y.year, yv))
    }
    return base
}

async function findOneAndUpdate(filter, update, options = {}) {
    const userId = String(filter._utilisateur)
    let row = await prisma.assistant.findUnique({
        where: { utilisateurId: userId },
        select: { utilisateurId: true, embeddedYears: true },
    })
    let years = row?.embeddedYears ? clone(row.embeddedYears) : []

    if (!matchesDocumentFilter(filter, userId, years)) {
        if (!options.upsert) return null
    }

    if (update && update.$set) {
        years = applySetOnYears(years, update.$set, options.arrayFilters || [])
    }

    if (!row) {
        if (!options.upsert) return null
        row = await prisma.assistant.create({
            data: {
                utilisateurId: userId,
                embeddedYears: years,
            },
        })
    } else {
        row = await prisma.assistant.update({
            where: { utilisateurId: userId },
            data: { embeddedYears: years },
        })
    }

    return toLegacy(row)
}

/**
 * Plusieurs patchs $set pour le même coureur en un seul find + update
 * (évite N lectures du JSON embeddedYears côté plan).
 */
async function updateManyEmbeddedPatches(filter, patches, options = {}) {
    if (!patches || !patches.length) {
        return { matchedCount: 0, modifiedCount: 0 }
    }
    const userId = String(filter._utilisateur)
    const row = await prisma.assistant.findUnique({
        where: { utilisateurId: userId },
        select: { utilisateurId: true, embeddedYears: true },
    })
    if (!row) {
        if (options.upsert) {
            let years = []
            for (const p of patches) {
                const u = p.update
                const af = p.options && p.options.arrayFilters
                if (u && u.$set) {
                    years = applySetOnYears(years, u.$set, af || [])
                }
            }
            await prisma.assistant.create({
                data: {
                    utilisateurId: userId,
                    embeddedYears: years,
                },
            })
            return { matchedCount: 1, modifiedCount: 1 }
        }
        return { matchedCount: 0, modifiedCount: 0 }
    }

    let years = row.embeddedYears ? clone(row.embeddedYears) : []
    if (!matchesDocumentFilter(filter, userId, years)) {
        return { matchedCount: 0, modifiedCount: 0 }
    }

    for (const p of patches) {
        const u = p.update
        const af = p.options && p.options.arrayFilters
        if (u && u.$set) {
            years = applySetOnYears(years, u.$set, af || [])
        }
    }

    await prisma.assistant.update({
        where: { utilisateurId: userId },
        data: { embeddedYears: years },
    })
    return { matchedCount: 1, modifiedCount: 1 }
}

async function updateOne(filter, update, options = {}) {
    const userId = String(filter._utilisateur)
    const row = await prisma.assistant.findUnique({
        where: { utilisateurId: userId },
        select: { utilisateurId: true, embeddedYears: true },
    })
    if (!row) {
        if (options.upsert) {
            await findOneAndUpdate(filter, update, {
                ...options,
                upsert: true,
                new: true,
            })
            return { matchedCount: 1, modifiedCount: 1 }
        }
        return { matchedCount: 0, modifiedCount: 0 }
    }

    let years = row.embeddedYears ? clone(row.embeddedYears) : []
    if (!matchesDocumentFilter(filter, userId, years)) {
        return { matchedCount: 0, modifiedCount: 0 }
    }

    if (update && update.$set) {
        years = applySetOnYears(
            years,
            update.$set,
            options.arrayFilters || []
        )
    }

    await prisma.assistant.update({
        where: { utilisateurId: userId },
        data: { embeddedYears: years },
    })
    return { matchedCount: 1, modifiedCount: 1 }
}

module.exports = {
    findOne,
    findOneAndUpdate,
    updateOne,
    updateManyEmbeddedPatches,
}
