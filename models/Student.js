const Sequelize = require("sequelize");
const connection = require("../database/connection");
const Account = require("./Account");

const Student = connection.sequelize.define("student", {
  uuid: {
    type: Sequelize.UUID,
    primaryKey: true,
  },
  fullname: {
    type: Sequelize.TEXT,
  },
  birth_date: {
    type: Sequelize.DATE,
  },
  student_code: {
    type: Sequelize.DATE,
  },
  email: {
    type: Sequelize.TEXT,
  },
  vnu_mail: {
    type: Sequelize.TEXT,
  },
  class: {
    type: Sequelize.TEXT,
  },
  note: {
    type: Sequelize.TEXT,
  },
  vnu_mail: {
    type: Sequelize.TEXT,
  },
});

Student.hasOne(Account);

module.exports = Student;
