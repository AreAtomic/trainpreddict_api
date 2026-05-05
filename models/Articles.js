'use strict'

const prisma = require('../lib/prisma')

function toLegacyArticle(row, coverRow) {
    if (!row) return null
    const o = {
        _id: row.id,
        id: row.id,
        _writer: row.writerId,
        title: row.title,
        content: row.content,
        _cover: row.coverId,
        state: row.state,
        creation: row.creation,
        lastUpdate: row.lastUpdate,
    }
    if (coverRow) {
        o._cover = {
            _id: coverRow.id,
            fileId: coverRow.fileId,
            name: coverRow.name,
            thumbnailUrl: coverRow.thumbnailUrl,
            url: coverRow.url,
        }
    }
    return o
}

function makeArticleQuery(where) {
    const q = {
        where,
        _skip: 0,
        _take: undefined,
        _populate: null,
        skip(n) {
            q._skip = n
            return q
        },
        limit(n) {
            q._take = n
            return q
        },
        populate(field) {
            q._populate = field
            return q
        },
        then(onFulfilled, onRejected) {
            return q.exec().then(onFulfilled, onRejected)
        },
        async exec() {
            const rows = await prisma.article.findMany({
                where: q.where,
                skip: q._skip,
                take: q._take,
            })
            if (q._populate === '_cover') {
                return Promise.all(
                    rows.map(async (row) => {
                        const cover = row.coverId
                            ? await prisma.image.findUnique({
                                  where: { id: row.coverId },
                              })
                            : null
                        return toLegacyArticle(row, cover)
                    })
                )
            }
            return rows.map((r) => toLegacyArticle(r))
        },
    }
    return q
}

const ArticleModel = {}

ArticleModel.create = async function create(doc) {
    const row = await prisma.article.create({
        data: {
            writerId: doc._writer ? String(doc._writer) : null,
            title: doc.title,
            creation: doc.creation,
            lastUpdate: doc.lastUpdate || doc.ladtUpdate,
            content: [],
        },
    })
    return toLegacyArticle(row)
}

ArticleModel.findOne = function findOne(filter) {
    const where = { id: String(filter._id) }
    const api = {
        _populate: null,
        populate(field) {
            api._populate = field
            return api
        },
        then(onFulfilled, onRejected) {
            return (async () => {
                const row = await prisma.article.findUnique({ where })
                if (!row) return null
                if (api._populate === '_cover') {
                    const cover = row.coverId
                        ? await prisma.image.findUnique({
                              where: { id: row.coverId },
                          })
                        : null
                    return toLegacyArticle(row, cover)
                }
                return toLegacyArticle(row)
            })().then(onFulfilled, onRejected)
        },
    }
    return api
}

ArticleModel.findOneAndUpdate = async function findOneAndUpdate(
    filter,
    update
) {
    const s = update.$set || update
    const data = {}
    if (s.title !== undefined) data.title = s.title
    if (s.content !== undefined) data.content = s.content
    if (s._cover !== undefined) data.coverId = String(s._cover)
    if (s.state !== undefined) data.state = s.state
    if (s.lastUpdate !== undefined) data.lastUpdate = s.lastUpdate
    await prisma.article.update({
        where: { id: String(filter._id) },
        data,
    })
}

ArticleModel.find = function find(filter) {
    const where = {}
    if (filter && filter._writer) where.writerId = String(filter._writer)
    return makeArticleQuery(where)
}

module.exports = ArticleModel
