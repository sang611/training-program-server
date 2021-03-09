const express = require('express');
const router = express.Router();
const learningOutcomeTitleController = require('../controllers/learningOutcomeTitle');

router.post('/', learningOutcomeTitleController.createLearningOutcomeTitle);
router.get('/:category', learningOutcomeTitleController.getAllLearningOutcomeTitles);
router.delete('/:uuid', learningOutcomeTitleController.deleteLearningOutcomeTitle);
router.put('/:uuid', learningOutcomeTitleController.updateLearningOutcomeTitle);

module.exports = router;
