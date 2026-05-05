/**
 * Config .env
 */
const dotenv = require('dotenv')
dotenv.config()

const prisma = require('../lib/prisma')

const connectDB = async () => {
    try {
        await prisma.$connect()
        console.log('PostgreSQL connecté (Prisma)')
    } catch (err) {
        console.error(err.message)
        process.exit(1)
    }
}

const disconnectDB = async () => {
    await prisma.$disconnect()
}

module.exports = { connectDB, disconnectDB }
