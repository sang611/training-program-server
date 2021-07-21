const express = require('express');
const router = express.Router();
const trainingProgramController = require('../controllers/trainingProgramType');

router.get('/type', trainingProgramController.getAllMajor);

module.exports = router;
