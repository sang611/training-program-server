const Sequelize = require('sequelize');
const connection = require('../database/connection');

const LearningOutcome = connection.sequelize.define(
  'learning_outcome',
  {
    uuid: {
      type: Sequelize.UUID,
      primaryKey: true
    },
    content: {
      type: Sequelize.TEXT
    },
    parent_uuid: {
      type: Sequelize.UUID
    },
    order: {
      type: Sequelize.INTEGER
    }
  }
);

module.exports = LearningOutcome;