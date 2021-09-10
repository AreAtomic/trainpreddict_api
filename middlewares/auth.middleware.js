const jwt = require('jsonwebtoken')
const Utilisateur = require('../models/Utilisateur')
const s3cr3tok3n = "=)BPJ4][!&=iF!st#mOt,JY<u94gMr*zLVF:592ga4fvyk.n(&sr((xj8F}be4%"

let verifyToken = (token, next) => {
    try {
        var decoded = jwt.verify(token, s3cr3tok3n)
        return { ...decoded, expired: false }
    } catch (err) {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                var decoded = jwt.decode(token)
                if (decoded) {
                    return { ...decoded, expired: true }
                } else return false
            } else return false
        }
    }
}

let tokenValidation = async (req, res, next) => {
    let token = req.headers['x-access-token']
    if (token) {
        req.token = token
        try {
            const decodedToken = verifyToken(req.token, next)
            console.log(decodedToken)
            if (!decodedToken) {
                res.status(400).json({
                    status: 400,
                    message: 'User does not have  token',
                })
            } else if (decodedToken.expired) {
                let decoded = jwt.decode(token)

                let utilisateur = await Utilisateur.findOne({
                    _id: decoded._id,
                })

                utilisateur.token = jwt.sign(
                    { id: utilisateur._id },
                    s3cr3tok3n,
                    { expiresIn: '10d' }
                )
                req.utilisateur = {
                    _id: utilisateur._id,
                    email: utilisateur.email,
                    prenom: utilisateur.prenom,
                    nom: utilisateur.prenom,
                    token: utilisateur.token,
                }
                next()
            } else {
                let utilisateur = await Utilisateur.findOne({
                    _id: decodedToken.id,
                })
                utilisateur.token = req.token
                req.utilisateur = {
                    _id: utilisateur._id,
                    email: utilisateur.email,
                    prenom: utilisateur.prenom,
                    nom: utilisateur.prenom,
                    token: utilisateur.token,
                }
                next()
            }
        } catch (err) {
            res.status(400).json({
                status: 400,
                message: 'Error with your token',
            })
        }
    } else {
        res.status(400).json({
            status: 400,
            message: 'User does not have token',
        })
    }
}

module.exports.jwtauth = tokenValidation
