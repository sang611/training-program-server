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
const Outline = require("../models/Outline");
const OutlineLearningOutcome = require("../models/OutlineLearningOutcome");
const StudentCourse = require("../models/StudentCourse");
const StudentTrainingProgram = require("../models/StudentTrainingProgram");
const EmployeeCourse = require("../models/EmployeeCourse");

Employee.belongsTo(Account);
Account.hasOne(Employee);

Student.belongsTo(Account);
Account.hasOne(Student);

Institution.hasMany(Employee);
Employee.belongsTo(Institution);

Employee.belongsToMany(Course, {through: EmployeeCourse});
Course.belongsToMany(Employee, {through: EmployeeCourse});

TrainingProgram.hasMany(Student);
Student.belongsTo(TrainingProgram);

Student.belongsToMany(Course, {through: StudentCourse});
Course.belongsToMany(Student, {through: StudentCourse});

Institution.hasMany(TrainingProgram);
TrainingProgram.belongsTo(Institution);

Institution.hasMany(Course);
Course.belongsTo(Institution);

TrainingProgram.belongsToMany(Course, { through: TrainingProgramCourse });
Course.belongsToMany(TrainingProgram, { through: TrainingProgramCourse });

TrainingProgram.belongsToMany(Student, {through: StudentTrainingProgram});
Student.belongsToMany(TrainingProgram, {through: StudentTrainingProgram})

TrainingProgram.belongsToMany(LearningOutcome, { through: TrainingProgramLearningOutcome, uniqueKey: 'trainingUuid_LocUuid' });
LearningOutcome.belongsToMany(TrainingProgram, { through: TrainingProgramLearningOutcome, uniqueKey: 'trainingUuid_LocUuid' });

LearningOutcomeTitle.hasMany(LearningOutcome);
LearningOutcome.belongsTo(LearningOutcomeTitle);

LearningOutcomeTitle.hasMany(LearningOutcomeTitle,{foreignKey: 'parent_uuid', as: 'children'});
LearningOutcomeTitle.belongsTo(LearningOutcomeTitle,{foreignKey: 'parent_uuid'});

LearningOutcome.belongsToMany(LearningOutcome,{ as: 'clos', through: LearningOutcomePLO_CLO});


Course.hasMany(Outline);
Outline.belongsTo(Course);

Outline.belongsToMany(LearningOutcome, { through: {model: OutlineLearningOutcome, unique: false} });
LearningOutcome.belongsToMany(Outline, { through: {model: OutlineLearningOutcome, unique: false} });



module.exports = connection.sequelize.sync({
    force: false
});