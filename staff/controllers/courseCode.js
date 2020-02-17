const CourseCode = require('../../models/CourseCode');
const uuid = require('uuid/v4');
const messages = require('../../lib/constants/messages');
const constants = require('../../lib/constants/constants');

exports.createCourseCode = async (req, res) => {
  try {
    await CourseCode.create({
      uuid: uuid(),
      course_code: req.body.course_code,
      course_name_vi: req.body.course_name_vi,
      course_name_en: req.body.course_name_en,
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

exports.getAllCourseCode = async (req, res) => {
  try {
    const courseCodes = await CourseCode.findAll();
    res.status(200).json({
      courseCodes: courseCodes
    });
  }catch(error) {
    res.status(500).json({
      message: messages.MSG_CANNOT_GET + constants.COURSE_CODES
    });
  }
}

exports.deleteCourseCode = async (req, res) => {
  try {
    const courseCode = await CourseCode.findOne({
      where: {
        uuid: req.params.uuid
      }
    });
    if (!courseCode) {
      return res.status(404).json({
        message: constants.COURSE_CODE + messages.MSG_NOT_FOUND
      });
    }
    await CourseCode.destroy({
      where: {
        uuid: req.params.uuid
      }
    });
    res.status(200).json({
      message: messages.MSG_SUCCESS
    });
  } catch(error) {
    res.status(500).json({
      message: messages.MSG_CANNOT_DELETE + constants.COURSE_CODE
    });
  }
}

exports.updateCourseCode = async (req, res) => {
  try {
    const courseCode = await CourseCode.findOne({
      where: {
        uuid: req.params.uuid
      }
    });
    if (!courseCode) {
      return res.status(404).json({
        message: constants.COURSE_CODE + messages.MSG_NOT_FOUND
      });
    }
  
    await CourseCode.update(
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
      message: messages.MSG_CANNOT_UPDATE + constants.COURSE_CODE
    });
  }
}