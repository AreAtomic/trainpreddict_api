require('dotenv').config()

const legacy = process.env.DATABASE
if (
    !process.env.DATABASE_URL &&
    legacy &&
    (legacy.startsWith('postgresql://') || legacy.startsWith('postgres://'))
) {
    process.env.DATABASE_URL = legacy
}

if (!process.env.DATABASE_URL) {
    console.error(
        '[Prisma] DATABASE_URL manquant dans back-end/.env. Exemple : postgresql://USER:PASSWORD@localhost:5432/NOM_BASE'
    )
    process.exit(1)
}

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

module.exports = prisma
