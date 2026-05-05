'use strict'

const prisma = require('../lib/prisma')

const imageModel = {}

function toLegacy(row) {
    if (!row) return null
    return {
        _id: row.id,
        id: row.id,
        _owner: row.ownerId,
        fileId: row.fileId,
        name: row.name,
        thumbnailUrl: row.thumbnailUrl,
        url: row.url,
    }
}

imageModel.create = async function create(doc) {
    const row = await prisma.image.create({
        data: {
            ownerId: doc._owner ? String(doc._owner) : null,
            fileId: doc.fileId,
            name: doc.name,
            thumbnailUrl: doc.thumbnailUrl,
            url: doc.url,
        },
    })
    return toLegacy(row)
}

module.exports = imageModel
