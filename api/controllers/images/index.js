const ImageKit = require('imagekit')

const imageModel = require('../../../models/Images')

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
            if (error) {
                console.log('imageKit error -', error)
                return res.status(500).json({
                    error: 'Une erreur est survenue',
                    message: "Image kit n'a pas réussi a enregistrer l'image",
                })
            }

            imageModel
                .create({
                    _owner: req.utilisateur.id,
                    fileId: result.fileId,
                    name: result.name,
                    thumbnailUrl: result.thumbnailUrl,
                    url: result.url,
                })
                .then((image) => {
                    console.log(image)
                    return res
                        .status(200)
                        .json({ message: 'Image uploadée avec succès', image })
                })
                .catch((error) => {
                    console.log('mongoDB error -', error)
                    return res.status(500).json({
                        error: 'Une erreur est survenue',
                        message:
                            "Impossible d'enregistrer l'image sur notre base de données.",
                    })
                })
        }
    )
}
