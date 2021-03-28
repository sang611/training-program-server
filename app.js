const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");

const accountRoutes = require("./staff/routes/account");
const employeeRoutes = require("./staff/routes/employee");
const studentRoutes = require("./staff/routes/student");
const institutionRoutes = require("./staff/routes/institution");
const majorRoutes = require("./staff/routes/major");
const learningOutcomeRoutes = require("./staff/routes/learningOutcome");
const learningOutcomeTitleRoutes = require("./staff/routes/learningOutcomeTitle");
const courseCodeRoutes = require("./staff/routes/courseCode");
const courseRoutes = require("./staff/routes/course");
const documentRoutes = require("./staff/routes/document");
const trainingProgramRouter = require("./staff/routes/trainingProgram");
const outlineRouter = require("./staff/routes/outline")
const employeeCourseRouter = require('./staff/routes/employeeCourse')
const sync = require("./database/sync")

dotenv.config();
app.use(morgan("common"));
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json({limit:1024*1024*500, type:'application/json'}));
app.use(bodyParser.urlencoded({ extended:true,limit:1024*1024*20,type:'application/x-www-form-urlencoded' }));
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
      origin: ['http://localhost:3000', 'http://localhost:9999']
  })
);


app.use("/accounts", accountRoutes);
app.use("/employees", employeeRoutes);
app.use("/students", studentRoutes);
app.use("/institutions", institutionRoutes);
app.use("/majors", majorRoutes);
app.use("/learning-outcomes", learningOutcomeRoutes);
app.use("/learning-outcome-titles", learningOutcomeTitleRoutes);
app.use("/course-codes", courseCodeRoutes);
app.use("/courses", courseRoutes);
app.use("/documents", documentRoutes);
app.use("/training-programs", trainingProgramRouter);
app.use("/outlines", outlineRouter);
app.use("/employee-courses", employeeCourseRouter);

module.exports = app;
