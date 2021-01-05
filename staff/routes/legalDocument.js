const express = require("express");
const router = express.Router();
const legalDocumentController = require("../controllers/legalDocument");

router.post("/", legalDocumentController.createDocument);
// router.get('/', learningOutcomeController.getAllLearningOutcomes);
// router.delete('/:uuid', learningOutcomeController.deleteLearningOutcome);
// router.put('/:uuid', learningOutcomeController.updateLearningOutcome);

module.exports = router;
