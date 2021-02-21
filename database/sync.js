const connection = require("./connection");
const Employee = require("../models/Employee");
const Institution = require("../models/Institution");
const Student = require("../models/Student");
const Account = require("../models/Account");
const TrainingProgram = require("../models/TrainingProgram");
const Course = require("../models/Course");
const TrainingProgramCourse = require("../models/TrainingProgramCourse");
const LearningOutcome = require("../models/LearningOutcome");

Employee.belongsTo(Account);
Account.hasOne(Employee);

Student.belongsTo(Account);
Account.hasOne(Student);

Institution.hasMany(Employee);
Employee.belongsTo(Institution);

Institution.hasMany(Student);
Student.belongsTo(Institution);

Institution.hasMany(TrainingProgram);
TrainingProgram.belongsTo(Institution);

/*Institution.hasMany(Course);
Course.belongsTo(Institution);*/

TrainingProgram.belongsToMany(Course, { through: TrainingProgramCourse });
Course.belongsToMany(TrainingProgram, { through: TrainingProgramCourse });

LearningOutcome.hasMany(LearningOutcome,{foreignKey: 'parent_uuid'});
LearningOutcome.belongsTo(LearningOutcome,{foreignKey: 'parent_uuid'})


module.exports = connection.sequelize.sync({
    force: false
});