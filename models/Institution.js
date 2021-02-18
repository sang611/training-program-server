const Sequelize = require('sequelize');
const connection = require('../database/connection');
const Employee = require('./Employee');
const Student = require('./Student')
const Course = require('./Course');
const TrainingProgram = require("./TrainingProgram");

const Institution = connection.sequelize.define(
    'institution',
    {
        uuid: {
            type: Sequelize.UUID,
            primaryKey: true
        },
        vn_name: {
            type: Sequelize.STRING
        },
        en_name: {
            type: Sequelize.STRING,
        },
        abbreviation: {
            type: Sequelize.STRING(10),
        },
        address: {
            type: Sequelize.TEXT,
        },
        description: {
            type: Sequelize.TEXT,
        },
        parent_uuid: {
            type: Sequelize.UUID
        },
        logo: {
            type: Sequelize.STRING(255)
        }
    }
);

/*Institution.associate = (models) => {
    Institution.hasMany(models.Employee);

    Institution.hasMany(models.Student, {
        foreignKey: 'institutionUuid',
        sourceKey: 'uuid'
    });

    /!*Institution.hasMany(models.TrainingProgram, {
        foreignKey: 'institutionUuid',
        sourceKey: 'uuid'
    });*!/

    Institution.hasMany(models.Course);
}*/


module.exports = Institution;