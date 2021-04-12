const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student');
const multerConfig = require('../../lib/utils/multer-config');
const multer = require('multer')();
const checkAccessToken = require('../../middlewares/checkAuthentication')

router.post('/', studentController.createStudent);
router.post('/list', multerConfig.single('studentsFile'), studentController.createStudentsByFile);
router.get('/', checkAccessToken, studentController.getAllStudents);
// router.get('/:uuid', employeeController.getEmployee);
 router.delete('/:uuid', studentController.deleteStudent);
 router.put('/:uuid', studentController.updateStudent);
router.post('/:uuid/avatar', multer.single('file'), studentController.updateAvatar);
router.post('/course', studentController.addCourseToPlan);

router.post('/training-program/follow', studentController.joinTrainingProgram);
router.post('/training-program/unfollow', studentController.getOutTrainingProgram);

router.post('/course/copy-plan', studentController.copyPlan)

module.exports = router;
