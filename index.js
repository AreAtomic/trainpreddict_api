const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')
const fileUpload = require('express-fileupload')
const dotenv = require('dotenv')

/**
 * Config serveur
 */
dotenv.config()
let corsOptions = {
    origin: process.env.APP_URL,
    optionsSuccessStatus: 204
  }
//Serveur
const app = express()
app.listen(process.env.PORT, () => {
    console.log(`API is running on ${process.env.SERVER_URL}`)
})
app.use(express.json({ extended: false }))
app.use(fileUpload())
console.log(cors(corsOptions))
app.use(cors(corsOptions))
//Database 
connectDB()

/**
 * Routeur
 */
app.use('/api/v1', require('./api'))
