const Sequelize = require("sequelize");
const connection = require("../database/connection");

const Document = connection.sequelize.define("document", {
  uuid: {
    type: Sequelize.UUID,
    primaryKey: true,
  },
  name: {
    type: Sequelize.TEXT,
  },
  description: {
    type: Sequelize.TEXT,
  },
  document_url: {
    type: Sequelize.TEXT,
  },

  thumbnail_link: {
    type: Sequelize.TEXT,
  },
  category: {
    type: Sequelize.TEXT,
  },
  resourceUuid: {
    type: Sequelize.UUID
  }
});

module.exports = Document;
