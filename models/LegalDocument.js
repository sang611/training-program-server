const Sequelize = require("sequelize");
const connection = require("../database/connection");

const LegalDocument = connection.sequelize.define("legaldocument", {
  uuid: {
    type: Sequelize.UUID,
    primaryKey: true,
  },
  name: {
    type: Sequelize.TEXT,
  },
  created_date: {
    type: Sequelize.DATE,
  },
  modified_date: {
    type: Sequelize.DATE,
  },
  document_url: {
    type: Sequelize.TEXT,
  },
  category: {
    type: Sequelize.TEXT,
  },
});

module.exports = LegalDocument;
