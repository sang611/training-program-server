const connection = require("./connection");
const Employee = require("../models/Employee");
const Institution = require("../models/Institution");
const Student = require("../models/Student");
const Account = require("../models/Account");
const TrainingProgram = require("../models/TrainingProgram");
const Course = require("../models/Course");
const TrainingProgramCourse = require("../models/TrainingProgramCourse");
const TrainingProgramLearningOutcome = require("../models/TrainingProgramLearningOutcome");
const LearningOutcome = require("../models/LearningOutcome");
const LearningOutcomeTitle = require("../models/LearningOutcomeTitle");
const LearningOutcomePLO_CLO = require("../models/LearningOutcomePLO_CLO");

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

TrainingProgram.belongsToMany(LearningOutcome, { through: TrainingProgramLearningOutcome });
LearningOutcome.belongsToMany(TrainingProgram, { through: TrainingProgramLearningOutcome });

LearningOutcomeTitle.hasMany(LearningOutcome);
LearningOutcome.belongsTo(LearningOutcomeTitle);

LearningOutcomeTitle.hasMany(LearningOutcomeTitle,{foreignKey: 'parent_uuid', as: 'children'});
LearningOutcomeTitle.belongsTo(LearningOutcomeTitle,{foreignKey: 'parent_uuid'});

LearningOutcome.belongsToMany(LearningOutcome,{foreignKey: 'uuid', as: 'children', through: LearningOutcomePLO_CLO});



module.exports = connection.sequelize.sync({
    force: false
});