const ImageKit = require('imagekit')

const imagekit = new ImageKit({
    publicKey: 'public_ynuaNRT7MIThLV7dVJz9cIxWCJI=',
    privateKey: 'private_ipWOhUhJDX/0rcZlaPCNS+r8ZSU=',
    urlEndpoint: 'https://ik.imagekit.io/uxdtlmk6c',
})

exports.uploadImage = (req, res) => {
    if (!req.files) {
        return res
            .status(400)
            .json({ error: 'Veuillez sélectionner un fichier' })
    }

    const file = req.files.file
    const fileName = file.name

    imagekit.upload(
        { file: file.data, fileName: fileName },
        (error, result) => {
            console.log(error, result)
            if (error) {
                console.log('File upload error', error)
                return res.status(500).json({
                    message:
                        "Une erreur est survenue durant l'upload de l'image",
                    error: error,
                })
            }

            return res
                .status(200)
                .json({ message: 'Image uploadée avec succès', result })
        }
    )
}
