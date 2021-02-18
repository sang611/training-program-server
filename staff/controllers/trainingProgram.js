const TrainingProgram = require('../../models/TrainingProgram')
const messages = require('../../lib/constants/messages');
const constants = require('../../lib/constants/constants');
const uuid = require('uuid/v4');
const constructSearchQuery = require('../../lib/utils/constructSearchQuery');
const paginate = require('../../lib/utils/paginate');
const Institution = require("../../models/Institution");

exports.createTrainingProgram = async (req, res) => {
    try {
        await TrainingProgram.create({
            uuid: uuid(),
            vn_name: req.body.vn_name,
            en_name: req.body.en_name,
            training_program_code: req.body.training_program_code,
            graduation_title: req.body.graduation_title,
            duration: req.body.training_duration,
            graduation_diploma_vi: req.body.graduation_diploma_vi,
            graduation_diploma_en: req.body.graduation_diploma_en,
            institutionUuid: req.body.institution,
            common_destination: req.body.common_destination,
            specific_destination: req.body.specific_destination,
            admission_method: req.body.admission_method,
            admission_scale: req.body.admission_scale
        })

        res.status(201).json({
            message: messages.MSG_SUCCESS
        })
    } catch(error) {
        console.log(error);
        res.status(500).json({
            message: messages.MSG_CANNOT_CREATE + constants.TRAINING_PROGRAM
        });
    }
}

exports.getAllTrainingProgram = async (req, res) => {
    try {
        const searchQuery = constructSearchQuery(req.query);
        const trainingPrograms = await TrainingProgram.findAll({
            where: searchQuery,
            include: [
                {
                    model: Institution,
                    attributes: ['uuid', 'vn_name', 'en_name'],
                },
            ],
        });
        res.status(200).json({
            training_programs: trainingPrograms,
        });
    } catch(error) {
        res.status(500).json({
            message: messages.MSG_CANNOT_GET + constants.TRAINING_PROGRAM
        });
    }
}

exports.updateTrainingProgram = async (req, res) => {
    try {
        const trainingProgram = await TrainingProgram.findOne({
            where: {
                uuid: req.params.uuid
            }
        });
        if (!trainingProgram) {
            return res.status(404).json({
                message: constants.TRAINING_PROGRAM + messages.MSG_NOT_FOUND
            });
        }
        await TrainingProgram.update(
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
            message: messages.MSG_CANNOT_UPDATE + constants.TRAINING_PROGRAM
        });
    }
}

exports.deleteTrainingProgram = async (req, res) => {
    try {
        const trainingProgram = await TrainingProgram.findOne({
            where: {
                uuid: req.params.uuid
            }
        });
        if (!trainingProgram) {
            return res.status(404).json({
                message: constants.TRAINING_PROGRAM + messages.MSG_NOT_FOUND
            });
        }
        await TrainingProgram.destroy({
            where: {
                uuid: req.params.uuid
            }
        })
        res.status(200).json({
            message: messages.MSG_SUCCESS
        });
    } catch(error) {
        res.status(500).json({
            message: messages.MSG_CANNOT_DELETE + constants.TRAINING_PROGRAM
        });
    }
}