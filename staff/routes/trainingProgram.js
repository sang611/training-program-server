const express = require('express');
const trainingProgramController = require("../controllers/trainingProgram");
const multer = require('../../lib/utils/multer-config');
const checkAuth = require('../../middlewares/checkAuthentication');
const checkRole = require('../../middlewares/checkRole');
const router = express.Router();

router.post("/", checkAuth, checkRole, trainingProgramController.createTrainingProgram);
router.get("/", checkAuth, trainingProgramController.getAllTrainingProgram);
router.get("/:uuid", checkAuth, trainingProgramController.getTrainingProgram);
router.put("/:uuid", checkAuth, checkRole, trainingProgramController.updateTrainingProgram);
router.post("/courses", checkAuth, checkRole, trainingProgramController.addCourseToTrainingProgram);

router.get("/:trainingProgramUuid/courses", trainingProgramController.getCourseOfTrainingProgram);
router.put("/:trainingProgramUuid/courses/:courseUuid", checkAuth, checkRole,trainingProgramController.updateCourseToTrainingProgram);
router.put("/courses/:trainingProgramUuid/planning", checkAuth, checkRole, trainingProgramController.updateTrainingSequence);
router.delete("/:trainingProgramUuid/courses/:courseUuid", checkAuth, checkRole, trainingProgramController.deleteCourseToTrainingProgram);

router.post("/courses/file", checkAuth, checkRole, multer.single('coursesFile'), trainingProgramController.addCourseToTrainingProgramByFile);
router.post("/learning-outcomes", checkAuth, checkRole, trainingProgramController.addLocToTrainingProgram);

module.exports = router;

