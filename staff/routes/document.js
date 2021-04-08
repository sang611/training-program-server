const express = require('express');
const multerConfig = require('../../lib/utils/multer-config');
const multer = require('multer')()
const router = express.Router();
const documentController = require('../controllers/document')

router.post('/', multerConfig.single('file'), documentController.uploadFile)
router.get('/:category', documentController.getDocuments)
router.get('/downloadOneFile/:fileId', documentController.downloadFile)
router.put('/:uuid', documentController.updateDocument)
router.delete('/:uuid', documentController.deleteDocument)

module.exports = router;
