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




    /*const DIR = path.join(__dirname, '../../public/uploads/');
    let filePath = DIR + file.filename;


      base64.encode(filePath, async function(err, base64String) {
          try {
              fileUrl = base64String

              transaction = await connection.sequelize.transaction();

              await LegalDocument.create({
                  uuid: uuid(),
                  document_url: fileUrl,
                  name: file.filename
              }, {transaction})

              await transaction.commit();

              res.status(201).json({
                  message: messages.MSG_SUCCESS
              })
          }
          catch (e) {
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

    });*/


}

exports.downloadFile = async (req, res) => {
    let dir = `public/downloads`; // directory from where node.js will look for downloaded file from google drive

    let dest = fs.createWriteStream('public/downloads/tmp.pdf'); // file path where google drive function will save the file
    let progress = 0; // This will contain the download progress amount

    downloadFileFromDrive(
        req.params.fileId,
        (driveResponse) => {
            driveResponse.data
                .on('end', () => {
                    console.log('\nDone downloading file.');
                    const file = `${dir}/tmp.pdf`; // file path from where node.js will send file to the requested user
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
                })
                .pipe(dest);
        }
    )
}

exports.getDocuments = async (req, res) => {
    const documents = await Document.findAll({
        where: {
            category: req.params.category
        }
    });
    return res.status(200).json(
        {
            documents: documents
        }
    )
}
