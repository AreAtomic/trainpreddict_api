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
    backgroundColor: brand.componentOne,
    borderRadius: '8px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 600,
    textDecoration: 'none',
    textAlign: 'center',
    display: 'inline-block',
    padding: '14px 28px',
}

function WelcomeEmail({ firstName, appUrl }) {
    const preview = `Bienvenue sur TrainPredict, ${firstName} !`
    const loginUrl = `${appUrl.replace(/\/$/, '')}/auth`

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
            'Bienvenue sur TrainPredict'
        ),
        React.createElement(Text, { style: text }, `Bonjour ${firstName},`),
        React.createElement(
            Text,
            { style: text },
            'Votre compte est désormais confirmé. Vous pouvez vous connecter pour suivre vos séances, vos objectifs et vos indicateurs de performance.'
        ),
        React.createElement(
            Section,
            { style: { textAlign: 'center', margin: '28px 0' } },
            React.createElement(
                Button,
                { href: loginUrl, style: btn },
                'Accéder à mon espace'
            )
        ),
        React.createElement(
            Text,
            { style: { ...text, fontSize: '13px', color: brand.mutedText } },
            'Bon courage pour vos prochaines sorties.'
        )
    )
}

module.exports = { WelcomeEmail }
