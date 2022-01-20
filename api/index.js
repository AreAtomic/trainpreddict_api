//* MODULES *//
const express = require('express')
const router = express.Router()
const AuthRoutes = require('./routes/auth')
const AssitantRoutes = require('./routes/assistant')

//* ROUTES *//
router.get('/', (req, res) => {
    res.send('API TrainPreddict v1 is running.')
})

router.use('/auth', AuthRoutes)
router.use('/assistant', AssitantRoutes)

module.exports = router
