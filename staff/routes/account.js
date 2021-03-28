const express = require('express');
const router = express.Router();
const accountController = require('../controllers/account');
const checkAccessToken = require('../../middlewares/checkAuthentication')
const messages = require("../../lib/constants/messages");

router.post('/login', accountController.login);
router.put('/:uuid/new-password', accountController.changePassword);
router.post("/checkAccessToken", checkAccessToken, (req, res) => {
    res.json({message: messages.MSG_AUTHORIZED}
    )
})

router.get("/:accountUuid", accountController.getAUser);
router.put("/changeRole/:uuid/:role", accountController.updateRoleAccount);
router.delete("/account", accountController.deleteAccount);

router.put("/loginInformation/:uuid", accountController.updateUsernamePassword);

module.exports = router;
