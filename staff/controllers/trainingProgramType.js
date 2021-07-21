const TrainingProgramType = require('../../models/TrainingProgramType');
const uuid = require('uuid/v4');
const  messages = require('../../lib/constants/messages');
const constants = require('../../lib/constants/constants');

exports.getAllTrainingProgramType = async (req, res) => {
  try {
    const trainingProgramTypes = await TrainingProgramType.findAll();
    res.status(200).json({
      trainingProgramTypes: trainingProgramTypes
    });
  } catch (error) {
    res.status(500).json({
      messages: messages.MSG_CANNOT_GET + constants.TYPE
    });
  }
}
