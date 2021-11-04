const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee');
const multerConfig = require('../../lib/utils/multer-config');
const multer = require('multer')();
const checkAccessToken = require('../../middlewares/checkAuthentication')


router.post('/', employeeController.createEmployee);
router.post('/list', multerConfig.single('employeesFile'), employeeController.createEmployeesByFile);
router.get('/', checkAccessToken, employeeController.getAllEmployees);
router.get('/:uuid', checkAccessToken, employeeController.getEmployee);
router.delete('/:uuid', checkAccessToken, employeeController.deleteEmployee);
router.put('/:uuid', checkAccessToken, employeeController.updateEmployee);

router.post('/:uuid/avatar', checkAccessToken, multer.single('file'), employeeController.updateAvatar);

module.exports = router;
