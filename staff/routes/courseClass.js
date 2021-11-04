const express = require('express');
const router = express.Router();
const courseClassController = require('../controllers/courseClass');

router.get('/', courseClassController.getAllCourseClass);
router.post('/', courseClassController.createCourseClass);
router.put('/:uuid', courseClassController.updateCourseClass);
router.delete('/:uuid', courseClassController.deleteCourseClass);

module.exports = router;
