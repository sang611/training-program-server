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
            messages: messages.MSG_CANNOT_GET + constants.COURSE_CLASS
        });
    }
}
