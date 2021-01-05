const LegalDocument = require("../../models/LegalDocument");
const uuid = require("uuid/v4");
const messages = require("../../lib/constants/messages");
const constants = require("../../lib/constants/constants");

exports.createDocument = async (req, res) => {
  try {
    await LegalDocument.create({
      uuid: uuid(),
      name: req.body.name,
      created_date: req.body.created_date,
      modified_date: req.body.modified_date,
      document_url: req.body.document_url,
      category: req.body.category,
    });
    res.status(200).json({
      message: messages.MSG_SUCCESS,
    });
  } catch (error) {
    res.status(500).json({
      message: messages.MSG_CANNOT_CREATE + constants.MAJOR,
    });
  }
};
