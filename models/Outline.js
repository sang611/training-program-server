const Sequelize = require("sequelize");
const connection = require("../database/connection");

const Outline = connection.sequelize.define("outline", {
    uuid: {
        type: Sequelize.UUID,
        primaryKey: true,
    },
    lecturers: {
        type: Sequelize.TEXT
    },
    goal: {
        type: Sequelize.TEXT
    },
    locs: {
        type: Sequelize.TEXT
    },
    summary_content: {
        type: Sequelize.TEXT
    },
    detail_content: {
        type: Sequelize.TEXT('long')
    },
    documents: {
        type: Sequelize.TEXT('long')
    },
    teachingFormality: {
        type: Sequelize.TEXT('long')
    },
    coursePolicy: {
        type: Sequelize.TEXT('long')
    },
    examFormality: {
        type: Sequelize.TEXT('long')
    },
    createdBy: {
        type: Sequelize.TEXT
    },
    description_edit: {
        type: Sequelize.TEXT('long')
    }
})

module.exports = Outline