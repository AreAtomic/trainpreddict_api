'use strict'

const prisma = require('../lib/prisma')

function toLegacy(row) {
    if (!row) return null
    return {
        _id: row.id,
        id: row.id,
        _utilisateur: row.utilisateurId,
        naissance: row.naissance,
        adresse: row.adresse,
        decouverte: row.decouverte,
        categorie: row.categorie,
        telephone: row.telephone,
    }
}

function InfoSup(partial) {
    if (!(this instanceof InfoSup)) return new InfoSup(partial)
    Object.assign(this, partial)
}

InfoSup.prototype.save = async function saveInfoSup() {
    const uid = String(this._utilisateur || this.utilisateurId)
    if (!this._id && !this.id) {
        const row = await prisma.infoSup.create({
            data: {
                utilisateurId: uid,
                naissance: this.naissance,
                adresse: this.adresse,
                decouverte: this.decouverte,
                categorie: this.categorie,
                telephone: this.telephone,
            },
        })
        Object.assign(this, toLegacy(row))
        return this
    }
    const row = await prisma.infoSup.update({
        where: { utilisateurId: uid },
        data: {
            naissance: this.naissance,
            adresse: this.adresse,
            decouverte: this.decouverte,
            categorie: this.categorie,
            telephone: this.telephone,
        },
    })
    Object.assign(this, toLegacy(row))
    return this
}

InfoSup.findOne = async function findOne(q) {
    const uid = q._utilisateur != null ? String(q._utilisateur) : null
    const row = uid
        ? await prisma.infoSup.findUnique({ where: { utilisateurId: uid } })
        : null
    return toLegacy(row)
}

module.exports = InfoSup
