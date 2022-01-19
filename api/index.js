//* MODULES *//
const express = require('express')
const router = express.Router()
const AuthRoutes = require('./routes/auth')

//* ROUTES *//
router.get('/', (req, res) => {
    res.send('API TrainPreddict v1 is running.')
})

router.use('/auth', AuthRoutes)

module.exports = router
