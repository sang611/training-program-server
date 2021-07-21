const Sequelize = require('sequelize');
const connection = require('../database/connection');

const TrainingProgramType = connection.sequelize.define(
    'trainingprogramtype',
    {
      uuid: {
        type: Sequelize.UUID,
        primaryKey: true
      },
      code: {
        type: Sequelize.STRING(15),
        unique: true,
      },
      vn_name: {
        type: Sequelize.STRING(50)
      },
      en_name: {
        type: Sequelize.STRING(50)
      }
    }
)
