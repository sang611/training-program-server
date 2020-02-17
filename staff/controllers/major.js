const Major = require('../../models/Major');
const uuid = require('uuid/v4');
const messages = require('../../lib/constants/messages');
const constants = require('../../lib/constants/constants');

exports.createMajor = async (req, res) => {
  try {
    await Major.create({
      uuid: uuid(),
      code: req.body.code,
      vn_name: req.body.vn_name,
      en_name: req.body.en_name,
      level: req.body.level
    })
    res.status(200).json({
      message: messages.MSG_SUCCESS
    });
  } catch(error) {
    res.status(500).json({
      message: messages.MSG_CANNOT_CREATE + constants.MAJOR
    });
  }
}

exports.getAllMajor = async (req, res) => {
  try {
    const majors = await Major.findAll();
    res.status(200).json({
      majors: majors
    });
  } catch(error) {
    res.status(500).json({
      message: messages.MSG_CANNOT_GET + constants.MAJORS
    });
  }
}

exports.deleteMajor = async (req, res) => {
  try {
    const major = await Major.findOne({
      where: {
        uuid: req.params.uuid
      }
    });
    if (!major) {
      return res.status(404).json({
        message: constants.MAJOR + messages.MSG_NOT_FOUND
      });
    }
    await Major.destroy({
      where: {
        uuid: req.params.uuid
      }
    })
    res.status(200).json({
      message: messages.MSG_SUCCESS
    });
  } catch(error) {
    res.status(500).json({
      message: messages.MSG_CANNOT_DELETE + constants.MAJOR
    });
  }
}

exports.updateMajor = async (req, res) => {
  try {
    const major = await Major.findOne({
      where: {
        uuid: req.params.uuid
      }
    });
    if (!major) {
      return res.status(404).json({
        message: constants.MAJOR + messages.MSG_NOT_FOUND
      });
    }
    await Major.update(
      {...req.body},
      {
        where: {
          uuid: req.params.uuid
        }
      }
    )
    res.status(200).json({
      message: messages.MSG_SUCCESS
    });
  } catch(error) {
    res.status(500).json({
      message: messages.MSG_CANNOT_UPDATE + constants.MAJOR
    });
  }
}