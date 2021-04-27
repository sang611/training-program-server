const Sequelize = require('sequelize');
const connection = require('../database/connection');
const Account = require('./Account');
const Institution = require("./Institution");

const Employee = connection.sequelize.define(
    'employee',
    {
        uuid: {
            type: Sequelize.UUID,
            primaryKey: true
        },
        fullname: {
            type: Sequelize.STRING,
        },
        birthday: {
            type: Sequelize.DATEONLY
        },
        gender: {
            type: Sequelize.STRING
        },
        academic_rank: {
            type: Sequelize.STRING(100),
        },
        academic_degree: {
            type: Sequelize.STRING(100),
        },
        email: {
            type: Sequelize.STRING,
        },
        vnu_mail: {
            type: Sequelize.STRING(50),
        },
        phone_number: {
            type: Sequelize.STRING(15),
        },
        note: {
            type: Sequelize.TEXT,
        },
        avatar: {
            type: Sequelize.TEXT('long'),
        },
    }
);


module.exports = Employee;
