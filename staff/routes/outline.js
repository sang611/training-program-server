const express = require('express');
const outlineController = require("../controllers/outline");
const router = express.Router();
const checkAccessToken = require('../../middlewares/checkAuthentication')

router.post("/", checkAccessToken, outlineController.createOutline);
router.get("/:courseUuid", outlineController.getAllOutline);
router.get("/:courseUuid/:uuid", outlineController.getAnOutline);
router.delete("/:uuid", outlineController.deleteOutline);
router.post('/acception', outlineController.acceptUpdatedOutline)

module.exports = router;

