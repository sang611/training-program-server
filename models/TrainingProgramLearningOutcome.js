const Sequelize = require("sequelize");
const connection = require("../database/connection");

const TrainingProgramLearningOutcome = connection.sequelize.define(
  "training_program_learning_outcome",
  {}
);

module.exports = TrainingProgramLearningOutcome;
