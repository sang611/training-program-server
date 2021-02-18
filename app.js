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
const courseCodeRoutes = require("./staff/routes/courseCode");
const legalDocumentRoutes = require("./staff/routes/legalDocument");
const trainingProgramRouter = require("./staff/routes/trainingProgram");
const sync = require("./database/sync")

dotenv.config();
app.use(morgan("common"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
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
app.use("/course-codes", courseCodeRoutes);
app.use("/documents", legalDocumentRoutes);
app.use("/training-programs", trainingProgramRouter);

module.exports = app;
