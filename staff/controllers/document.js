const base64 = require('file-base64')
const uploadImageToStorage = require('../../lib/utils/uploadToFirebase')
const path = require('path')
const Document = require("../../models/Document");
const connection = require("../../database/connection");
const uuid = require("uuid/v4");
const messages = require("../../lib/constants/messages")
const constants = require("../../lib/constants/constants");
const fs = require('fs')
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
    }, async (fileId) => {
        req.fileId = fileId

        try {
            transaction = await connection.sequelize.transaction();

            const document = await Document.create({
                uuid: uuid(),
                document_url: req.fileId,
                name: req.body.name
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

exports.getDocuments = async (req, res) => {
    const documents = await Document.findAll({});
    return res.status(200).json(
        {
            documents: documents
        }
    )
}
