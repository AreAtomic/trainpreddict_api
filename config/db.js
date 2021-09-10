/**
 * Config .env
 */
const dotenv = require('dotenv')
dotenv.config()

/**
 * Config mongo
 */
const mongoose = require('mongoose')
const config = require('config')
const db = "mongodb+srv://aure:aure@betacluster-9gwek.mongodb.net/save?retryWrites=true&w=majority"

const connectDB = async () => {
    try {
        await mongoose.connect(db, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true,
        })

        console.log('MongoDB Connected...')
    } catch (err) {
        console.error(err.message)
        // Exit process with failure
        process.exit(1)
    }
}

module.exports = connectDB
