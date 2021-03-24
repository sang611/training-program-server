const Sequelize = require("sequelize");
const connection = require("../database/connection");

const OutlineLearningOutcome = connection.sequelize.define("outline_learning_outcome", {

    level: {
        type: Sequelize.INTEGER
    }

})

module.exports = OutlineLearningOutcome