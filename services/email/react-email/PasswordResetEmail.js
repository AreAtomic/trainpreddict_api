const React = require('react')
const { Heading, Section, Text } = require('@react-email/components')
const { TrainPredictLayout } = require('./TrainPredictLayout')
const { brand } = require('../brand')

const text = {
    margin: '0 0 16px',
    fontSize: '16px',
    lineHeight: '1.55',
    color: brand.primaryBlueDeep,
}

const codeBox = {
    backgroundColor: brand.pageBg,
    borderRadius: '10px',
    border: `1px solid ${brand.border}`,
    textAlign: 'center',
    padding: '20px 16px',
    margin: '24px 0',
}

const codeText = {
    margin: 0,
    fontSize: '28px',
    fontWeight: 700,
    letterSpacing: '0.25em',
    color: brand.accent,
    fontFamily: 'ui-monospace, Menlo, Monaco, Consolas, monospace',
}

function PasswordResetEmail({ firstName, code }) {
    const preview = `Code de réinitialisation TrainPredict`

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
            'Réinitialisation du mot de passe'
        ),
        React.createElement(Text, { style: text }, `Bonjour ${firstName},`),
        React.createElement(
            Text,
            { style: text },
            'Vous avez demandé à réinitialiser votre mot de passe. Utilisez le code ci-dessous dans l’application (il est valable pour une durée limitée) :'
        ),
        React.createElement(
            Section,
            { style: codeBox },
            React.createElement(Text, { style: codeText }, code)
        ),
        React.createElement(
            Text,
            { style: { ...text, fontSize: '13px', color: brand.mutedText } },
            'Si vous n’êtes pas à l’origine de cette demande, vous pouvez ignorer cet e-mail : votre mot de passe actuel reste inchangé.'
        )
    )
}

module.exports = { PasswordResetEmail }
