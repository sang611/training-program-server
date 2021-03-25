const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student');
const multer = require('../../lib/utils/multer-config');
const checkAccessToken = require('../../middlewares/checkAuthentication')
const employeeController = require("../controllers/employee");

router.post('/', studentController.createStudent);
// router.post('/list', multer.single('employeesFile'), employeeController.createEmployeesByFile);
router.get('/', checkAccessToken, studentController.getAllStudents);
// router.get('/:uuid', employeeController.getEmployee);
// router.delete('/:uuid', employeeController.deleteEmployee);
 router.put('/:uuid', employeeController.updateEmployee);
router.post('/course', studentController.addCourseToPlan);

router.post('/training-program/follow', studentController.joinTrainingProgram);
router.post('/training-program/unfollow', studentController.getOutTrainingProgram)

module.exports = router;
