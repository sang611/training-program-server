const express = require('express');
const router = express.Router();

const checkAccessToken = require('../../middlewares/checkAuthentication')
const courseController = require("../controllers/course");
const multer = require('../../lib/utils/multer-config');

router.post("/", checkAccessToken, courseController.createCourse);
router.post('/list', multer.single('coursesFile'), courseController.createCoursesByFile);
router.get("/", courseController.getAllCourses);
router.get("/:uuid", courseController.getACourse);
router.put("/:uuid", courseController.updateCourse);
router.delete("/:uuid", courseController.deleteCourse);

module.exports = router;