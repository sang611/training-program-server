const Sequelize = require("sequelize");
const connection = require("../database/connection");
const TrainingProgram = require("./TrainingProgram");
const Course = require("./Course");

const TrainingProgramCourse = connection.sequelize.define(
    "training_program_course",
    {
        /*training_program_uuid: {
            type: Sequelize.UUID,
            references: {
                model: TrainingProgram,
                key: 'uuid'
            }
        },
        course_uuid: {
            type: Sequelize.UUID,
            references: {
                model: Course, 
                key: 'uuid'
            }
        },*/
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
        }
    }
);

module.exports = TrainingProgramCourse;
