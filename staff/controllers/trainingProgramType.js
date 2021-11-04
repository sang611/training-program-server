const TrainingProgramType = require('../../models/TrainingProgramType');
const uuid = require('uuid/v4');
const messages = require('../../lib/constants/messages');
const constants = require('../../lib/constants/constants');
const Major = require("../../models/Major");

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

exports.createTrainingType = async (req, res) => {
    try {
        await TrainingProgramType.create({
            uuid: uuid(),
            code: req.body.code,
            vn_name: req.body.vn_name,
            en_name: req.body.en_name,

        })
        res.status(200).json({
            message: messages.MSG_SUCCESS
        });
    } catch (error) {
        res.status(500).json({
            message: messages.MSG_CANNOT_CREATE + constants.TRAINING_PROGRAM_TYPE
        });
    }
}

exports.deleteTrainingType = async (req, res) => {
    try {
        const trainingType = await TrainingProgramType.findOne({
            where: {
                uuid: req.params.uuid
            }
        });
        if (!trainingType) {
            return res.status(404).json({
                message:  messages.MSG_NOT_FOUND + constants.TRAINING_PROGRAM_TYPE
            });
        }
        await TrainingProgramType.destroy({
            where: {
                uuid: req.params.uuid
            }
        })
        res.status(200).json({
            message: messages.MSG_SUCCESS
        });
    } catch (error) {
        res.status(500).json({
            message: messages.MSG_CANNOT_DELETE + constants.TRAINING_PROGRAM_TYPE
        });
    }
}

exports.updateTrainingType = async (req, res) => {
    try {
        const trainingtype = await TrainingProgramType.findOne({
            where: {
                uuid: req.params.uuid
            }
        });
        if (!trainingtype) {
            return res.status(404).json({
                message: constants.TRAINING_PROGRAM_TYPE + messages.MSG_NOT_FOUND
            });
        }
        await TrainingProgramType.update(
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
    } catch (error) {
        res.status(500).json({
            message: messages.MSG_CANNOT_UPDATE + constants.TRAINING_PROGRAM_TYPE
        });
    }
}
