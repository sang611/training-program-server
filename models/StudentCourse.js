const Sequelize = require("sequelize");
const connection = require("../database/connection");
const Student = require("./Student");
const Course = require("./Course");

const StudentCourse = connection.sequelize.define("student_course", {
  uuid: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  completed: {
    type: Sequelize.TINYINT
  },
  working: {
    type: Sequelize.TINYINT
  },
  repeated: {
    type: Sequelize.TINYINT
  },
  improved: {
    type: Sequelize.TINYINT
  },
  semester: {
    type: Sequelize.INTEGER
  },
  isAccumulative: {
    type: Sequelize.INTEGER
  }
});

module.exports = StudentCourse;
