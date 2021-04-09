const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee');
const multerConfig = require('../../lib/utils/multer-config');
const multer = require('multer')();
const checkAccessToken = require('../../middlewares/checkAuthentication')

router.post('/', employeeController.createEmployee);
router.post('/list', multerConfig.single('employeesFile'), employeeController.createEmployeesByFile);
router.get('/', checkAccessToken, employeeController.getAllEmployees);
router.get('/:uuid', employeeController.getEmployee);
router.delete('/:uuid', employeeController.deleteEmployee);
router.put('/:uuid', employeeController.updateEmployee);

router.post('/:uuid/avatar', multerConfig.single('file'), employeeController.updateAvatar);

module.exports = router;
