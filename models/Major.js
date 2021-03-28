const Sequelize = require('sequelize');
const connection = require('../database/connection');

const Major = connection.sequelize.define(
  'major',
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
    },
    level: {
      type: Sequelize.STRING(20)
    }
  }
);

module.exports = Major;