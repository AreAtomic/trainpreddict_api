//* MODULES *//
const express = require('express')
const router = express.Router()
const { jwtauth } = require('../../../middlewares/auth.middleware')
//* MICROSERVICES *//
const ArticleControllers = require('../../controllers/articles')

//* ROUTES *//
router.post('/', [jwtauth], ArticleControllers.createArticle)
router.put('/:articleId', [jwtauth], ArticleControllers.putArticleById)
router.get('/:articleId', [jwtauth], ArticleControllers.getArticleById)
router.get('/:page/:limit', [jwtauth], ArticleControllers.getUserArticlesPage)

module.exports = router
