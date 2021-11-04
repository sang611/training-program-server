const express = require('express');
const router = express.Router();
const accountController = require('../controllers/account');
const checkAccessToken = require('../../middlewares/checkAuthentication')
const messages = require("../../lib/constants/messages");

router.post('/login', accountController.login);
router.post('/loginWithLDAP', accountController.loginWithLDAP);
router.put('/:uuid/new-password', accountController.changePassword);
router.post("/checkAccessToken", checkAccessToken, (req, res) => {
    res.json({message: messages.MSG_AUTHORIZED}
    )
})

router.get("/:accountUuid", accountController.getAUser);

router.put("/moderator/:uuid/", checkAccessToken, accountController.setModerator);
router.put("/moderator/unset/:uuid/", checkAccessToken, accountController.unSetModerator);
router.delete("/account", checkAccessToken, accountController.deleteAccount);

router.put("/loginInformation/:uuid", checkAccessToken, accountController.updateUsernamePassword);
router.post("/password/reset", checkAccessToken, accountController.resetPasswordByMail);

router.get("/activity/information", checkAccessToken, accountController.getActivityInfo);


module.exports = router;
