const Sequelize = require('sequelize');
const connection = require('../database/connection');
const Employee = require('./Employee');
const Course = require('./Course');

const Institution = connection.sequelize.define(
  'institution',
  {
    uuid: {
      type: Sequelize.UUID,
      primaryKey: true
    },
    vn_name: {
      type: Sequelize.STRING
    },
    en_name: {
      type: Sequelize.STRING,
    },
    abbreviation: {
      type: Sequelize.STRING(10),
    },
    address: {
      type: Sequelize.TEXT,
    },
    description: {
      type: Sequelize.TEXT,
    },
    parent_uuid: {
      type: Sequelize.UUID
    }
  }
);

Institution.hasMany(Employee);
Institution.hasMany(Course);

module.exports = Institution;