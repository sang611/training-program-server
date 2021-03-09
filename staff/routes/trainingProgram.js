const express = require('express');
const trainingProgramController = require("../controllers/trainingProgram");
const multer = require('../../lib/utils/multer-config');
const router = express.Router();

router.post("/", trainingProgramController.createTrainingProgram);
router.get("/", trainingProgramController.getAllTrainingProgram);
router.get("/:uuid", trainingProgramController.getTrainingProgram);
router.put("/:uuid", trainingProgramController.updateTrainingProgram);
router.post("/courses", trainingProgramController.addCourseToTrainingProgram);
router.put("/courses/:trainingProgramUuid/:courseUuid", trainingProgramController.updateCourseToTrainingProgram);
router.post("/courses/file", multer.single('coursesFile'), trainingProgramController.addCourseToTrainingProgramByFile);
router.post("/learning-outcomes", trainingProgramController.addLocToTrainingProgram);

module.exports = router;

