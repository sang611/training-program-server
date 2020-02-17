const express = require('express');
const router = express.Router();
const courseCodeController = require('../controllers/courseCode');

router.post('/', courseCodeController.createCourseCode);
router.get('/', courseCodeController.getAllCourseCode);
router.delete('/:uuid', courseCodeController.deleteCourseCode);
router.put('/:uuid', courseCodeController.updateCourseCode);

module.exports = router;
