const express = require('express');
const outlineController = require("../controllers/outline");
const router = express.Router();
const checkAccessToken = require('../../middlewares/checkAuthentication')
const checkCourseGrant  =require('../../middlewares/checkCourseGrant')

router.post("/", checkAccessToken, outlineController.createOutline);
router.get("/:courseUuid", checkAccessToken, checkCourseGrant, outlineController.getAllOutline);
router.get("/:courseUuid/:uuid", checkAccessToken, checkCourseGrant, outlineController.getAnOutline);
router.delete("/:uuid", outlineController.deleteOutline);
router.put("/:uuid", outlineController.updateOutline);
router.post('/acception', outlineController.acceptUpdatedOutline)

module.exports = router;

