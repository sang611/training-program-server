const Sequelize = require("sequelize");
const connection = require("../database/connection");
const Institution = require("./Institution");

const TrainingProgram = connection.sequelize.define("training_program", {
  uuid: {
    type: Sequelize.UUID,
    primaryKey: true,
  },
  vn_name: {
    type: Sequelize.STRING,
  },
  en_name: {
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
  training_duration: {
    type: Sequelize.FLOAT,
  },
  admission_method: {
    type: Sequelize.TEXT,
  },
  admission_scale: {
    type: Sequelize.TEXT,
  },
  common_destination: {
    type: Sequelize.TEXT
  },
  specific_destination: {
    type: Sequelize.TEXT
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
