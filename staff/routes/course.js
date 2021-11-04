const express = require('express');
const router = express.Router();

const checkAccessToken = require('../../middlewares/checkAuthentication')
const courseController = require("../controllers/course");
const multer = require('../../lib/utils/multer-config');

router.post("/", checkAccessToken, courseController.createCourse);
router.post('/list', multer.single('coursesFile'), courseController.createCoursesByFile);
router.get("/", checkAccessToken, courseController.getAllCourses);
router.get("/:uuid", checkAccessToken, courseController.getACourse);
router.put("/:uuid", checkAccessToken, courseController.updateCourse);
router.delete("/:uuid", checkAccessToken, courseController.deleteCourse);

module.exports = router;