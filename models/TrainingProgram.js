const Sequelize = require("sequelize");
const connection = require("../database/connection");

const TrainingProgram = connection.sequelize.define("trainingProgram", {
  uuid: {
    type: Sequelize.UUID,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
  },
  training_program_code: {
    type: Sequelize.STRING(10),
  },
  document_url: {
    type: Sequelize.TEXT,
  },
  graduation_title: {
    type: Sequelize.STRING,
  },
  graduation_diploma_vi: {
    type: Sequelize.STRING,
  },
  graduation_diploma_en: {
    type: Sequelize.STRING,
  },
  duration: {
    type: Sequelize.INTEGER,
  },
  admission_info: {
    type: Sequelize.TEXT,
  },
  lock_edit: {
    type: Sequelize.TINYINT,
  },
  created_date: {
    type: Sequelize.DATE,
  },
  modified_date: {
    type: Sequelize.DATE,
  },
});

module.exports = TrainingProgram;
