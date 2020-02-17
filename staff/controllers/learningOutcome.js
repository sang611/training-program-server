const LearningOutcome = require('../../models/LearningOutcome');
const uuid = require('uuid/v4');
const messages = require('../../lib/constants/messages');
const constants = require('../../lib/constants/constants');
const Op = require('sequelize').Op

exports.createLearningOutcome = async (req, res) => {
  try {
    if (req.body.parent_uuid) {
      const parent = await LearningOutcome.findOne({
        where: {
          uuid: req.body.parent_uuid
        }
      });
      if (!parent) {
        return res.status(404).json({
          message: constants.PARENT + messages.MSG_NOT_FOUND
        });
      }
    }
    await LearningOutcome.create({
      uuid: uuid(),
      parent_uuid: req.body.parent_uuid,
      content: req.body.content,
      order: req.body.order,
    })
    res.status(200).json({
      message: messages.MSG_SUCCESS
    });
  } catch(error) {
    res.status(500).json({
      message: messages.MSG_CANNOT_CREATE + constants.LEARNING_OUTCOME
    });
  }
}

exports.getAllLearningOutcomes = async (req, res) => {
  try {
    const learningOutcomes = await LearningOutcome.findAll({
      order: [[constants.ORDER, constants.ASC]]
    });
    res.status(200).json({
      learningOutcomes: learningOutcomes
    });
  } catch(error) {
    res.status(500).json({
      message: messages.MSG_CANNOT_GET + constants.LEARNING_OUTCOMES
    });
  }
}

exports.deleteLearningOutcome = async (req, res) => {
  try {
    const learningOutcome = await LearningOutcome.findOne({
      where: {
        uuid: req.params.uuid
      }
    });
    if (!learningOutcome) {
      return res.status(404).json({
        message: constants.LEARNING_OUTCOME + messages.MSG_NOT_FOUND
      });
    }
    //delete all children as well
    await LearningOutcome.destroy({
      where: {
        [Op.or]: [
          {
            uuid: req.params.uuid
          },
          {
            parent_uuid: req.params.uuid
          }
        ]
      }
    });
    res.status(200).json({
      message: messages.MSG_SUCCESS
    });
  } catch(error) {
    res.status(500).json({
      message: messages.MSG_CANNOT_DELETE + constants.LEARNING_OUTCOME
    });
  }
}

exports.updateLearningOutcome = async (req, res) => {
  try {
    const learningOutcome = await LearningOutcome.findOne({
      where: {
        uuid: req.params.uuid
      }
    });
    if (!learningOutcome) {
      return res.status(404).json({
        message: constants.LEARNING_OUTCOME + messages.MSG_NOT_FOUND
      });
    }
    if (req.body.parent_uuid) {
      const parent = await LearningOutcome.findOne({
        where: {
          uuid: req.body.parent_uuid
        }
      });
      if (!parent) {
        return res.status(404).json({
          message: constants.PARENT + messages.MSG_NOT_FOUND
        });
      }
    }
    await learningOutcome.update(
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
      message: messages.MSG_CANNOT_UPDATE + constants.LEARNING_OUTCOME
    });
  }
}