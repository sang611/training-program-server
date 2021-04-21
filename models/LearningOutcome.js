const Sequelize = require("sequelize");
const connection = require("../database/connection");

const LearningOutcome = connection.sequelize.define("learning_outcome", {
  uuid: {
    type: Sequelize.UUID,
    primaryKey: true,
  },
  content: {
    type: Sequelize.TEXT('long'),
  },
  order: {
    type: Sequelize.INTEGER,
  },
  category: {
    type: Sequelize.INTEGER
  },
  isLink: {
    type: Sequelize.BOOLEAN
  },
  title: {
    type: Sequelize.INTEGER
  }
});


module.exports = LearningOutcome;
