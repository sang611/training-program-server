const express = require('express');
const router = express.Router();
const institutionController = require('../controllers/institution');
const checkAuth = require('../../middlewares/checkAuthentication');
const checkRole = require('../../middlewares/checkRole');
const roles = require('../../lib/constants/roles');
const multer = require('multer')();

router.post('/', checkAuth, multer.single('logo'),  institutionController.createInstitution);
router.get('/', checkAuth, checkRole(roles.MODERATOR), institutionController.getAllInstitutions);
router.delete('/:uuid', institutionController.deleteInstitution);
router.put('/:uuid', multer.single('logo'), institutionController.updateInstitution);

module.exports = router;
