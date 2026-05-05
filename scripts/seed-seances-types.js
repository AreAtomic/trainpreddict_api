/**
 * Insère des séances « type » (bibliothèque) : utilisateurId null, public true.
 * Inspirées de structures classiques (endurance fondamentale, seuil type Daniels,
 * intervalles VO2/PMA, récupération active — adaptées au découpage Z1–Z7 de l’app).
 *
 * Usage : depuis back-end/ → node scripts/seed-seances-types.js
 */
'use strict'

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })
const prisma = require('../lib/prisma')

const PREFIX = 'Modèle — '

function pad2(n) {
    return String(n).padStart(2, '0')
}

function secondsToHMS(totalSeconds) {
    const s = Math.max(0, Math.floor(totalSeconds))
    return `${pad2(Math.floor(s / 3600))}:${pad2(Math.floor((s % 3600) / 60))}:${pad2(s % 60)}`
}

/** @param {string} seg ex. "Z2:01:30:00" */
function parseSegment(seg) {
    const m = String(seg)
        .replace(/\s/g, '')
        .match(/^Z(\d):(\d{2}):(\d{2}):(\d{2})$/)
    if (!m) throw new Error(`Segment invalide: ${seg}`)
    const zone = parseInt(m[1], 10)
    const seconds =
        parseInt(m[2], 10) * 3600 +
        parseInt(m[3], 10) * 60 +
        parseInt(m[4], 10)
    return { zone, seconds }
}

function aggregateFromSpecifique(specifique) {
    const zoneSec = [0, 0, 0, 0, 0, 0, 0]
    let total = 0
    for (const seg of specifique) {
        const { zone, seconds } = parseSegment(seg)
        total += seconds
        if (zone >= 1 && zone <= 7) zoneSec[zone - 1] += seconds
    }
    const Z = zoneSec.map(secondsToHMS)
    return {
        duree: secondsToHMS(total),
        Z1: Z[0],
        Z2: Z[1],
        Z3: Z[2],
        Z4: Z[3],
        Z5: Z[4],
        Z6: Z[5],
        Z7: Z[6],
        totalMinutes: total / 60,
    }
}

/** Estimation grossière charge / intensité / stress (échelle type données existantes dans le front) */
function estimateMetrics(agg, typeTags) {
    const m = agg.totalMinutes
    if (m <= 0) {
        return {
            puissanceMoyenne: 0.55,
            chargeEntrainementEstime: 50,
            intensiteTravail: 100,
            scoreStressEntrainement: 75,
        }
    }
    const zoneWeights = [0.35, 0.55, 0.72, 0.88, 1.05, 1.2, 1.35]
    let wsum = 0
    const zs = [
        agg.Z1,
        agg.Z2,
        agg.Z3,
        agg.Z4,
        agg.Z5,
        agg.Z6,
        agg.Z7,
    ].map((hms) => {
        const p = hms.split(':').map(Number)
        return p[0] * 3600 + p[1] * 60 + p[2]
    })
    const totZ = zs.reduce((a, b) => a + b, 0) || 1
    for (let i = 0; i < 7; i++) wsum += zs[i] * zoneWeights[i]
    const puissanceMoyenne = Math.round((wsum / totZ) * 1000) / 1000
    const chargeEntrainementEstime = Math.round(m * puissanceMoyenne * 1.15)
    let hi = typeTags.some((t) =>
        ['Seuil', 'PMA', 'VO2 Max'].includes(t)
    )
        ? 1.25
        : typeTags.includes('Récupération')
          ? 0.75
          : 1
    const intensiteTravail = Math.round(
        m * puissanceMoyenne * 1.4 * hi + (totZ / 3600) * 30
    )
    const scoreStressEntrainement = Math.round(
        (chargeEntrainementEstime + intensiteTravail) / 2
    )
    return {
        puissanceMoyenne,
        chargeEntrainementEstime,
        intensiteTravail,
        scoreStressEntrainement,
    }
}

const TEMPLATES = [
    {
        titre: `${PREFIX}Récupération active 45 min`,
        type: ['Récupération'],
        specifique: ['Z1:00:45:00'],
        description:
            "Allure très facile, conversation possible. Équivalent 'easy run' / récupération active (Hal Higdon, plans 5k–marathon).",
        estimationDistance: 7,
        estimationDeniv: 50,
    },
    {
        titre: `${PREFIX}Foncier 1h30 en Z2`,
        type: ['Foncier'],
        specifique: ['Z2:01:30:00'],
        description:
            'Endurance fondamentale stable (zone 2), base aérobie — même logique que le fond long Daniels / Maffetone simplifié.',
        estimationDistance: 22,
        estimationDeniv: 180,
    },
    {
        titre: `${PREFIX}Foncier 2h avec modulation Z2–Z3`,
        type: ['Foncier'],
        specifique: [
            'Z2:00:40:00',
            'Z3:00:10:00',
            'Z2:00:30:00',
            'Z3:00:10:00',
            'Z2:00:30:00',
            'Z1:00:10:00',
        ],
        description:
            'Blocs aérobie avec légères montées en Z3 (fartlek doux / progression contrôlée).',
        estimationDistance: 28,
        estimationDeniv: 350,
    },
    {
        titre: `${PREFIX}Rythme 1h15 tempo Z3`,
        type: ['Rythme'],
        specifique: [
            'Z1:00:10:00',
            'Z2:00:15:00',
            'Z3:00:40:00',
            'Z2:00:10:00',
        ],
        description:
            "Bloc central soutenu type 'tempo' / allure marathon (zone stable, pas d'acidose).",
        estimationDistance: 16,
        estimationDeniv: 120,
    },
    {
        titre: `${PREFIX}Seuil 3 × 12 min`,
        type: ['Seuil'],
        specifique: [
            'Z1:00:15:00',
            'Z2:00:20:00',
            'Z4:00:12:00',
            'Z2:00:03:00',
            'Z4:00:12:00',
            'Z2:00:03:00',
            'Z4:00:12:00',
            'Z2:00:20:00',
            'Z1:00:10:00',
        ],
        description:
            "Fractionné seuil (T-pace / lactate threshold), structure 3×12' avec récup courtes — proche des séances 'threshold' Daniels.",
        estimationDistance: 18,
        estimationDeniv: 100,
    },
    {
        titre: `${PREFIX}Seuil 2 × 20 min`,
        type: ['Seuil'],
        specifique: [
            'Z1:00:12:00',
            'Z2:00:18:00',
            'Z4:00:20:00',
            'Z2:00:05:00',
            'Z4:00:20:00',
            'Z2:00:15:00',
            'Z1:00:10:00',
        ],
        description:
            'Deux blocs longs au seuil ; utile pour tenir un rythme soutenu sur distance.',
        estimationDistance: 20,
        estimationDeniv: 110,
    },
    {
        titre: `${PREFIX}PMA 8 × 1 min`,
        type: ['PMA'],
        specifique: (() => {
            const blocks = []
            blocks.push('Z1:00:15:00', 'Z2:00:15:00')
            for (let i = 0; i < 8; i++) {
                blocks.push('Z5:00:01:00', 'Z2:00:02:00')
            }
            blocks.push('Z2:00:10:00', 'Z1:00:05:00')
            return blocks
        })(),
        description:
            "Courtes répétitions PMA / vitesse (type 'repetitions' ou strides prolongés), récup active Z2.",
        estimationDistance: 10,
        estimationDeniv: 40,
    },
    {
        titre: `${PREFIX}VO2 max 5 × 3 min`,
        type: ['VO2 Max'],
        specifique: (() => {
            const b = ['Z1:00:12:00', 'Z2:00:18:00']
            for (let i = 0; i < 5; i++) {
                b.push('Z5:00:03:00', 'Z2:00:03:00')
            }
            b.push('Z2:00:12:00', 'Z1:00:08:00')
            return b
        })(),
        description:
            "Intervalles VO2 (5×3' effort / 3' récup) — ordre de grandeur des séances I du plan Daniels.",
        estimationDistance: 12,
        estimationDeniv: 60,
    },
    {
        titre: `${PREFIX}VO2 max 6 × 2 min`,
        type: ['VO2 Max'],
        specifique: (() => {
            const b = ['Z1:00:10:00', 'Z2:00:15:00']
            for (let i = 0; i < 6; i++) {
                b.push('Z5:00:02:00', 'Z2:00:02:00')
            }
            b.push('Z2:00:15:00', 'Z1:00:08:00')
            return b
        })(),
        description:
            "Répétitions plus courtes, intensité élevée — utile pour la vitesse 5k / cross (inspiré des workouts 'interval' publics).",
        estimationDistance: 9,
        estimationDeniv: 40,
    },
    {
        titre: `${PREFIX}Progressif 1h (finish Z3)`,
        type: ['Rythme', 'Foncier'],
        specifique: [
            'Z2:00:25:00',
            'Z2:00:20:00',
            'Z3:00:15:00',
            'Z1:00:10:00',
        ],
        description:
            'Construit en crescendo : majorité Z2 puis montée progressive vers Z3 en fin de séance.',
        estimationDistance: 15,
        estimationDeniv: 100,
    },

    // ========== SÉANCES CYCLO SUPPLÉMENTAIRES ==========

    // Récupération active et fondation
    {
        titre: `${PREFIX}Récupération légère 1h Z1–Z2`,
        type: ['Récupération'],
        specifique: [
            'Z1:00:10:00',
            'Z2:00:45:00',
            'Z1:00:05:00',
        ],
        description:
            'Pédalage facile pour faciliter la récupération post-séance intensive, circulation sanguine accrue.',
        estimationDistance: 20,
        estimationDeniv: 80,
    },
    {
        titre: `${PREFIX}Balade endurance 2h30 Z1–Z2`,
        type: ['Foncier', 'Récupération'],
        specifique: [
            'Z1:00:10:00',
            'Z2:01:50:00',
            'Z1:00:30:00',
        ],
        description:
            'Longue sortie très facile, base aérobie sans stress. Équivalent cyclo du "long easy run".',
        estimationDistance: 50,
        estimationDeniv: 300,
    },
    {
        titre: `${PREFIX}Endurance modérée 1h45 Z2`,
        type: ['Foncier'],
        specifique: ['Z2:01:45:00'],
        description:
            'Bloc homogène Z2, construction de la capacité aérobie sans fatigue neuromusculaire.',
        estimationDistance: 40,
        estimationDeniv: 250,
    },

    // Tempo / Seuil lactate
    {
        titre: `${PREFIX}Tempo court 45 min Z3`,
        type: ['Rythme'],
        specifique: [
            'Z1:00:10:00',
            'Z2:00:15:00',
            'Z3:00:15:00',
            'Z2:00:05:00',
        ],
        description:
            'Bloc tempo court, intensité soutenue sans dépasser le seuil, bonne tolérance lactate.',
        estimationDistance: 14,
        estimationDeniv: 80,
    },
    {
        titre: `${PREFIX}Seuil 4 × 8 min`,
        type: ['Seuil'],
        specifique: [
            'Z1:00:15:00',
            'Z2:00:15:00',
            'Z4:00:08:00',
            'Z2:00:02:00',
            'Z4:00:08:00',
            'Z2:00:02:00',
            'Z4:00:08:00',
            'Z2:00:02:00',
            'Z4:00:08:00',
            'Z2:00:15:00',
            'Z1:00:08:00',
        ],
        description:
            'Fractionné seuil type "steady state", 4 répétitions Z4 avec récup courtes, adapté cyclo.',
        estimationDistance: 19,
        estimationDeniv: 90,
    },
    {
        titre: `${PREFIX}Sweet spot 2 × 15 min`,
        type: ['Seuil'],
        specifique: [
            'Z1:00:10:00',
            'Z2:00:15:00',
            'Z3:00:15:00',
            'Z2:00:05:00',
            'Z3:00:15:00',
            'Z2:00:15:00',
            'Z1:00:08:00',
        ],
        description:
            'Travail "sweet spot" Z3 — intensité modérée-haute, parfait pour la FTP et l\'endurance seuil.',
        estimationDistance: 22,
        estimationDeniv: 120,
    },

    // VO2 max et capacité anaérobie
    {
        titre: `${PREFIX}VO2 max 8 × 2 min`,
        type: ['VO2 Max'],
        specifique: (() => {
            const b = ['Z1:00:12:00', 'Z2:00:15:00']
            for (let i = 0; i < 8; i++) {
                b.push('Z5:00:02:00', 'Z2:00:02:00')
            }
            b.push('Z2:00:12:00', 'Z1:00:06:00')
            return b
        })(),
        description:
            'Répétitions VO2 courtes (8×2\'), intensité très élevée, bien adapté vélo stationnaire.',
        estimationDistance: 11,
        estimationDeniv: 45,
    },
    {
        titre: `${PREFIX}Anaérobie 6 × 30 sec`,
        type: ['PMA'],
        specifique: (() => {
            const b = ['Z1:00:10:00', 'Z2:00:10:00']
            for (let i = 0; i < 6; i++) {
                b.push('Z6:00:00:30', 'Z2:00:04:30')
            }
            b.push('Z2:00:10:00', 'Z1:00:05:00')
            return b
        })(),
        description:
            'Sprints anaérobies très courts (Z6), explosivité et puissance brute, récup active longue.',
        estimationDistance: 8,
        estimationDeniv: 25,
    },
    {
        titre: `${PREFIX}Sprint 10 × 20 sec`,
        type: ['PMA'],
        specifique: (() => {
            const b = ['Z1:00:10:00', 'Z2:00:12:00']
            for (let i = 0; i < 10; i++) {
                b.push('Z6:00:00:20', 'Z2:00:03:00')
            }
            b.push('Z1:00:08:00')
            return b
        })(),
        description:
            'Sprints répétés Z6, développement de la vitesse pure et puissance maximale.',
        estimationDistance: 7,
        estimationDeniv: 20,
    },

    // Entraînement par intervalle mixte
    {
        titre: `${PREFIX}Pyramide Z3–Z5`,
        type: ['Rythme'],
        specifique: [
            'Z1:00:15:00',
            'Z2:00:15:00',
            'Z3:00:03:00',
            'Z2:00:02:00',
            'Z4:00:05:00',
            'Z2:00:02:00',
            'Z5:00:07:00',
            'Z2:00:03:00',
            'Z4:00:05:00',
            'Z2:00:02:00',
            'Z3:00:03:00',
            'Z2:00:15:00',
            'Z1:00:10:00',
        ],
        description:
            'Progression pyramidale : crescendo en intensité puis décrescendo, sollicite tous les systèmes.',
        estimationDistance: 17,
        estimationDeniv: 85,
    },
    {
        titre: `${PREFIX}Fartlek 1h30 Z2–Z4`,
        type: ['Rythme', 'Foncier'],
        specifique: [
            'Z1:00:15:00',
            'Z2:00:20:00',
            'Z3:00:05:00',
            'Z2:00:05:00',
            'Z3:00:08:00',
            'Z2:00:05:00',
            'Z4:00:04:00',
            'Z2:00:10:00',
            'Z3:00:06:00',
            'Z2:00:10:00',
            'Z1:00:06:00',
        ],
        description:
            'Jeu de vitesse varié : blocs Z2–Z4 non structurés, surges naturelles, travail très complet.',
        estimationDistance: 32,
        estimationDeniv: 150,
    },

    // Séances spécifiques courtes et intenses
    {
        titre: `${PREFIX}Tabata 20/40 Z6`,
        type: ['PMA'],
        specifique: (() => {
            const b = ['Z1:00:10:00', 'Z2:00:05:00']
            for (let i = 0; i < 8; i++) {
                b.push('Z6:00:00:20', 'Z1:00:00:40')
            }
            b.push('Z2:00:10:00', 'Z1:00:05:00')
            return b
        })(),
        description:
            'Protocole HIIT classique : 20 sec effort maximal / 40 sec récup, très efficace en 30 min.',
        estimationDistance: 6,
        estimationDeniv: 15,
    },
    {
        titre: `${PREFIX}Seuil décroissant 3×(5+3 min)`,
        type: ['Seuil'],
        specifique: [
            'Z1:00:12:00',
            'Z2:00:12:00',
            'Z4:00:05:00',
            'Z2:00:02:00',
            'Z4:00:03:00',
            'Z2:00:02:00',
            'Z4:00:05:00',
            'Z2:00:02:00',
            'Z4:00:03:00',
            'Z2:00:02:00',
            'Z4:00:05:00',
            'Z2:00:02:00',
            'Z4:00:03:00',
            'Z2:00:15:00',
            'Z1:00:08:00',
        ],
        description:
            'Seuil lactate décroissant : 5+3 min trois fois, effort total long mais intensité modulée.',
        estimationDistance: 18,
        estimationDeniv: 95,
    },

    // Entraînement par bloc (block training)
    {
        titre: `${PREFIX}Bloc aérobie 2h Z2`,
        type: ['Foncier'],
        specifique: ['Z2:02:00:00'],
        description:
            'Long bloc homogène Z2, construction aérobie pure, préparation à la distance.',
        estimationDistance: 45,
        estimationDeniv: 280,
    },
    {
        titre: `${PREFIX}Bloc capacité 2 × (30 min Z3)`,
        type: ['Rythme'],
        specifique: [
            'Z1:00:15:00',
            'Z2:00:10:00',
            'Z3:00:30:00',
            'Z2:00:10:00',
            'Z3:00:30:00',
            'Z2:00:15:00',
            'Z1:00:10:00',
        ],
        description:
            'Deux blocs longs de capacité aérobie soutenue (Z3), idéal pour demi-fond ou cyclo-cross.',
        estimationDistance: 34,
        estimationDeniv: 160,
    },

    // Séances courtes de qualité
    {
        titre: `${PREFIX}Qualité 45 min : 2 × 6 min Z4`,
        type: ['Seuil', 'Rythme'],
        specifique: [
            'Z1:00:10:00',
            'Z2:00:10:00',
            'Z4:00:06:00',
            'Z2:00:04:00',
            'Z4:00:06:00',
            'Z2:00:09:00',
        ],
        description:
            'Séance courte de qualité pour jour chargé : deux blocs seuil, peu de volume total.',
        estimationDistance: 13,
        estimationDeniv: 60,
    },
    {
        titre: `${PREFIX}Express VO2 3 × 3 min`,
        type: ['VO2 Max'],
        specifique: [
            'Z1:00:10:00',
            'Z2:00:05:00',
            'Z5:00:03:00',
            'Z2:00:03:00',
            'Z5:00:03:00',
            'Z2:00:03:00',
            'Z5:00:03:00',
            'Z1:00:08:00',
        ],
        description:
            'Très court : 3×3\' VO2, idéal pour jour limité en temps. Intensité élevée, durée minimale.',
        estimationDistance: 9,
        estimationDeniv: 35,
    },

    // Travail de puissance et spécificité cyclo
    {
        titre: `${PREFIX}Puissance 5 × 1 min Z5–Z6`,
        type: ['PMA'],
        specifique: [
            'Z1:00:10:00',
            'Z2:00:10:00',
            'Z5:00:01:00',
            'Z2:00:03:00',
            'Z5:00:01:00',
            'Z2:00:03:00',
            'Z5:00:01:00',
            'Z2:00:03:00',
            'Z5:00:01:00',
            'Z2:00:03:00',
            'Z5:00:01:00',
            'Z2:00:10:00',
            'Z1:00:05:00',
        ],
        description:
            'Répétitions courtes de puissance brute, développement neuromusculaire, crucial en cyclo.',
        estimationDistance: 10,
        estimationDeniv: 40,
    },
    {
        titre: `${PREFIX}Escalade 4 × 3 min Z4–Z5`,
        type: ['Seuil', 'PMA'],
        specifique: [
            'Z1:00:12:00',
            'Z2:00:12:00',
            'Z4:00:03:00',
            'Z2:00:02:00',
            'Z4:00:03:00',
            'Z2:00:02:00',
            'Z4:00:03:00',
            'Z2:00:02:00',
            'Z4:00:03:00',
            'Z2:00:15:00',
            'Z1:00:10:00',
        ],
        description:
            'Travail d\'escalade court : 4×3\' Z4–Z5, simule travail en côte, force spécifique cyclo.',
        estimationDistance: 16,
        estimationDeniv: 200,
    },

    // Travail d'endurance en intensité
    {
        titre: `${PREFIX}Cruise intervals 3 × 12 min Z3–Z4`,
        type: ['Rythme', 'Seuil'],
        specifique: [
            'Z1:00:15:00',
            'Z2:00:12:00',
            'Z3:00:12:00',
            'Z2:00:03:00',
            'Z3:00:12:00',
            'Z2:00:03:00',
            'Z3:00:12:00',
            'Z2:00:15:00',
            'Z1:00:10:00',
        ],
        description:
            'Intervalles "cruise" : durée moyenne Z3–Z4, accumulation de temps en intensité soutenue.',
        estimationDistance: 25,
        estimationDeniv: 110,
    },

    // Séances de préparation spécifiques
    {
        titre: `${PREFIX}Sortie cyclo-tourisme 3h Z1–Z2`,
        type: ['Foncier', 'Récupération'],
        specifique: [
            'Z1:00:15:00',
            'Z2:02:15:00',
            'Z1:00:30:00',
        ],
        description:
            'Simulation sortie longue de groupe/cyclo : rythme très stable, endurance pure, 3h zone facile.',
        estimationDistance: 55,
        estimationDeniv: 320,
    },
    {
        titre: `${PREFIX}Préparation course circuit 1h45`,
        type: ['Rythme', 'PMA'],
        specifique: [
            'Z1:00:12:00',
            'Z2:00:15:00',
            'Z3:00:05:00',
            'Z2:00:03:00',
            'Z4:00:04:00',
            'Z2:00:02:00',
            'Z5:00:02:00',
            'Z2:00:05:00',
            'Z3:00:05:00',
            'Z2:00:03:00',
            'Z4:00:03:00',
            'Z2:00:02:00',
            'Z5:00:02:00',
            'Z2:00:20:00',
            'Z1:00:08:00',
        ],
        description:
            'Simulation course circuit : variations d\'intensité, travail tactique, finitions Z5–Z6.',
        estimationDistance: 27,
        estimationDeniv: 125,
    },

    // Séances de maintien/récupération active
    {
        titre: `${PREFIX}Spinning léger 50 min Z1`,
        type: ['Récupération'],
        specifique: ['Z1:00:50:00'],
        description:
            'Pédalage très léger, fluidité, mobilité articulaire, excellent jour de repos actif.',
        estimationDistance: 12,
        estimationDeniv: 30,
    },
    {
        titre: `${PREFIX}Maintenance 1h15 Z2`,
        type: ['Foncier'],
        specifique: [
            'Z1:00:10:00',
            'Z2:01:00:00',
            'Z1:00:05:00',
        ],
        description:
            'Maintien fitness sans fatigue : bloc Z2 court et stable, idéal entre deux grosses séances.',
        estimationDistance: 24,
        estimationDeniv: 130,
    },
]

async function main() {
    const deleted = await prisma.seance.deleteMany({
        where: {
            utilisateurId: null,
            titre: { startsWith: PREFIX },
        },
    })
    console.log(`Anciens modèles supprimés : ${deleted.count}`)

    for (const t of TEMPLATES) {
        const agg = aggregateFromSpecifique(t.specifique)
        const metrics = estimateMetrics(agg, t.type)
        await prisma.seance.create({
            data: {
                utilisateurId: null,
                public: true,
                titre: t.titre,
                type: t.type,
                duree: agg.duree,
                estimationDistance: t.estimationDistance,
                estimationDeniv: t.estimationDeniv,
                specifique: t.specifique,
                description: t.description,
                descripiqueDescription: null,
                Z1: agg.Z1,
                Z2: agg.Z2,
                Z3: agg.Z3,
                Z4: agg.Z4,
                Z5: agg.Z5,
                Z6: agg.Z6,
                Z7: agg.Z7,
                puissanceMoyenne: metrics.puissanceMoyenne,
                chargeEntrainementEstime: metrics.chargeEntrainementEstime,
                intensiteTravail: metrics.intensiteTravail,
                scoreStressEntrainement: metrics.scoreStressEntrainement,
            },
        })
        console.log(`Créé : ${t.titre} (${agg.duree})`)
    }
    console.log(`Terminé : ${TEMPLATES.length} séances type.`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
