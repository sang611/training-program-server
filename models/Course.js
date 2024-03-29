const Sequelize = require("sequelize");
const connection = require("../database/connection");

const Course = connection.sequelize.define("course", {
  uuid: {
    type: Sequelize.UUID,
    primaryKey: true,
  },
  course_code: {
    type: Sequelize.UUID,
    unique: true,
  },
  course_name_vi: {
    type: Sequelize.TEXT
  },
  course_name_en: {
    type: Sequelize.TEXT
  },
  credits: {
    type: Sequelize.INTEGER,
  },
  description: {
    type: Sequelize.TEXT,
  },
  requirement: {
    type: Sequelize.TEXT,
  },
  objective: {
    type: Sequelize.TEXT,
  },
  document_url: {
    type: Sequelize.TEXT,
  },
  required_course: {
    type: Sequelize.TEXT,
  },
});

module.exports = Course;
