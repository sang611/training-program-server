const express = require('express');
const router = express.Router();
const courseYearController = require('../controllers/courseYear');

router.get('/', courseYearController.getAllCourseYear);
router.post('/', courseYearController.createCourseYear);
router.put('/:uuid', courseYearController.updateCourseYear);
router.delete('/:uuid', courseYearController.deleteCourseYear);

module.exports = router;
