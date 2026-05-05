//* MODULES *//
const express = require('express')
const router = express.Router()
const { jwtauth } = require('../../../middlewares/auth.middleware')
//* MICROSERVICES *//
const ArticleControllers = require('../../controllers/articles')

//* ROUTES *//
router.post('/', [jwtauth], ArticleControllers.createArticle)
router.put('/:articleId', [jwtauth], ArticleControllers.putArticleById)
router.get('/:articleId', ArticleControllers.getArticleById)
router.get(
    '/user/:page/:limit',
    [jwtauth],
    ArticleControllers.getUserArticlesPage
)
router.get('/:page/:limit', ArticleControllers.getAllArticlesPage)

module.exports = router
