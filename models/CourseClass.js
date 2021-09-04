const Sequelize = require('sequelize');
const connection = require('../database/connection');

const CourseClass = connection.sequelize.define(
    'course_class',
    {
        uuid: {
            type: Sequelize.UUID,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING(15)
        },
        code: {
            type: Sequelize.STRING(15),
            unique: true
        },
        class_size: {
            type: Sequelize.INTEGER
        },
        classroom: {
            type: Sequelize.STRING(15)
        },
        class_schedule: {
            type: Sequelize.STRING(50)
        }
    }
)

module.exports = CourseClass;
