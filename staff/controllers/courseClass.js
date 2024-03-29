const CourseClass = require('../../models/CourseClass');
const uuid = require('uuid/v4');
const messages = require('../../lib/constants/messages');
const constants = require('../../lib/constants/constants');

exports.getAllCourseClass = async (req, res) => {
    try {
        const courseClasses = await CourseClass.findAll();
        res.status(200).json({
            courseClasses: courseClasses
        });
    } catch (error) {
        res.status(500).json({
            messages: messages.MSG_CANNOT_GET + constants.COURSE_CLASSES
        });
    }
}

exports.createCourseClass = async (req, res) => {
    try {
        await CourseClass.create({
            uuid: uuid(),
            code: req.body.code,
            name: req.body.name,
        })
        res.status(200).json({
            message: messages.MSG_SUCCESS
        });
    } catch(error) {
        res.status(500).json({
            message: messages.MSG_CANNOT_CREATE + constants.COURSE_CLASS
        });
    }
}

exports.deleteCourseClass = async (req, res) => {
    try {
        const courseClass = await CourseClass.findOne({
            where: {
                uuid: req.params.uuid
            }
        });
        if (!courseClass) {
            return res.status(404).json({
                message: constants.COURSE_CLASS + messages.MSG_NOT_FOUND
            });
        }
        await CourseClass.destroy({
            where: {
                uuid: req.params.uuid
            }
        })
        res.status(200).json({
            message: messages.MSG_SUCCESS
        });
    } catch(error) {
        res.status(500).json({
            message: messages.MSG_CANNOT_DELETE + constants.COURSE_CLASS
        });
    }
}

exports.updateCourseClass = async (req, res) => {
    try {
        const courseClass = await CourseClass.findOne({
            where: {
                uuid: req.params.uuid
            }
        });
        if (!courseClass) {
            return res.status(404).json({
                message: constants.COURSE_CLASS + messages.MSG_NOT_FOUND
            });
        }
        await CourseClass.update(
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
            message: messages.MSG_CANNOT_UPDATE + constants.COURSE_CLASS
        });
    }
}
