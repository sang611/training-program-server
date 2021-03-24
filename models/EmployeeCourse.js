const Sequelize = require("sequelize");
const connection = require("../database/connection");
const Employee = require("./Employee");
const Course = require("./Course");

const EmployeeCourse = connection.sequelize.define("employeeCourse", {

  role: {
    type: Sequelize.STRING(50),
  },
});

module.exports = EmployeeCourse;
