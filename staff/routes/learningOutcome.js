const express = require('express');
const router = express.Router();
const learningOutcomeController = require('../controllers/learningOutcome');

router.post('/', learningOutcomeController.createLearningOutcome);
router.get('/', learningOutcomeController.getAllLearningOutcomes);
router.delete('/:uuid', learningOutcomeController.deleteLearningOutcome);
router.put('/:uuid', learningOutcomeController.updateLearningOutcome);

module.exports = router;
