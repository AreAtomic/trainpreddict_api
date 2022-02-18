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
app.use(cors())
//Database
connectDB()

/**
 * Routeur
 */
app.use('/api/v1', require('./api'))
