const Sequelize = require("sequelize");
const connection = require("../database/connection");

const LearningOutcomePLO_CLO = connection.sequelize.define("learning_outcome_plo_clo", {
    uuid: {
        type: Sequelize.UUID,
        primaryKey: true,
    },
});


module.exports = LearningOutcomePLO_CLO;
