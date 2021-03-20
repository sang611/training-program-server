const express = require('express');
const router = express.Router();
const accountController = require('../controllers/account');
const checkAccessToken = require('../../middlewares/checkAuthentication')
const messages = require("../../lib/constants/messages");

router.post('/login', accountController.login);
router.post('/:uuid/change-password', accountController.changePassword);
router.post("/checkAccessToken", checkAccessToken, (req, res) => {
    res.json({message: messages.MSG_AUTHORIZED}
    )
})

router.get("/:accountUuid/:role", accountController.getAUser);

module.exports = router;
