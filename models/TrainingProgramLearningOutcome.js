const Sequelize = require("sequelize");
const connection = require("../database/connection");

const TrainingProgramLearningOutcome = connection.sequelize.define(
  "training_program_learning_outcome",
  {
      uuid: {
          type: Sequelize.BIGINT,
          primaryKey: true,
          autoIncrement: true
      }
  }
);

module.exports = TrainingProgramLearningOutcome;
