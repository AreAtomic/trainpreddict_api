//* MODULES *//
const express = require('express')
const router = express.Router()
//* MICROSERVICES *//
const OrganismeRoutes = require('./organisme')
const AffiliationRoutes = require('./affiliation')
const CalendrierRoutes = require('./calendrier')
const EntrainementRoutes = require('./entrainement')
const ObjectifRoutes = require('./objectif')
const CoursesRoutes = require('./courses')

//* ROUTES *//
router.use('/organisme', OrganismeRoutes)
router.use('/affiliation', AffiliationRoutes)
router.use('/calendrier', CalendrierRoutes)
router.use('/config', (req, res) => {
    // TODO: Create and link config routers
    return res.status(200).json({ message: 'Routers of config' })
})
router.use('/courses', CoursesRoutes)
router.use('/entrainement', EntrainementRoutes)
router.use('/objectif', ObjectifRoutes)
router.use('/profil', (req, res) => {
    // TODO: Create and link profil routers
    return res.status(200).json({ message: 'Routers of profil' })
})

module.exports = router
