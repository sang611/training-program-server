const Sequelize = require('sequelize');
const connection = require('../database/connection');

const ActivityInformation = connection.sequelize.define(
    "activity_information",
    {
        uuid: {
            type: Sequelize.UUID,
            primaryKey: true
        },
        date: {
          type: Sequelize.STRING,
        },
        login_total: {
            type: Sequelize.BIGINT
        },
        role: {
            type: Sequelize.TINYINT(4)
        }
    }
)

module.exports = ActivityInformation
