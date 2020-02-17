const Account = require('../../models/Account');
const bcrypt = require('bcrypt');
const saltRounds = require('../../lib/constants/constants').SALT_ROUND;
const messages = require('../../lib/constants/messages');
const constants = require('../../lib/constants/constants');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const account = await Account.findOne({
      where: {
        username: req.body.username
      }
    });
    if (account) {
      bcrypt.compare(req.body.password, account.password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: messages.MSG_FAIL_LOGIN
          });
        } 
        if (result) {
          const token = jwt.sign({
            uuid: account.uuid,
            username: account.username,
            role: account.role
          }, process.env.JWT_KEY
          );
          
          res.cookie(constants.ACCESS_TOKEN, token, {
            expires: new Date(Date.now() + constants.TOKEN_EXPIRES),
            overwrite: true,
          });
          
          return res.status(200).json({
            message: messages.MSG_SUCCESS,
            token
          });
        }
        return res.status(401).json({
          message: messages.MSG_FAIL_LOGIN
        });
      })
    } else {
      return res.status(401).json({
        message: messages.MSG_FAIL_LOGIN
      });
    }
  } catch (error) {
    return res.status(401).json({
      message: messages.MSG_FAIL_LOGIN
    });
  }
}

exports.changePassword = async (req, res) => {
  try {
    const account = await Account.findOne({
      where: {
        uuid: req.params.uuid
      }
    });
    if (account) {
      bcrypt.compare(req.body.oldPassword, account.password, (err, result) => {
        if (err) {
          return res.status(409).json({
            message: messages.MSG_FAIL_CHANGE_PASS
          });
        } 
        if (result) {
          bcrypt.hash(req.body.newPassword, saltRounds, async(err, hash) => {
            if (err) {
              return res.status(409).json({
                message: messages.MSG_FAIL_CHANGE_PASS
              });
            } else {
              await Account.update(
                {password: hash},
                {
                  where: {
                    uuid: req.params.uuid
                  }
                }
              )
              return res.status(200).json({
                message: messages.MSG_SUCCESS
              });
            }
          })
        }
      })
    } else {
      return res.status(409).json({
        message: messages.MSG_FAIL_CHANGE_PASS
      });
    }
  } catch (error) {
    return res.status(409).json({
      message: messages.MSG_FAIL_CHANGE_PASS
    });
  }
}

