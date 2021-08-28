const express = require('express');
const router = express.Router();
const courseClassController = require('../controllers/courseClass');

router.get('/course_class', courseClassController.getAllMajor);

module.exports = router;
