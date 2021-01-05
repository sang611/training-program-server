const Sequelize = require("sequelize");
const connection = require("../database/connection");
const Student = require("./Student");
const Course = require("./Course");

const StudentCourse = connection.sequelize.define("studentCourse", {
  result: {
    type: Sequelize.FLOAT,
  },
  planned: {
    type: Sequelize.TINYINT,
  },
  approved: {
    type: Sequelize.TINYINT,
  },
  semester: {
    type: Sequelize.TINYINT,
  },
  year: {
    type: Sequelize.TINYINT,
  },
});

module.exports = StudentCourse;
