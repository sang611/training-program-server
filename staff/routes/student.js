const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student');
const multer = require('../../lib/utils/multer-config');
const checkAccessToken = require('../../middlewares/checkAuthentication')

router.post('/', studentController.createStudent);
// router.post('/list', multer.single('employeesFile'), employeeController.createEmployeesByFile);
router.get('/', checkAccessToken, studentController.getAllStudents);
// router.get('/:uuid', employeeController.getEmployee);
 router.delete('/:uuid', studentController.deleteStudent);
 router.put('/:uuid', studentController.updateStudent);
router.post('/course', studentController.addCourseToPlan);

router.post('/training-program/follow', studentController.joinTrainingProgram);
router.post('/training-program/unfollow', studentController.getOutTrainingProgram)

module.exports = router;
