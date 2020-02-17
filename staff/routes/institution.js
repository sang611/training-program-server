const express = require('express');
const router = express.Router();
const institutionController = require('../controllers/institution');
const checkAuth = require('../../middlewares/checkAuthentication');
const checkRole = require('../../middlewares/checkRole');
const roles = require('../../lib/constants/roles');

router.post('/', institutionController.createInstitution);
router.get('/', checkAuth, checkRole(roles.MODERATOR), institutionController.getAllInstitutions);
router.delete('/:uuid', institutionController.deleteInstitution);
router.put('/:uuid', institutionController.updateInstitution);

module.exports = router;
