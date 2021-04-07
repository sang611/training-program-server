const express = require('express');
const router = express.Router();
const updatingTicketController = require('../controllers/updatingTicket');

router.get('/', updatingTicketController.getAllUpdatingTicket)


module.exports = router;