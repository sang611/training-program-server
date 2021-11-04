const CourseYear = require('../../models/CourseYear');
const uuid = require('uuid/v4');
const messages = require('../../lib/constants/messages');
const constants = require('../../lib/constants/constants');

exports.getAllCourseYear = async (req, res) => {
    try {
        const courseYears = await CourseYear.findAll();
        res.status(200).json({
            courseYears: courseYears
        });
    } catch (error) {
        res.status(500).json({
            messages: messages.MSG_CANNOT_GET + constants.COURSE_YEARS
        });
    }
}

exports.createCourseYear = async (req, res) => {
    try {
        await CourseYear.create({
            uuid: uuid(),
            code: req.body.code,
            name: req.body.name,
            fromDate: req.body.fromDate,
            toDate: req.body.toDate,
        })
        res.status(200).json({
            message: messages.MSG_SUCCESS
        });
    } catch(error) {
        res.status(500).json({
            message: messages.MSG_CANNOT_CREATE + constants.COURSE_Year
        });
    }
}

exports.deleteCourseYear = async (req, res) => {
    try {
        const courseYear = await CourseYear.findOne({
            where: {
                uuid: req.params.uuid
            }
        });
        if (!courseYear) {
            return res.status(404).json({
                message: messages.MSG_NOT_FOUND + constants.COURSE_YEAR
            });
        }
        await CourseYear.destroy({
            where: {
                uuid: req.params.uuid
            }
        })
        res.status(200).json({
            message: messages.MSG_SUCCESS
        });
    } catch(error) {
        res.status(500).json({
            message: messages.MSG_CANNOT_DELETE + constants.COURSE_YEAR
        });
    }
}

exports.updateCourseYear = async (req, res) => {
    try {
        const courseYear = await CourseYear.findOne({
            where: {
                uuid: req.params.uuid
            }
        });
        if (!courseYear) {
            return res.status(404).json({
                message: messages.MSG_NOT_FOUND + constants.COURSE_YEAR
            });
        }
        await CourseYear.update(
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
            message: messages.MSG_CANNOT_UPDATE + constants.COURSE_YEAR
        });
    }
}
