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
const TrainingProgram = require("../../models/TrainingProgram");
const UpdatingTicket = require("../../models/UpdatingTicket");
const Major = require("../../models/Major");
const ActivityInformation = require("../../models/ActivityInformation");
const uuid = require("uuid");
const {Op} = require("sequelize");
const {sendMail} = require('../../lib/mailer/mailer')
const Sequelize = require('sequelize');
const ldap = require('ldapjs');

exports.login = async (req, res) => {

    try {
        const account = await Account.findOne({
            where: {
                username: req.body.username
            },
            include: [
                {
                    model: Student,
                },
                {
                    model: Employee
                }
            ]
        });
        if (account) {
            const match = await bcrypt.compare(req.body.password, account.password);

            if (match) {
                const token = jwt.sign({
                        uuid: account.uuid,
                        username: account.username,
                        role: account.role,
                    },
                    process.env.JWT_KEY,
                    {
                        algorithm: "HS256",
                        expiresIn: '2h',
                    },
                );

                let curentDate = `${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`;
                const activityInfo = await ActivityInformation.findOne({
                    where: {
                        date: curentDate,
                        role: account.role
                    }
                })

                if (account.role > 0) {
                    if (activityInfo) {
                        await ActivityInformation.update(
                            {
                                login_total: activityInfo.login_total + 1
                            },
                            {
                                where: {
                                    date: curentDate,
                                    role: account.role
                                }
                            }
                        )
                    } else {
                        await ActivityInformation.create({
                            uuid: uuid(),
                            date: curentDate,
                            login_total: 1,
                            role: account.role
                        })
                    }
                }

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

exports.loginWithLDAP = (req, res) => {

    const client = ldap.createClient({
        url: ['ldap://10.10.0.220:389']
    });

    const opts = {
        filter: `(uid=${req.body.username})`,
        scope: 'sub',
    };

    client.search("dc=vnu,dc=vn", opts, (err, response) => {
        console.log(err, response)
        let entries = [];
        if (err) {
            console.log(err)
            return res.status(401).json({
                message: err.toString()
            })
        } else {
            response.on('searchEntry', (entry) => {
                console.log('entry: ' + JSON.stringify(entry.object));

                entries.push(JSON.stringify(entry.object))
                client.bind(entry.object.dn, req.body.password, async (err) => {
                    if (err) {
                        console.log(err);
                        return res.status(401).json({
                            message: err
                        })
                    } else {
                        try {
                            const account = await Account.findOne({
                                where: {
                                    username: req.body.username
                                },
                                include: [
                                    {
                                        model: Student,
                                    },
                                    {
                                        model: Employee
                                    }
                                ]
                            });

                            if(!account) {
                                return res.status(401).json({
                                    message: messages.MSG_FAIL_LOGIN + error
                                });
                            }

                            const token = jwt.sign({
                                    uuid: account.uuid,
                                    username: account.username,
                                    role: account.role,
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
                        } catch (error) {
                            return res.status(401).json({
                                message: messages.MSG_FAIL_LOGIN + error
                            });
                        }
                    }
                });
            });
            response.on('searchReference', (referral) => {
                console.log('referral: ' + referral.uris.join());

            });
            response.on('error', (err) => {
                console.error('error: ' + err.message);
                return res.status(401).json({
                    message: err.message
                })
            });
            response.on('end', (result) => {
                console.log('status: ' + result.status);
                if(entries.length === 0) {
                    return res.status(401).json({
                        message: messages.MSG_FAIL_LOGIN
                    })
                }

            });
        }
    });

    client.on('error', (err) => {
        return res.status(401).json({
            message: err.toString()
        })
    })


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
                                message: "Đổi mật khẩu đăng nhập thành công. Mật khẩu sẽ có hiệu lực trong lần đăng nhập tiếp theo"
                            });
                        }
                    })
                } else {
                    return res.status(409).json({
                        message: "Mật khẩu cũ không chính xác!"
                    });
                }
            })
        } else {
            return res.status(404).json({
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
    const {accountUuid} = req.params;

    let user;

    try {

        const account = await Account.findOne({
            where: {
                uuid: accountUuid
            }
        })

        if (account) {
            let role = account.role;
            if (role == 3) {
                user = await Student.findOne({
                    where: {
                        accountUuid: accountUuid
                    },
                    include: [
                        {
                            model: Course
                        },
                        {
                            model: TrainingProgram,
                            include: [
                                {
                                    model: Course
                                },
                                {
                                    model: Institution
                                }
                            ]
                        },
                        {
                            model: Account,
                            attributes: [constants.UUID, constants.USERNAME, constants.ROLE],
                        },
                        {
                            model: Major
                        }
                    ]
                })
            } else {
                user = await Employee.findOne(
                    {
                        where: {
                            accountUuid: accountUuid
                        },
                        include: [
                            {
                                model: Institution
                            },
                            {
                                model: Course,
                                include: {
                                    model: Institution
                                }
                            },
                            {
                                model: Account,
                                attributes: [constants.UUID, constants.USERNAME, constants.ROLE],
                            },
                            {
                                model: UpdatingTicket
                            }
                        ]
                    }
                )
            }
            if (user) {
                return res.status(200).json({
                    user: user
                })
            } else {
                return res.status(404).json({
                    message: "Không tìm thấy người dùng"
                })
            }
        } else {
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

exports.updateRoleAccount = async (req, res) => {
    let transaction;
    try {
        const account = await Account.findOne({
            where: {
                uuid: req.params.uuid
            }
        });
        if (account) {
            let newRole = req.params.role;
            if (newRole < 1 || newRole > 4) {
                return res.status(409).json({
                    message: messages.MSG_CANNOT_UPDATE
                });
            } else {

                await Account.update(
                    {role: req.params.role},
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
        } else {
            return res.status(404).json({
                message: "Không tìm thấy người dùng"
            })
        }
    } catch (error) {
        return res.status(409).json({
            message: messages.MSG_CANNOT_UPDATE
        });
    }
}

exports.deleteAccount = async (req, res) => {
    try {
        const account = await Account.findOne({
            where: {
                uuid: req.params.uuid
            }
        });
        await Account.destroy({
            where: {
                uuid: req.params.uuid
            }
        })
    } catch (error) {
        return res.status(409).json({
            message: messages.MSG_CANNOT_DELETE
        });
    }
}

exports.updateUsernamePassword = async (req, res) => {
    let transaction;
    try {
        const account = await Account.findOne({
            where: {
                uuid: req.params.uuid
            }
        });

        if (account) {
            bcrypt.hash(req.body.newPassword, saltRounds, async (err, hash) => {
                if (err) {
                    return res.status(409).json({
                        message: messages.MSG_FAIL_CHANGE_PASS
                    });
                } else {
                    await Account.update(
                        {
                            password: hash,
                            username: req.body.newUsername
                        },
                        {
                            where: {
                                uuid: req.params.uuid
                            }
                        }
                    )

                    /*if (account.dataValues.role == 1 || account.dataValues.role == 2) {
                        await Employee.update({
                                vnu_mail: req.body.newUsername
                            },
                            {
                                where: {
                                    accountUuid: req.params.uuid
                                }
                            })
                    } else if (account.dataValues.role == 3) {
                        await Student.update({
                                vnu_mail: req.body.newUsername
                            },
                            {
                                where: {
                                    accountUuid: req.params.uuid
                                }
                            })
                    }*/

                    return res.status(200).json({
                        message: messages.MSG_SUCCESS
                    });
                }
            })
        } else {
            return res.status(409).json({
                message: messages.MSG_FAIL_CHANGE_LOGIN_INFORMATION
            });
        }
    } catch (error) {
        return res.status(409).json({
            message: messages.MSG_FAIL_CHANGE_LOGIN_INFORMATION
        });
    }
}

exports.resetPasswordByMail = async (req, res) => {
    try {
        let email = req.body.email;
        const account = await Account.findOne({
            where: {
                [Op.or]: [
                    {username: email},
                    {username: email.split("@")[0]}
                ]
            }

        })

        if (account) {
            const newRandomPassword = Math.random().toString(36).substr(2, 5);
            bcrypt.hash(newRandomPassword, saltRounds, async (err, hash) => {
                if (err) {
                    return res.status(409).json({
                        message: messages.MSG_FAIL_CHANGE_PASS
                    });
                } else {
                    await Account.update(
                        {password: hash},
                        {
                            where: {
                                [Op.or]: [
                                    {username: req.body.email},
                                    {username: req.body.email.split("@")[0]}
                                ]

                            }
                        }
                    )
                    if (!email.includes('@')) email += "@vnu.edu.vn";
                    sendMail(
                        email,
                        "Reset password",
                        `
                        <h3>Mật khẩu mới của bạn là: ${newRandomPassword}</h3>
                        <p>Đặt lại mật khẩu sau khi đăng nhập để đảm bảo an toàn.</p>
                        `
                    )
                    return res.status(200).json({
                        message: messages.MSG_SUCCESS
                    });
                }
            })
        } else {
            res.status(404).json({
                message: "Không tồn tại email này trong hệ thống"
            })
        }
    } catch (e) {
        res.status(500).json({
            message: e.toString()
        })
    }


}

exports.getActivityInfo = async (req, res) => {
    try {
        const infors = await ActivityInformation.findAll({
            where: Sequelize.where(Sequelize.fn('datediff', Sequelize.fn("NOW"), Sequelize.col('createdAt')), {
                [Op.lte]: 7 // OR [Op.gt] : 5
            }),
            order: [
                ['createdAt', 'ASC']
            ]
        });
        return res.status(200).json({
            infors
        })

    } catch (e) {
        return res.status(500).json({
            message: e.toString()
        })
    }
}
