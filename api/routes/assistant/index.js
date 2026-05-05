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
const ProfilRoutes = require('./profil')
const ConfigRoutes = require('./config')

//* ROUTES *//
router.use('/organisme', OrganismeRoutes)
router.use('/affiliation', AffiliationRoutes)
router.use('/calendrier', CalendrierRoutes)
router.use('/courses', CoursesRoutes)
router.use('/entrainement', EntrainementRoutes)
router.use('/objectif', ObjectifRoutes)
router.use('/profil', ProfilRoutes)
router.use('/config', ConfigRoutes)

module.exports = router
