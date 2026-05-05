'use strict'

const prisma = require('../lib/prisma')
const { coerceOptionalInt, coerceFiniteInt } = require('../lib/prismaCoerce')

function toLegacy(row, projection) {
    if (!row) return null
    const o = {
        _id: row.id,
        id: row.id,
        prenom: row.prenom,
        nom: row.nom,
        type: row.type,
        email: row.email,
        mot_de_passe: row.motDePasse,
        code_securite: row.codeSecurite,
        isConfirmed: row.isConfirmed,
        _structure: row.structureId,
        onboarding: {
            complete: row.onboardingComplete,
            step: row.onboardingStep,
        },
    }
    if (!projection) return o
    if (typeof projection === 'string' && projection.includes('mot_de_passe')) {
        delete o.mot_de_passe
        return o
    }
    if (projection.mot_de_passe === 0) delete o.mot_de_passe
    if (projection.mot_de_passe === 1) {
        return {
            _id: o._id,
            id: o.id,
            mot_de_passe: row.motDePasse,
        }
    }
    if (projection.email === 1 && projection.nom === 1 && projection.prenom === 1) {
        return {
            _id: o._id,
            email: o.email,
            nom: o.nom,
            prenom: o.prenom,
        }
    }
    return o
}

function buildWhere(q) {
    const w = {}
    if (!q) return w
    if (q._id != null) w.id = String(q._id)
    if (q.id != null) w.id = String(q.id)
    if (q.email) w.email = q.email
    if (q.type) w.type = q.type
    if (q.nom != null) w.nom = q.nom
    if (q.prenom != null) w.prenom = q.prenom
    if (q._structure != null) w.structureId = String(q._structure)
    if (q.code_securite != null) {
        const v = coerceFiniteInt(q.code_securite)
        if (v !== undefined) w.codeSecurite = v
    }
    return w
}

function normalizeUpdate(raw) {
    if (!raw) return {}
    let src = raw
    if (raw.$set) src = raw.$set
    const data = {}
    if (src.mot_de_passe != null) data.motDePasse = src.mot_de_passe
    if (src.isConfirmed != null) data.isConfirmed = src.isConfirmed
    if (src.onboarding != null) {
        if (src.onboarding.complete != null)
            data.onboardingComplete = src.onboarding.complete
        if (src.onboarding.step !== undefined) {
            const s = coerceFiniteInt(src.onboarding.step)
            if (s !== undefined) data.onboardingStep = s
        }
    }
    if (src.code != null) {
        const v = coerceFiniteInt(src.code)
        if (v !== undefined) data.codeSecurite = v
    }
    if (src.code_securite !== undefined)
        data.codeSecurite = coerceOptionalInt(src.code_securite)
    if (src.prenom != null) data.prenom = src.prenom
    if (src.nom != null) data.nom = src.nom
    if (src.email != null) data.email = src.email
    if (src.type != null) data.type = src.type
    if (src._structure != null) data.structureId = String(src._structure)
    return data
}

function Utilisateur(partial) {
    if (!(this instanceof Utilisateur)) return new Utilisateur(partial)
    Object.assign(this, partial)
}

Utilisateur.prototype.save = async function saveUser() {
    const id = this._id || this.id
    const payload = {
        prenom: this.prenom,
        nom: this.nom,
        type: this.type || 'Coureur',
        email: this.email,
        motDePasse: this.mot_de_passe || this.motDePasse,
        structureId: this._structure ? String(this._structure) : null,
        codeSecurite:
            this.code_securite !== undefined
                ? coerceOptionalInt(this.code_securite)
                : undefined,
        isConfirmed: this.isConfirmed,
        onboardingComplete: this.onboarding?.complete,
        onboardingStep: this.onboarding?.step,
    }
    if (!id) {
        const row = await prisma.utilisateur.create({
            data: {
                prenom: payload.prenom,
                nom: payload.nom,
                type: payload.type,
                email: payload.email,
                motDePasse: payload.motDePasse,
                structureId: payload.structureId,
                codeSecurite: payload.codeSecurite,
                isConfirmed: payload.isConfirmed ?? false,
                onboardingComplete: payload.onboardingComplete ?? false,
                onboardingStep: coerceFiniteInt(payload.onboardingStep) ?? 0,
            },
        })
        Object.assign(this, toLegacy(row))
        return this
    }
    const data = {}
    if (this.prenom !== undefined) data.prenom = this.prenom
    if (this.nom !== undefined) data.nom = this.nom
    if (this.email !== undefined) data.email = this.email
    if (this.mot_de_passe !== undefined || this.motDePasse !== undefined) {
        data.motDePasse = this.mot_de_passe || this.motDePasse
    }
    if (this._structure !== undefined) {
        data.structureId =
            this._structure == null ? null : String(this._structure)
    }
    if (this.code_securite !== undefined) {
        data.codeSecurite = coerceOptionalInt(this.code_securite)
    }
    if (this.isConfirmed !== undefined) data.isConfirmed = this.isConfirmed
    if (this.onboarding != null) {
        if (this.onboarding.complete != null)
            data.onboardingComplete = this.onboarding.complete
        if (this.onboarding.step !== undefined) {
            const s = coerceFiniteInt(this.onboarding.step)
            if (s !== undefined) data.onboardingStep = s
        }
    }
    const row = await prisma.utilisateur.update({
        where: { id: String(id) },
        data,
    })
    Object.assign(this, toLegacy(row))
    return this
}

Utilisateur.findOne = async function findOne(query, projection) {
    const w = buildWhere(query)
    const row = await prisma.utilisateur.findFirst({ where: w })
    return toLegacy(row, projection)
}

Utilisateur.find = async function find(query, projection) {
    const w = buildWhere(query)
    const rows = await prisma.utilisateur.findMany({ where: w })
    return rows.map((r) => toLegacy(r, projection))
}

Utilisateur.create = async function create(doc) {
    const row = await prisma.utilisateur.create({
        data: {
            prenom: doc.prenom,
            nom: doc.nom,
            type: doc.type || 'Coureur',
            email: doc.email,
            motDePasse: doc.mot_de_passe || doc.motDePasse,
            structureId: doc._structure ? String(doc._structure) : null,
            isConfirmed: doc.isConfirmed ?? false,
            onboardingComplete: doc.onboarding?.complete ?? false,
            onboardingStep: coerceFiniteInt(doc.onboarding?.step) ?? 0,
        },
    })
    return toLegacy(row)
}

Utilisateur.findOneAndUpdate = async function findOneAndUpdate(
    filter,
    update,
    _options
) {
    const w = buildWhere(filter)
    const row = await prisma.utilisateur.findFirst({ where: w })
    if (!row) return null
    const data = normalizeUpdate(update)
    const updated = await prisma.utilisateur.update({
        where: { id: row.id },
        data,
    })
    return toLegacy(updated)
}

Utilisateur.findOneAndDelete = async function findOneAndDelete(filter) {
    const w = buildWhere(filter)
    const row = await prisma.utilisateur.findFirst({ where: w })
    if (!row) return null
    await prisma.utilisateur.delete({ where: { id: row.id } })
    return toLegacy(row)
}

module.exports = Utilisateur
