const Sequelize = require("sequelize");
const connection = require("../database/connection");

const LearningOutcome = connection.sequelize.define("learning_outcome", {
  uuid: {
    type: Sequelize.UUID,
    primaryKey: true,
  },
  content: {
    type: Sequelize.TEXT,
  },
  parent_uuid: {
    type: Sequelize.UUID,
  },
  order: {
    type: Sequelize.INTEGER,
  },
});

// ExaminationShift.belongsToMany(Course, { through: ExaminationShiftCourse });
// Course.belongsToMany(ExaminationShift, { through: ExaminationShiftCourse });

module.exports = LearningOutcome;
