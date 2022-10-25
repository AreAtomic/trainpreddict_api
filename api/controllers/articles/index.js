//* MODULES *//
const dayjs = require('dayjs')

//* MODELS *//
const ArticleModel = require('../../../models/Articles')

exports.createArticle = async (req, res) => {
    const ISOString = dayjs().toISOString()
    const { title } = req.body
    try {
        const article = await ArticleModel.create({
            title: title,
            creation: ISOString,
            ladtUpdate: ISOString,
            _writer: req.utilisateur._id,
        })

        return res
            .status(200)
            .json({ message: 'Article créé avec succès', article })
    } catch (error) {
        console.log('Catch', error)
        res.status(500).json({
            message: 'Erreur during article creation',
            error: error,
        })
    }
}

exports.getArticleById = async (req, res) => {
    const { articleId } = req.params
    try {
        const article = await ArticleModel.findOne({
            _id: articleId,
        })

        return res
            .status(200)
            .json({ message: 'Article récupéré avec succès', article })
    } catch (error) {
        console.log('Catch', error)
        res.status(500).json({
            message: 'Erreur during article creation',
            error: error,
        })
    }
}

exports.putArticleById = async (req, res) => {
    const { articleId } = req.params
    const { title, content, cover, state } = req.body
    const ISOString = dayjs().toISOString()

    try {
        await ArticleModel.findOneAndUpdate({
            _id: articleId,
            title: title,
            content: content,
            cover: cover,
            state: state,
            lastUpdate: ISOString,
        })

        return res.status(200).json({
            message: 'Article récupéré avec succès',
            article: await ArticleModel.findOne({
                _id: articleId,
            }),
        })
    } catch (error) {
        console.log('Catch', error)
        res.status(500).json({
            message: 'Erreur during article update',
            error: error,
        })
    }
}

exports.getUserArticles = async (req, res) => {
    try {
        const articles = await ArticleModel.find({
            _writer: req.utilisateur._id,
        })

        return res
            .status(200)
            .json({ message: 'Articles récupérés avec succès', articles })
    } catch (error) {
        console.log('Catch', error)
        res.status(500).json({ message: 'Erreur serveur', error: error })
    }
}

exports.getUserArticlesPage = async (req, res) => {
    const { page, limit } = req.params

    try {
        const articles = await ArticleModel.find({
            _writer: req.utilisateur._id,
        })
            .skip(page * limit)
            .limit(limit)

        return res
            .status(200)
            .json({ message: 'Articles récupérés avec succès', articles })
    } catch (error) {
        console.log('Catch', error)
        res.status(500).json({ message: 'Erreur serveur', error: error })
    }
}
