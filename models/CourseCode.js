const Sequelize = require('sequelize');
const connection = require('../database/connection');
const Course = require('./Course');

const CourseCode = connection.sequelize.define(
  'course_code',
  {
    uuid: {
      type: Sequelize.UUID,
      primaryKey: true
    },
    course_code: {
      type: Sequelize.STRING(7),
      unique: true,
    },
    course_name_vi: {
      type: Sequelize.STRING(200)
    },
    course_name_en: {
      type: Sequelize.STRING(200)
    },
    document_url: {
      type: Sequelize.TEXT
    }
  }
);


module.exports = CourseCode;