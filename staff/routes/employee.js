const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee');
const multer = require('../../lib/utils/multer-config');
const checkAccessToken = require('../../middlewares/checkAuthentication')

router.post('/', employeeController.createEmployee);
router.post('/list', multer.single('employeesFile'), employeeController.createEmployeesByFile);
router.get('/', checkAccessToken, employeeController.getAllEmployees);
router.get('/:uuid', employeeController.getEmployee);
router.delete('/:uuid', employeeController.deleteEmployee);
router.put('/:uuid', employeeController.updateEmployee);

module.exports = router;
