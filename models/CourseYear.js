const Sequelize = require('sequelize');
const connection = require('../database/connection');

const CourseYear = connection.sequelize.define(
    'course_year',
    {
        uuid: {
            type: Sequelize.UUID,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING(500)
        },
        code: {
            type: Sequelize.STRING(15),
            unique: true
        },
        fromYear: {
            type: Sequelize.STRING(4)
        },
        toYear: {
            type: Sequelize.STRING(4)
        }
    }
)

module.exports = CourseYear;
