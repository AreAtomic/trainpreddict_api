const mongoose = require('mongoose')
const { PrismaClient } = require('@prisma/client')
const dotenv = require('dotenv')

dotenv.config()

const prisma = new PrismaClient()

const migrateData = async () => {
    try {
        console.log('🔄 Connecting to MongoDB...')
        await mongoose.connect(
            process.env.DATABASE_MONGODB || process.env.DATABASE,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            }
        )
        console.log('✅ MongoDB connected')

        console.log('🔄 Connecting to PostgreSQL via Prisma...')
        await prisma.$connect()
        console.log('✅ PostgreSQL connected')

        console.log('📊 Starting data migration...\n')

        // 1. Migrate Utilisateur
        console.log('→ Migrating Utilisateur...')
        const UtilisateurModel = require('../models/Utilisateur')
        const utilisateurs = await UtilisateurModel.find({})
        for (const u of utilisateurs) {
            try {
                await prisma.utilisateur.create({
                    data: {
                        id: u._id.toString(),
                        prenom: u.prenom,
                        nom: u.nom,
                        type: u.type || 'Coureur',
                        email: u.email,
                        motDePasse: u.mot_de_passe,
                        codeSecurite: u.code_securite,
                        isConfirmed: u.isConfirmed || false,
                        onboardingComplete: u.onboarding?.complete || false,
                        onboardingStep: u.onboarding?.step || 0,
                        structureId: u._structure?.toString(),
                    },
                })
            } catch (err) {
                console.warn(`⚠️  Skipped user ${u._id}: ${err.message}`)
            }
        }
        console.log(`✅ Migrated ${utilisateurs.length} utilisateurs\n`)

        // 2. Migrate Profil
        console.log('→ Migrating Profil...')
        const ProfilModel = require('../models/Profil')
        const profils = await ProfilModel.find({})
        for (const p of profils) {
            try {
                await prisma.profil.create({
                    data: {
                        id: p._id.toString(),
                        utilisateurId: p._utilisateur.toString(),
                        fcfs: p.fcfs || 200,
                        pfs: p.pfs || 300,
                        age: p.age || 14,
                        poids: p.poids || 75,
                    },
                })
            } catch (err) {
                console.warn(`⚠️  Skipped profil ${p._id}: ${err.message}`)
            }
        }
        console.log(`✅ Migrated ${profils.length} profils\n`)

        // 3. Migrate DonneesUtilisateur
        console.log('→ Migrating DonneesUtilisateur...')
        const DonneesUtilisateurModel = require('../models/DonneesUtilisateur')
        const donnees = await DonneesUtilisateurModel.find({})
        for (const d of donnees) {
            try {
                await prisma.donneesUtilisateur.create({
                    data: {
                        id: d._id.toString(),
                        utilisateurId: d._utilisateur.toString(),
                        experience: d.experience,
                        heureSommeil: d.heure_sommeil,
                        tempsRecupMax: d.temps_recup_max,
                        sse: d.sse || 700,
                        nombreHeureSemaine: d.nombre_heure_semaine,
                        nombreSeanceSemaine: d.nombre_seance_semaine,
                        joursRepos: d.jours_repos || [],
                        musculation: d.musculation,
                        ppg: d.ppg || true,
                        etirement: d.etirement,
                        foncier: d.foncier,
                        style: d.style,
                        pointFaible: d.point_faible,
                    },
                })
            } catch (err) {
                console.warn(`⚠️  Skipped donnees ${d._id}: ${err.message}`)
            }
        }
        console.log(`✅ Migrated ${donnees.length} donnees utilisateur\n`)

        // 4. Migrate Seance
        console.log('→ Migrating Seance...')
        const SeanceModel = require('../models/Seance')
        const seances = await SeanceModel.find({})
        for (const s of seances) {
            try {
                await prisma.seance.create({
                    data: {
                        id: s._id.toString(),
                        utilisateurId: s._utilisateur?.toString(),
                        type: s.type || [],
                        titre: s.titre,
                        duree: s.duree,
                        estimationDistance: s.estimation_distance,
                        estimationDeniv: s.estimation_deniv,
                        specifique: s.specifique || [],
                        description: s.description,
                        Z1: s.Z1 || '0',
                        Z2: s.Z2 || '0',
                        Z3: s.Z3 || '0',
                        Z4: s.Z4 || '0',
                        Z5: s.Z5 || '0',
                        Z6: s.Z6 || '0',
                        Z7: s.Z7 || '0',
                        puissanceMoyenne: s.puissance_moyenne || 0,
                        chargeEntrainementEstime:
                            s.charge_entrainement_estime || 0,
                        intensiteTravail: s.intensite_travail || 0,
                        scoreStressEntrainement:
                            s.score_stress_entrainement || 0,
                        public: s.public !== false,
                    },
                })
            } catch (err) {
                console.warn(`⚠️  Skipped seance ${s._id}: ${err.message}`)
            }
        }
        console.log(`✅ Migrated ${seances.length} seances\n`)

        // 5. Migrate Course
        console.log('→ Migrating Course...')
        const CourseModel = require('../models/Course')
        const courses = await CourseModel.find({})
        for (const c of courses) {
            try {
                await prisma.course.create({
                    data: {
                        id: c._id.toString(),
                        utilisateurId: c._utilisateur?.toString(),
                        organismeId: c._organisme?.toString(),
                        date: c.date,
                        type: c.type || 'Cyclosportive',
                        titre: c.titre,
                        description: c.description,
                        denivele: c.denivele || '0',
                        distance: c.distance || 0,
                        temps: c.temps || '00:00:00',
                        sse: c.sse || 200,
                        course: c.course !== false,
                    },
                })
            } catch (err) {
                console.warn(`⚠️  Skipped course ${c._id}: ${err.message}`)
            }
        }
        console.log(`✅ Migrated ${courses.length} courses\n`)

        // 6. Migrate Objectif
        console.log('→ Migrating Objectif...')
        const ObjectifModel = require('../models/Objectif')
        const objectifs = await ObjectifModel.find({})
        for (const o of objectifs) {
            try {
                await prisma.objectif.create({
                    data: {
                        id: o._id.toString(),
                        utilisateurId: o._utilisateur.toString(),
                        date: o.date,
                        type: o.type || 'Vallon',
                        resultatVise: o.resultat_vise || 'Victoire',
                        titre: o.titre,
                        description: o.description,
                        denivele: o.denivele || '0',
                        distance: o.distance || 0,
                        temps: o.temps || '00:00:00',
                        realise: o.realise || false,
                        sse: o.sse || 200,
                    },
                })
            } catch (err) {
                console.warn(`⚠️  Skipped objectif ${o._id}: ${err.message}`)
            }
        }
        console.log(`✅ Migrated ${objectifs.length} objectifs\n`)

        console.log('✅ Main migration completed!')
        console.log('\n⚠️  MANUAL STEPS REQUIRED:')
        console.log(
            '  1. Migrate Entrainement (large dataset with complex fields)'
        )
        console.log('  2. Migrate Plan and Assistant (nested structures)')
        console.log('  3. Update .env with DATABASE_URL pointing to PostgreSQL')
        console.log('  4. Run: npx prisma migrate deploy')

        process.exit(0)
    } catch (error) {
        console.error('❌ Migration failed:', error)
        process.exit(1)
    } finally {
        await mongoose.disconnect()
        await prisma.$disconnect()
    }
}

migrateData()
