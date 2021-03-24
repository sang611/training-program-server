const Sequelize = require("sequelize");
const connection = require("../database/connection");

const LegalDocument = connection.sequelize.define("document", {
  uuid: {
    type: Sequelize.UUID,
    primaryKey: true,
  },
  name: {
    type: Sequelize.TEXT,
  },
  document_url: {
    type: Sequelize.TEXT('long'),
  },
  category: {
    type: Sequelize.TEXT,
  },
});

module.exports = LegalDocument;
