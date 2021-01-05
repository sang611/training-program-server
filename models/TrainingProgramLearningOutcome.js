const Sequelize = require("sequelize");
const connection = require("../database/connection");

const TrainingProgramLearningOutcome = connection.sequelize.define(
  "trainingProgramLearningOutcome",
  {}
);

module.exports = TrainingProgramLearningOutcome;
