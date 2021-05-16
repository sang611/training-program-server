const base64 = require('file-base64')
const uploadImageToStorage = require('../../lib/utils/uploadToFirebase')
const path = require('path')
const Document = require("../../models/Document");
const connection = require("../../database/connection");
const uuid = require("uuid/v4");
const messages = require("../../lib/constants/messages")
const constants = require("../../lib/constants/constants");
const fs = require('fs')
const {downloadFileFromDrive} = require("../../lib/drive");
const {google} = require("googleapis");
const {uploadFileToDrive} = require('../../lib/drive')
const constructSearchQuery = require('../../lib/utils/constructSearchQuery');

exports.uploadFile = async (req, res) => {
    let transaction;

    let file = req.file;
    const DIR = path.join(__dirname, '../../public/uploads/');
    let filePath = DIR + file.filename;
    let fileUrl;
    /*await uploadImageToStorage(file).then((success) => {
        fileUrl = success;
    }).catch((error) => {
        console.error(error);
    });*/

     uploadFileToDrive({
        name: file.filename,
        path: filePath,
        mimeType: file.mimetype
    }, async (fileId, thumbnailLink) => {

        try {
            transaction = await connection.sequelize.transaction();

            const document = await Document.create({
                uuid: uuid(),
                document_url: fileId,
                thumbnail_link: thumbnailLink,
                ...req.body
            }, {transaction})

            await transaction.commit();

            res.status(201).json({
                message: messages.MSG_SUCCESS,
                document
            })
        } catch (e) {
            if (transaction) {
                try {
                    await transaction.rollback();
                } catch (e) {
                    res.status(500).json({
                        message: e.toString(),
                    });
                }
            }
            res.status(500).json({
                message: messages.MSG_CANNOT_CREATE + constants.DOCUMENT + e,
            });
        }
    });



}

exports.downloadFile = async (req, res) => {
    let dir = `public/downloads`; // directory from where node.js will look for downloaded file from google drive
    let progress = 0; // This will contain the download progress amount

    try {
        downloadFileFromDrive(
            req.params.fileId,
            async (driveResponse) =>  {
                const beforePipe = driveResponse.data
                    .on('end', () => {
                        console.log('\nDone downloading file.');

                        let file = `${dir}/document.pdf`; // file path from where node.js will send file to the requested user

                        if(driveResponse.headers['content-type'] == 'application/msword') {
                            file = `${dir}/document.doc`
                        }
                        res.download(file); // Set disposition and send it.
                    })
                    .on('error', (err) => {
                        console.error('Error downloading file.');
                        res.status(500).json({
                            message: 'Error downloading file.'
                        })

                    })
                    .on('data', (d) => {
                        progress += d.length;
                        if (process.stdout.isTTY) {
                            process.stdout.clearLine();
                            process.stdout.cursorTo(0);
                            process.stdout.write(`Downloaded ${progress} bytes`);
                        }
                    });
                let dest = await fs.createWriteStream(`${dir}/document.pdf`); // file path where google drive function will save the file

                if(driveResponse.headers['content-type'] === 'application/msword') {
                    dest = await fs.createWriteStream(`${dir}/document.doc`)
                }
                
                beforePipe.pipe(dest);
            }
        )
    } catch (e) {
        return res.status(500).json({
            message: e.toString()
        })
    }


}

exports.getDocuments = async (req, res) => {
    const searchQuery = constructSearchQuery(req.query);
    const documents = await Document.findAll({
        where: {
            category: req.params.category,
            ...searchQuery
        }
    });
    return res.status(200).json(
        {
            documents: documents
        }
    )
}

exports.updateDocument = async (req, res) => {
    const {name, description} = req.body;
    const {uuid} = req.params;

    try {

        await Document.update(
            {
                name,
                description
            },
            {
                where: {
                    uuid: uuid
                }
            }
        )
        return res.status(200).json({
            message: messages.MSG_SUCCESS
        })
    } catch (e) {
        return res.status(500).json({
            message: messages.MSG_CANNOT_UPDATE + constants.DOCUMENT
        })
    }

}

exports.deleteDocument = async (req, res) => {
    const {uuid} = req.params;

    try {
        await Document.destroy(
            {
                where: {
                    uuid: uuid
                }
            }
        )
        return res.status(200).json({
            message: messages.MSG_SUCCESS
        })
    } catch (e) {
        return res.status(500).json({
            message: messages.MSG_CANNOT_DELETE + constants.DOCUMENT
        })
    }

}
