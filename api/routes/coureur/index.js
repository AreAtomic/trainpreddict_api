//* MODULES *//
const express = require('express')
const router = express.Router()
//* MICROSERVICES *//
const CalendrierRoutes = require('./calendrier')
const EntrainementRoutes = require('./entrainement')
const ObjectifRoutes = require('./objectif')
const CoursesRoutes = require('./courses')
const ProfilRoutes = require('./profil')
const PlanRoutes = require('./plan')

//* ROUTES *//
router.use('/calendrier', CalendrierRoutes)
router.use('/courses', CoursesRoutes)
router.use('/entrainement', EntrainementRoutes)
router.use('/objectif', ObjectifRoutes)
router.use('/profil', ProfilRoutes)
router.use('/plan', PlanRoutes)
router.use('/config', (req, res) => {
    // TODO: Create and link config routers
    return res.status(200).json({ message: 'Routers of config' })
})

module.exports = router
