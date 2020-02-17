const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee');

router.post('/', employeeController.createEmployee);
router.get('/', employeeController.getAllEmployees);
router.get('/:uuid', employeeController.getEmployee);
router.delete('/:uuid', employeeController.deleteEmployee);
router.put('/:uuid', employeeController.updateEmployee);

module.exports = router;
