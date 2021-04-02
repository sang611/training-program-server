const express = require('express');
const router = express.Router();
const institutionController = require('../controllers/institution');
const checkAuth = require('../../middlewares/checkAuthentication');
const checkRole = require('../../middlewares/checkRole');
const roles = require('../../lib/constants/roles');
const multer = require('multer')();

router.post('/', checkAuth, multer.single('logo'),  institutionController.createInstitution);
router.get('/', checkAuth, checkRole(roles.ADMIN), institutionController.getAllInstitutions);
router.delete('/:uuid', checkAuth, institutionController.deleteInstitution);
router.put('/:uuid', checkAuth, multer.single('logo'), institutionController.updateInstitution);

module.exports = router;
