/**
 * Config .env
 */
const dotenv = require('dotenv')
dotenv.config()

/**
 * Config mongo
 */
const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        console.log('Connection to Mongo DB done')
    } catch (err) {
        console.error(err.message)
        // Exit process with failure
        process.exit(1)
    }
}

module.exports = connectDB
