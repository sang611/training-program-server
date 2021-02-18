const express = require('express');
const router = express.Router();

const {createTrainingProgram, getAllTrainingProgram} = require("../controllers/trainingProgram")
router.post("/", createTrainingProgram);
router.get("/", getAllTrainingProgram);

module.exports = router;

