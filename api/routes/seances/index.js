//* MODULES *//
const express = require('express')
const router = express.Router()
//* CONTROLLERS *//
const BlocsRoutes = require('./blocs')
const SeancesRoutes = require('./seances')

//* ROUTES *//
router.use('/blocs', BlocsRoutes)
router.use('/seances', SeancesRoutes)

module.exports = router