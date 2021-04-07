const Sequelize = require('sequelize');
const connection = require('../database/connection');

const UpdatingTicket = connection.sequelize.define(
    'updating_ticket',
    {
        uuid: {
            type: Sequelize.UUID,
            primaryKey: true
        },
        description: {
            type: Sequelize.TEXT('long')
        },
        edited_content: {
            type: Sequelize.TEXT('long')
        },
        is_accepted: {
            type: Sequelize.BOOLEAN
        }
    }
);

module.exports = UpdatingTicket;