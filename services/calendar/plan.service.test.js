const { connectDB, disconnectDB } = require('../../config/db')
const Utilisateur = require('../../models/Utilisateur')
const Profil = require('../../models/Profil')
const DonneesUtilisateur = require('../../models/DonneesUtilisateur')
const Objectif = require('../../models/Objectif')
const Assistant = require('../../models/Assistant')
const { Plan } = require('./plan.service')

let plan = null

beforeAll(async () => {
    return new Promise(async (resolve) => {
        connectDB(true)
        const utilisateur = await Utilisateur.findOne({
            email: 'fake@trainpreddict.fr',
        })
        const profil = await Profil.findOne({ _utilisateur: utilisateur._id })
        const donneesUtilisateur = await DonneesUtilisateur.findOne({
            _utilisateur: utilisateur._id,
        })
        const objectifs = await Objectif.findOne({
            _utilisateur: utilisateur._id,
        }).sort({ date: -1 })
        const calendar = await Assistant.findOne({
            _utilisateur: utilisateur._id,
        })

        plan = new Plan(
            utilisateur,
            profil,
            donneesUtilisateur,
            objectifs,
            calendar
        )
        resolve()
    })
})

afterAll(() => {
    disconnectDB()
})

test("création d'un objet plan", () => {
    expect(typeof plan).toBe('object')
})

test('index jour avec string', () => {
    expect(plan.stringDayToWeekIndex('lundi')).toBe(0)
    expect(plan.stringDayToWeekIndex('mardi')).toBe(1)
    expect(plan.stringDayToWeekIndex('mercredi')).toBe(2)
    expect(plan.stringDayToWeekIndex('jeudi')).toBe(3)
    expect(plan.stringDayToWeekIndex('vendredi')).toBe(4)
    expect(plan.stringDayToWeekIndex('samedi')).toBe(5)
    expect(plan.stringDayToWeekIndex('dimanche')).toBe(6)
})

test('string jour avec index week', () => {
    expect(plan.indexWeekToDayString(0)).toBe('lundi')
    expect(plan.indexWeekToDayString(1)).toBe('mardi')
    expect(plan.indexWeekToDayString(2)).toBe('mercredi')
    expect(plan.indexWeekToDayString(3)).toBe('jeudi')
    expect(plan.indexWeekToDayString(4)).toBe('vendredi')
    expect(plan.indexWeekToDayString(5)).toBe('samedi')
    expect(plan.indexWeekToDayString(6)).toBe('dimanche')
})

test("somme charge entrainement d'une semaine", () => {
    const week = [0, 84, 140, 140, 0, 84, 140]
    expect(plan.calculChargeEntrainementSemaine(week)).toBe(588)
})

test('génération semaine type de plan', () => {
    expect(
        plan.semaineType(5, Math.round(700 / 5), ['lundi', 'vendredi'])
    ).toStrictEqual([0, 140, 140, 140, 0, 140, 140])

    expect(
        plan.semaineType(6, Math.round(900 / 6), ['dimanche'])
    ).toStrictEqual([150, 150, 150, 150, 150, 150, 0])

    expect(
        plan.semaineType(3, Math.round(700 / 3), [
            'lundi',
            'mardi',
            'jeudi',
            'vendredi',
        ])
    ).toStrictEqual([0, 0, 233, 0, 0, 233, 233])
})

test('récupération des séances possibles', () => {
    expect(plan.possibleSeance(true, false, true)).toBe({
        muscu: [],
        ppg: [],
        velo: {
            foncier: [],
            seuil: [],
            pma: [],
            vo2max: [],
            rythme: [],
            recup: [],
            vtt: [],
        },
        cap: [],
        natation: [],
    })
})
