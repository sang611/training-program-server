const Sequelize = require("sequelize");
const connection = require("../database/connection");
const Student = require("./Student");
const Course = require("./Course");

const StudentTrainingProgram = connection.sequelize.define(
  "student_training_program",
  {
      uuid: {
          type: Sequelize.BIGINT,
          primaryKey: true,
          autoIncrement: true
      },
    startDate: {
      type: Sequelize.DATE,
    },
    endDate: {
      type: Sequelize.DATE,
    },
    type: {
      type: Sequelize.STRING(30),
    },
  }
);

module.exports = StudentTrainingProgram;
