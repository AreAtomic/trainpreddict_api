'use strict'

/**
 * Normalise les valeurs issues du JSON / formulaires avant envoi à Prisma.
 * Tous les champs Prisma `Int` / `Int?` passant par les modèles legacy doivent
 * utiliser ces helpers pour éviter String → erreur client Prisma.
 */

function coerceOptionalInt(value) {
    if (value === undefined) return undefined
    if (value === null || value === '') return null
    if (typeof value === 'number' && Number.isFinite(value))
        return Math.trunc(value)
    const n = parseInt(String(value).trim(), 10)
    return Number.isFinite(n) ? n : null
}

function coerceFiniteInt(value) {
    if (value === undefined) return undefined
    if (value === null || value === '') return undefined
    if (typeof value === 'number' && Number.isFinite(value))
        return Math.trunc(value)
    const n = parseInt(String(value).trim(), 10)
    return Number.isFinite(n) ? n : undefined
}

function coerceOptionalFloat(value) {
    if (value === undefined) return undefined
    if (value === null || value === '') return null
    if (typeof value === 'number' && Number.isFinite(value)) return value
    const n = parseFloat(String(value).trim())
    return Number.isFinite(n) ? n : null
}

/** Float requis ou update partiel : ignorer si non parseable. */
function coerceFiniteNumber(value) {
    if (value === undefined) return undefined
    if (value === null || value === '') return undefined
    if (typeof value === 'number' && Number.isFinite(value)) return value
    const n = parseFloat(String(value).trim())
    return Number.isFinite(n) ? n : undefined
}

module.exports = {
    coerceOptionalInt,
    coerceFiniteInt,
    coerceOptionalFloat,
    coerceFiniteNumber,
}
