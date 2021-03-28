const express = require('express');
const router = express.Router();
const employeeCourseController = require('../controllers/employeeCourse')

router.post('/assignment', employeeCourseController.assignCourse);
router.put('/grant', employeeCourseController.grantModerator)

module.exports = router;