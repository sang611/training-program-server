const Sequelize = require("sequelize");
const connection = require("../database/connection");
const Account = require("./Account");
const Institution = require("./Institution")

const Student = connection.sequelize.define("student", {
    uuid: {
        type: Sequelize.UUID,
        primaryKey: true,
    },
    fullname: {
        type: Sequelize.TEXT,
    },
    gender: {
        type: Sequelize.TINYINT
    },
    birthday: {
        type: Sequelize.DATEONLY,
    },
    student_code: {
        type: Sequelize.TEXT,
    },
    email: {
        type: Sequelize.TEXT,
    },
    vnu_mail: {
        type: Sequelize.TEXT,
    },
    phone_number: {
        type: Sequelize.STRING(15),
    },
    class: {
        type: Sequelize.TEXT,
    },
    note: {
        type: Sequelize.TEXT,
    },

});

module.exports = Student;
