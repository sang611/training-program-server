const Sequelize = require("sequelize");
const connection = require("../database/connection");

const LearningOutcomeTitle = connection.sequelize.define("learning_outcome_title", {
    uuid: {
        type: Sequelize.UUID,
        primaryKey: true,
    },
    content: {
        type: Sequelize.TEXT,
    },
    parent_uuid: {
        type: Sequelize.UUID,
    },
    order: {
        type: Sequelize.INTEGER,
    },
    category: {
        type: Sequelize.INTEGER
    }
});


module.exports = LearningOutcomeTitle;
