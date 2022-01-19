const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')
const fileUpload = require('express-fileupload')
const dotenv = require('dotenv')

/**
 * Config serveur
 */
dotenv.config()
//Serveur
const app = express()
app.listen(process.env.PORT, () => {
    console.log(`API is running on ${process.env.SERVER_URL}`)
})
app.use(express.json({ extended: false }))
// CORS
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true)
            if (process.env.WHITELIST.indexOf(origin) === -1) {
                let message =
                    "The CORS policy for this origin doesn't " +
                    'allow access from the particular origin.'
                return callback(new Error(message), false)
            }
            return callback(null, true)
        },
    })
)
//Database
connectDB()

/**
 * Routeur
 */
app.use('/api/v1', require('./api'))
