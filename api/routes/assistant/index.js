//* MODULES *//
const express = require('express')
const router = express.Router()
//* MICROSERVICES *//
const OrganismeRoutes = require('./organisme')
const AffiliationRoutes = require('./affiliation')
const CalendrierRoutes = require('./calendrier')

//* ROUTES *//
router.use('/organisme', OrganismeRoutes)
router.use('/affiliation', AffiliationRoutes)
router.use('/calendrier', CalendrierRoutes)
router.use('/config', (req, res) => {
    // TODO: Create and link config routers
    return res.status(200).json({ message: 'Routers of config' })
})
router.use('/courses', (req, res) => {
    // TODO: Create and link courses routers
    return res.status(200).json({ message: 'Routers of courses' })
})
router.use('/entrainement', (req, res) => {
    // TODO: Create and link entrainement routers
    return res.status(200).json({ message: 'Routers of entrainement' })
})
router.use('/objectif', (req, res) => {
    // TODO: Create and link objectif routers
    return res.status(200).json({ message: 'Routers of objectif' })
})
router.use('/profil', (req, res) => {
    // TODO: Create and link profil routers
    return res.status(200).json({ message: 'Routers of profil' })
})

module.exports = router
