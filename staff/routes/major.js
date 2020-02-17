const express = require('express');
const router = express.Router();
const majorController = require('../controllers/major');

router.post('/', majorController.createMajor);
router.get('/', majorController.getAllMajor);
router.delete('/:uuid', majorController.deleteMajor);
router.put('/:uuid', majorController.updateMajor);

module.exports = router;
