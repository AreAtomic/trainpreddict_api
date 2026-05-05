const React = require('react')
const {
    Body,
    Container,
    Head,
    Html,
    Hr,
    Link,
    Preview,
    Section,
    Text,
} = require('@react-email/components')
const { brand } = require('../brand')

function TrainPredictLayout({ previewText, children }) {
    return React.createElement(
        Html,
        null,
        React.createElement(Head, null),
        React.createElement(Preview, null, previewText),
        React.createElement(
            Body,
            {
                style: {
                    backgroundColor: brand.pageBg,
                    margin: 0,
                    padding: '28px 14px',
                    fontFamily: brand.fontFamily,
                },
            },
            React.createElement(
                Container,
                {
                    style: {
                        maxWidth: '560px',
                        margin: '0 auto',
                        backgroundColor: brand.white,
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: '0 8px 32px rgba(10, 10, 61, 0.08)',
                    },
                },
                React.createElement(
                    Section,
                    {
                        style: {
                            background: `linear-gradient(135deg, ${brand.primaryBlueDeep} 0%, ${brand.primaryBlue} 55%, ${brand.componentOne} 100%)`,
                            padding: '22px 28px',
                            textAlign: 'center',
                        },
                    },
                    React.createElement(
                        Text,
                        {
                            style: {
                                margin: 0,
                                color: brand.white,
                                fontSize: '22px',
                                fontWeight: 700,
                                letterSpacing: '-0.02em',
                            },
                        },
                        'TrainPredict'
                    ),
                    React.createElement(
                        Text,
                        {
                            style: {
                                margin: '6px 0 0',
                                color: 'rgba(255,255,255,0.85)',
                                fontSize: '13px',
                                fontWeight: 500,
                            },
                        },
                        'Entraînement & prévisions'
                    )
                ),
                React.createElement(
                    Section,
                    { style: { padding: '32px 28px 12px' } },
                    children
                ),
                React.createElement(Hr, {
                    style: {
                        borderColor: brand.border,
                        borderWidth: '1px 0 0',
                        margin: '0 28px',
                    },
                }),
                React.createElement(
                    Section,
                    { style: { padding: '20px 28px 28px' } },
                    React.createElement(
                        Text,
                        {
                            style: {
                                margin: '0 0 8px',
                                fontSize: '12px',
                                color: brand.mutedText,
                                lineHeight: '1.5',
                            },
                        },
                        'Besoin d’aide ?'
                    ),
                    React.createElement(
                        Text,
                        { style: { margin: 0, fontSize: '12px' } },
                        React.createElement(
                            Link,
                            {
                                href: 'mailto:contact@trainpreddict.fr',
                                style: { color: brand.accent, fontWeight: 600 },
                            },
                            'contact@trainpreddict.fr'
                        )
                    )
                )
            )
        )
    )
}

module.exports = { TrainPredictLayout }
