const SibApiV3Sdk = require('sib-api-v3-sdk')
const defaultClient = SibApiV3Sdk.ApiClient.instance

const apiKey = defaultClient.authentications['api-key']
apiKey.apiKey = process.env.SENDINBLUE
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()

exports.validationEmail = (email, firstName, lastName, id) => {
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()

    sendSmtpEmail = {
        to: [
            {
                email: email,
                name: `${firstName} ${lastName}`,
            },
        ],
        templateId: 8,
        params: {
            PRENOM: firstName,
            LINK: `${process.env.APP_URL}/verification/${id}`,
            EMAIL: email,
        },
        headers: {
            'X-Mailin-custom':
                'custom_header_1:custom_value_1|custom_header_2:custom_value_2',
        },
    }

    apiInstance.sendTransacEmail(sendSmtpEmail).then(
        function (data) {
            console.log(
                'API called successfully. Returned data: ' +
                    JSON.stringify(data)
            )
            return
        },
        function (error) {
            console.error(error)
            throw error
        }
    )
}

exports.welcomeEmail = (email, firstName, lastName) => {
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()

    sendSmtpEmail = {
        to: [
            {
                email: email,
                name: `${firstName} ${lastName}`,
            },
        ],
        templateId: 7,
        params: {
            PRENOM: firstName,
            EMAIL: email,
        },
        headers: {
            'X-Mailin-custom':
                'custom_header_1:custom_value_1|custom_header_2:custom_value_2',
        },
    }

    apiInstance.sendTransacEmail(sendSmtpEmail).then(
        function (data) {
            console.log(
                'API called successfully. Returned data: ' +
                    JSON.stringify(data)
            )
            return
        },
        function (error) {
            console.error(error)
            throw error
        }
    )
}
