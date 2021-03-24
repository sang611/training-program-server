const Account = require('../../models/Account');
const bcrypt = require('bcrypt');
const saltRounds = require('../../lib/constants/constants').SALT_ROUND;
const messages = require('../../lib/constants/messages');
const constants = require('../../lib/constants/constants');
const jwt = require('jsonwebtoken');
const Student = require("../../models/Student");
const Employee = require("../../models/Employee");
const Course = require("../../models/Course");
const Institution = require("../../models/Institution");

exports.login = async (req, res) => {
    try {
        const account = await Account.findOne({
            where: {
                username: req.body.username
            },
        });
        if (account) {
            const match = await bcrypt.compare(req.body.password, account.password);
            if (match) {
                const token = jwt.sign({
                        uuid: account.uuid,
                        username: account.username,
                        role: account.role
                    },
                    process.env.JWT_KEY,
                    {
                        algorithm: "HS256",
                        expiresIn: '2h',
                    },
                );

                res.cookie(constants.ACCESS_TOKEN, token, {
                    expires: new Date(Date.now() + constants.TOKEN_EXPIRES),
                    overwrite: true,
                });

                return res.status(200).json({
                    message: messages.MSG_SUCCESS,
                    account,
                    token
                });
            } else {
                return res.status(401).json({
                    message: messages.MSG_FAIL_LOGIN
                });
            }
        } else {
            return res.status(401).json({
                message: messages.MSG_FAIL_LOGIN
            });
        }
    } catch (error) {
        return res.status(401).json({
            message: messages.MSG_FAIL_LOGIN + error
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
                    bcrypt.hash(req.body.newPassword, saltRounds, async (err, hash) => {
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

exports.getAUser = async (req, res) => {
    const {accountUuid, role} = req.params;
    console.log(accountUuid, role)
    let user;

    try {
        if(role == 3) {
             user = await Student.findOne({
                where: {
                    accountUuid: accountUuid
                },
                 include: [
                     {
                         model: Course
                     },
                     {
                         model: Institution
                     }
                 ]
            })
        }
        if(role == 1 || role == 2) {
            user = await Employee.findOne(
                {
                    where: {
                        accountUuid: accountUuid
                    },
                    include: [
                        {
                            model: Institution
                        }
                    ]
                }
            )
        }
        if(user) {
            return res.status(200).json({
                user: user
            })
        }
       else {
            return res.status(404).json({
                message: "Không tìm thấy người dùng"
            })
        }
    } catch (e) {
        return res.status(500).json({
            message: "Đã có lỗi xảy ra" + e
        })
    }


}

