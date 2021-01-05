const Sequelize = require("sequelize");
const connection = require("../database/connection");

const TrainingProgramCode = connection.sequelize.define("trainingProgramCode", {
  uuid: {
    type: Sequelize.UUID,
    primaryKey: true,
  },
  training_program_code: {
    type: Sequelize.TEXT,
  },
  document_url: {
    type: Sequelize.TEXT,
  },
});

module.exports = TrainingProgramCode;
