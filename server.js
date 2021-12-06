const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')
const fileUpload = require('express-fileupload')
const dotenv = require('dotenv')
const fs = require('fs')
const https = require('https')

/*
 * Connexion Database *
 */
connectDB()

/**
 * Config env
 */
dotenv.config()

/*
 * Setting express *
 */
var whitelist = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://trainpreddict.fr',
    'https://trainpreddict.fr:3000',
    'https://trainpreddict-assistant.netlify.app',
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

    const httpsServer = https.createServer(credentials, app).listen(6001)


/*
 * ROUTER *
 */
app.get('/', function (req, res) {
    res.send('Running')
})

/**
 * ROUTER COUREURS *
 */
app.use(
    '/api/utilisateur',
    cors(corsOptionsDelegate),
    require('./routes/coureurs/utilisateur')
)
app.use(
    '/api/auth',
    cors(corsOptionsDelegate),
    require('./routes/coureurs/auth')
)
app.use(
    '/api/infosup',
    cors(corsOptionsDelegate),
    require('./routes/coureurs/infosup')
)
app.use(
    '/api/profil',
    cors(corsOptionsDelegate),
    require('./routes/coureurs/profil')
)
app.use(
    '/api/objectif',
    cors(corsOptionsDelegate),
    require('./routes/coureurs/objectif')
)
app.use(
    '/api/plan',
    cors(corsOptionsDelegate),
    require('./routes/coureurs/plan')
)
app.use(
    '/api/courbes',
    cors(corsOptionsDelegate),
    require('./routes/coureurs/courbes')
)
app.use(
    '/api/donneesUtilisateur',
    cors(corsOptionsDelegate),
    require('./routes/coureurs/donneesUtilisateur')
)
app.use(
    '/api/entrainement',
    cors(corsOptionsDelegate),
    require('./routes/coureurs/entrainement')
)
app.use(
    '/api/statistiques',
    cors(corsOptionsDelegate),
    require('./routes/coureurs/statistiques')
)
app.use(
    '/api/musculation',
    cors(corsOptionsDelegate),
    require('./routes/coureurs/musculation')
)

/**
 * ROUTER SEANCES *
 */
app.use(
    '/api/seance',
    cors(corsOptionsDelegate),
    require('./routes/seances/seances')
)
app.use(
    '/api/seance/blocs',
    cors(corsOptionsDelegate),
    require('./routes/seances/blocs')
)

/**
 * ROUTER ASSISTANT *
 */
app.use(
    '/api/assistant/auth',
    cors(corsOptionsDelegate),
    require('./routes/assistants/auth')
)
app.use(
    '/api/assistant/affiliation',
    cors(corsOptionsDelegate),
    require('./routes/assistants/affiliation')
)
app.use(
    '/api/assistant/utilisateur',
    cors(corsOptionsDelegate),
    require('./routes/assistants/utilisateur')
)


const PORT = 6001
app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`))
