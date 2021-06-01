const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')
const fileUpload = require('express-fileupload')
const favicon = require('express-favicon')
const path = require('path')
const http = require('http')
const https = require('https')
const fs = require('fs')
const dotenv = require('dotenv')

/*
 * Connexion Database *
 */
connectDB()

/**
 * dotenv config
 */
dotenv.config()

/*
 * Setting express *
 */
var whitelist = [
    'http://localhost:5000',
    'http://localhost:3000',
    'https://localhost:3000',
    'http://localhost',
    'http://trainpreddict.fr',
    'https://trainpreddict.fr',
]

var corsOptionsDelegate = function (req, callback) {
    var corsOptions
    if (whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
    } else {
        corsOptions = { origin: false } // disable CORS for this request
    }
    callback(null, corsOptions) // callback expects two parameters: error and options
}

const app = express()
app.use(express.json({ extended: false }))
app.use(fileUpload())

// Production mode
if (process.env.NODE_ENV != 'development') {
    app.use(function (req, res, next) {
        res.header('Access-Control-Allow-Origin', 'trainpreddict.fr')
        res.header(
            'Access-Control-Headers',
            'Origin, X-Requested-With, Content-Type, Accept'
        )
        next()
    })
    // Certificats
    const privateKey = fs.readFileSync(
        '/etc/letsencrypt/live/trainpreddict.fr/privkey.pem'
    )
    const certificate = fs.readFileSync(
        '/etc/letsencrypt/live/trainpreddict.fr/cert.pem'
    )
    const ca = fs.readFileSync(
        '/etc/letsencrypt/live/trainpreddict.fr/chain.pem'
    )

    const credentials = {
        key: privateKey,
        cert: certificate,
        ca: ca,
    }

    const httpServer = http.createServer((req, res) => {
        res.writeHead(301, {
            Location: `https://${req.headers.host}${req.url}`,
        })
        res.end()
    })
    const httpsServer = https.createServer(credentials, app).listen(5000)
}

/*
 * ROUTER *
 */
app.get('/', function (req, res) {
    res.send('Running')
})

app.use(
    '/api/utilisateur',
    cors(corsOptionsDelegate),
    require('./routes/utilisateur')
)
app.use('/api/auth', cors(corsOptionsDelegate), require('./routes/auth'))
app.use('/api/profil', cors(corsOptionsDelegate), require('./routes/profil'))
app.use(
    '/api/objectif',
    cors(corsOptionsDelegate),
    require('./routes/objectif')
)
app.use('/api/plan', cors(corsOptionsDelegate), require('./routes/plan'))
app.use('/api/courbes', cors(corsOptionsDelegate), require('./routes/courbes'))
app.use(
    '/api/donneesUtilisateur',
    cors(corsOptionsDelegate),
    require('./routes/donneesUtilisateur')
)
app.use('/api/seance', cors(corsOptionsDelegate), require('./routes/seances'))
app.use(
    '/api/entrainement',
    cors(corsOptionsDelegate),
    require('./routes/entrainement')
)
app.use(
    '/api/statistiques',
    cors(corsOptionsDelegate),
    require('./routes/statistiques')
)
app.use(
    '/api/musculation',
    cors(corsOptionsDelegate),
    require('./routes/musculation')
)
app.use('/api/admin', cors(corsOptionsDelegate), require('./routes/admin'))


const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`))
