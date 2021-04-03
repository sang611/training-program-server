const express = require('express');
const trainingProgramController = require("../controllers/trainingProgram");
const multer = require('../../lib/utils/multer-config');
const checkAuth = require('../../middlewares/checkAuthentication');
const checkRole = require('../../middlewares/checkRole');
const roles = require('../../lib/constants/roles');
const router = express.Router();

router.post("/", checkAuth, trainingProgramController.createTrainingProgram);
router.get("/", checkAuth, trainingProgramController.getAllTrainingProgram);
router.get("/:uuid", checkAuth, trainingProgramController.getTrainingProgram);
router.put("/:uuid", checkAuth, trainingProgramController.updateTrainingProgram);
router.post("/courses", checkAuth, trainingProgramController.addCourseToTrainingProgram);

router.get("/:trainingProgramUuid/courses", trainingProgramController.getCourseOfTrainingProgram);
router.put("/:trainingProgramUuid/courses/:courseUuid", checkAuth, trainingProgramController.updateCourseToTrainingProgram);
router.put("/courses/:trainingProgramUuid/planning", checkAuth, trainingProgramController.updateTrainingSequence);
router.delete("/:trainingProgramUuid/courses/:courseUuid", checkAuth, trainingProgramController.deleteCourseToTrainingProgram);

router.post("/courses/file", checkAuth, multer.single('coursesFile'), trainingProgramController.addCourseToTrainingProgramByFile);
router.post("/learning-outcomes", checkAuth, checkRole(roles.ADMIN), trainingProgramController.addLocToTrainingProgram);

router.put("/:uuid/classes", checkAuth, checkRole(roles.ADMIN), trainingProgramController.addClassesToTrainingProgram)

module.exports = router;

