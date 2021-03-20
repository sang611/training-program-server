const Sequelize = require("sequelize");
const connection = require("../database/connection");

const OutlineLearningOutcome = connection.sequelize.define("outline_learning_outcome", {
    uuid: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    level: {
        type: Sequelize.INTEGER
    }

})

module.exports = OutlineLearningOutcome