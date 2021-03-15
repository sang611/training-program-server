const Sequelize = require("sequelize");
const connection = require("../database/connection");
const TrainingProgram = require("./TrainingProgram");
const Course = require("./Course");

const TrainingProgramCourse = connection.sequelize.define(
    "training_program_course",
    {
        semester: {
            type: Sequelize.INTEGER
        },
        theory_time: {
            type: Sequelize.INTEGER
        },
        exercise_time: {
            type: Sequelize.INTEGER
        },
        practice_time: {
            type: Sequelize.INTEGER
        },
        course_type: {
            type: Sequelize.STRING
        },
        documents: {
            type: Sequelize.TEXT('long')
        },
        lecturers: {
            type: Sequelize.TEXT('long')
        }
    }
);

module.exports = TrainingProgramCourse;
