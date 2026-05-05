'use strict'

const path = require('path')
const dotenv = require('dotenv')

const root = path.join(__dirname, '..')
dotenv.config({ path: path.join(root, '.env') })
dotenv.config({ path: path.join(root, '.env.local'), override: true })

/**
 * Prisma Accelerate caps query responses at ~5MB. Assistant.embeddedYears can be
 * much larger. Use a plain postgres:// URL (same DB) via DIRECT_DATABASE_URL or
 * Prisma's usual DIRECT_URL so Assistant reads/writes bypass Accelerate.
 */
const { PrismaClient } = require('@prisma/client')
const mainPrisma = require('./prisma')

let directInstance = null
let warnedAccelerateFallback = false

function isAccelerateUrl(s) {
    const u = String(s || '').trim()
    return u.startsWith('prisma+') || u.startsWith('prisma:')
}

function resolveDirectPostgresUrl() {
    const candidates = [
        process.env.DIRECT_DATABASE_URL,
        process.env.DIRECT_URL,
    ]
    for (const raw of candidates) {
        const u = raw && String(raw).trim()
        if (!u || isAccelerateUrl(u)) continue
        if (u.startsWith('postgres://') || u.startsWith('postgresql://')) return u
    }
    return ''
}

function getPrismaForAssistant() {
    const url = resolveDirectPostgresUrl()
    if (!url) {
        const main = process.env.DATABASE_URL
        if (
            main &&
            isAccelerateUrl(main) &&
            !warnedAccelerateFallback
        ) {
            warnedAccelerateFallback = true
            console.warn(
                '[Assistant] Pas d’URL Postgres directe (DIRECT_DATABASE_URL ou DIRECT_URL). ' +
                    'Les gros calendriers (>~5 Mo) feront échouer Accelerate. ' +
                    'Ajoutez une connexion postgresql://… vers la même base.'
            )
        }
        return mainPrisma
    }
    if (!directInstance) {
        directInstance = new PrismaClient({
            datasources: {
                db: { url },
            },
        })
    }
    return directInstance
}

module.exports = { getPrismaForAssistant }
