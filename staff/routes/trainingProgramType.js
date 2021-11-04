const express = require('express');
const router = express.Router();
const trainingProgramTypeController = require('../controllers/trainingProgramType');
const majorController = require("../controllers/major");

router.get('/', trainingProgramTypeController.getAllTrainingProgramType);
router.post('/', trainingProgramTypeController.createTrainingType);
router.delete('/:uuid', trainingProgramTypeController.deleteTrainingType);
router.put('/:uuid', trainingProgramTypeController.updateTrainingType);

module.exports = router;
