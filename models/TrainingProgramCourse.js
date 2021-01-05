const Sequelize = require("sequelize");
const connection = require("../database/connection");

const TrainingProgramCourse = connection.sequelize.define(
  "trainingProgramCourse",
  {}
);

module.exports = TrainingProgramCourse;
