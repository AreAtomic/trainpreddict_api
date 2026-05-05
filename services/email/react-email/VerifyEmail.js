const React = require('react')
const { Button, Heading, Section, Text } = require('@react-email/components')
const { TrainPredictLayout } = require('./TrainPredictLayout')
const { brand } = require('../brand')

const text = {
    margin: '0 0 16px',
    fontSize: '16px',
    lineHeight: '1.55',
    color: brand.primaryBlueDeep,
}

const btn = {
    backgroundColor: brand.accent,
    borderRadius: '8px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 600,
    textDecoration: 'none',
    textAlign: 'center',
    display: 'inline-block',
    padding: '14px 28px',
}

const linkFallback = {
    margin: '0 0 8px',
    fontSize: '12px',
    lineHeight: '1.5',
    color: brand.mutedText,
    wordBreak: 'break-all',
}

function VerifyEmail({ firstName, verificationLink }) {
    const preview = `Validez votre compte TrainPredict — ${firstName}`

    return React.createElement(
        TrainPredictLayout,
        { previewText: preview },
        React.createElement(
            Heading,
            {
                as: 'h1',
                style: {
                    margin: '0 0 20px',
                    fontSize: '22px',
                    fontWeight: 700,
                    color: brand.primaryBlueDeep,
                    lineHeight: '1.3',
                },
            },
            'Confirmez votre adresse e-mail'
        ),
        React.createElement(Text, { style: text }, `Bonjour ${firstName},`),
        React.createElement(
            Text,
            { style: text },
            'Merci de vous être inscrit sur TrainPredict. Pour activer votre compte et accéder à votre planning, cliquez sur le bouton ci-dessous.'
        ),
        React.createElement(
            Section,
            { style: { textAlign: 'center', margin: '28px 0 8px' } },
            React.createElement(
                Button,
                { href: verificationLink, style: btn },
                'Valider mon compte'
            )
        ),
        React.createElement(
            Text,
            { style: { ...text, fontSize: '13px', color: brand.mutedText } },
            'Si vous n’êtes pas à l’origine de cette inscription, ignorez ce message.'
        ),
        React.createElement(
            Text,
            {
                style: {
                    ...text,
                    fontSize: '12px',
                    color: brand.mutedText,
                    marginTop: '24px',
                },
            },
            'Lien direct (si le bouton ne fonctionne pas) :'
        ),
        React.createElement(Text, { style: linkFallback }, verificationLink)
    )
}

module.exports = { VerifyEmail }
