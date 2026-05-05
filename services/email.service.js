const React = require('react')
const { Resend } = require('resend')
const { VerifyEmail } = require('./email/react-email/VerifyEmail')
const { WelcomeEmail } = require('./email/react-email/WelcomeEmail')
const { PasswordResetEmail } = require('./email/react-email/PasswordResetEmail')

let resendClient
function getResend() {
    const key = process.env.RESEND_API_KEY
    if (!key || !String(key).trim()) return null
    if (!resendClient) resendClient = new Resend(key)
    return resendClient
}

function getFrom() {
    const from = process.env.EMAIL_FROM
    if (!from) {
        throw new Error(
            'EMAIL_FROM manquant (ex. TrainPredict <noreply@votredomaine.com>)'
        )
    }
    return from
}

function send({ to, subject, react }) {
    const resend = getResend()
    if (!resend) {
        console.error(
            '[email] RESEND_API_KEY non défini — envoi ignoré (dev ?)'
        )
        return Promise.resolve({ skipped: true })
    }

    const payload = {
        from: getFrom(),
        to,
        subject,
        react,
    }
    if (process.env.EMAIL_REPLY_TO) {
        payload.replyTo = process.env.EMAIL_REPLY_TO
    }

    return resend.emails.send(payload).then(
        (result) => {
            if (result.error) {
                console.error('[email] Resend:', result.error)
                throw new Error(result.error.message || String(result.error))
            }
            return result
        },
        (err) => {
            console.error('[email] Resend:', err)
            throw err
        }
    )
}

exports.validationEmail = (email, firstName, lastName, id) => {
    const base = (process.env.APP_URL || '').replace(/\/$/, '')
    const verificationLink = `${base}/verification/${id}`

    return send({
        to: email,
        subject: 'Confirmez votre compte TrainPredict',
        react: React.createElement(VerifyEmail, {
            firstName,
            lastName,
            verificationLink,
        }),
    })
}

exports.welcomeEmail = (email, firstName, lastName) => {
    const appUrl = process.env.APP_URL || ''

    return send({
        to: email,
        subject: 'Bienvenue sur TrainPredict',
        react: React.createElement(WelcomeEmail, {
            firstName,
            lastName,
            appUrl,
        }),
    })
}

exports.passwordReinitialisation = (email, firstName, lastName, code) => {
    return send({
        to: email,
        subject: 'Réinitialisation de votre mot de passe TrainPredict',
        react: React.createElement(PasswordResetEmail, {
            firstName,
            lastName,
            code: String(code),
        }),
    })
}
