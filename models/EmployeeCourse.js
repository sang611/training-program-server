const Sequelize = require("sequelize");
const connection = require("../database/connection");


const EmployeeCourse = connection.sequelize.define("employee_Course", {

  isModerator: {
    type: Sequelize.TINYINT(1),
  },
});

module.exports = EmployeeCourse;
